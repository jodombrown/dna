import React, { useMemo, useState } from "react";

/**
 * Calculator Test Page — Lactation Visit Out-of-Pocket Estimator
 * Single-file React component you can paste into Lovable.dev.
 *
 * How to use (Lovable + Vite/React):
 * 1) Create a new file, e.g., src/pages/CalculatorTestPage.tsx
 * 2) Paste this entire file.
 * 3) Add a route to it (example):
 *    <Route path="/calc-test" element={<AppShell><CalculatorTestPage /></AppShell>} />
 * 4) Visit /calc-test to test. Delete later when done.
 *
 * Notes:
 * - Pure, in-file estimator logic + sensible defaults (no DB required).
 * - Mobile-first, Tailwind-based UI. No external UI deps.
 */

// -------------------- Types --------------------
export type VisitType = "initial" | "followup" | "virtual";
export type InsuranceType = "private" | "medicaid" | "aca" | "other";
export type DeductibleStatus = "met" | "not_met" | "unknown";

export type InsuranceInputs = {
  hasInsurance: boolean;
  insuranceType?: InsuranceType;      // required if hasInsurance
  deductibleStatus?: DeductibleStatus;// met | not_met | unknown
  deductibleRemaining?: number;       // optional, dollars
  copayKnown?: number;                // optional, dollars
  outOfNetwork?: boolean;             // default false
};

export type EstimatorInputs = {
  visitType: VisitType;
  location?: { state?: string; zip?: string };
  insurance: InsuranceInputs;
};

export type Range = { min: number; max: number };

export type EstimateBreakdown = {
  allowedAmount: number;          // negotiated/allowed rate (post region/o.o.n)
  copay: Range;
  deductibleApplied: Range;
  coinsurance: Range;
  regionMultiplierApplied: number;
  outOfNetworkMultiplierApplied: number;
  notes: string[];
  assumptions: string[];
  possibleZeroCost: boolean;      // ACA preventive coverage may apply
};

export type EstimateResult = {
  currency: "USD";
  estimate: Range;                // out-of-pocket estimate
  breakdown: EstimateBreakdown;
  disclaimer: string;
};

export type Config = {
  visits: Record<
    VisitType,
    {
      selfPay: number; // e.g., 175 for initial, 125 follow-up, 95 virtual
      allowedRatePctByInsurance?: Partial<Record<InsuranceType, number>>; // e.g., private: 0.7
    }
  >;
  insuranceDefaults: Record<
    InsuranceType,
    {
      coveragePctRange: [number, number]; // 0..1 (payer portion)
      copayRange: [number, number];       // dollars
      typicalDeductibleRemaining?: number;// dollars (heuristic if user unknown)
      notes?: string;
    }
  >;
  regionModifiers?: Array<{
    state?: string;
    zipPrefix?: string; // first 3 digits, e.g., "900"
    multiplier: number; // e.g., 0.95..1.20
    active?: boolean;
  }>;
  outOfNetworkMultiplier: number;  // e.g., 1.25
  roundingToNearest: number;       // e.g., 1 or 5
  acaZeroCostHintEnabled: boolean; // show $0-possibility hint when applicable
};

// -------------------- Defaults --------------------
const defaultConfig: Config = {
  visits: {
    initial:  { selfPay: 175, allowedRatePctByInsurance: { private: 0.7, medicaid: 1.0, aca: 0.75, other: 0.8 } },
    followup: { selfPay: 125, allowedRatePctByInsurance: { private: 0.7, medicaid: 1.0, aca: 0.75, other: 0.8 } },
    virtual:  { selfPay:  95, allowedRatePctByInsurance: { private: 0.7, medicaid: 1.0, aca: 0.75, other: 0.8 } },
  },
  insuranceDefaults: {
    private:  { coveragePctRange: [0.7, 0.9], copayRange: [15, 45], typicalDeductibleRemaining: 500 },
    medicaid: { coveragePctRange: [1.0, 1.0], copayRange: [0, 5],   typicalDeductibleRemaining: 0, notes: "Often $0 OOP in-network." },
    aca:      { coveragePctRange: [0.8, 1.0], copayRange: [0, 30],  typicalDeductibleRemaining: 350, notes: "ACA preventive benefits may apply." },
    other:    { coveragePctRange: [0.6, 0.8], copayRange: [20, 60], typicalDeductibleRemaining: 600 },
  },
  regionModifiers: [
    { state: "CA", multiplier: 1.05, active: true },
  ],
  outOfNetworkMultiplier: 1.25,
  roundingToNearest: 1,
  acaZeroCostHintEnabled: true,
};

// -------------------- Estimator (pure) --------------------
const roundTo = (n: number, unit: number) => Math.round(n / unit) * unit;

function regionMultiplierOf(cfg: Config, loc?: { state?: string; zip?: string }): number {
  const mods = cfg.regionModifiers?.filter(m => m.active !== false) ?? [];
  if (!mods.length) return 1;
  const zipPrefix = loc?.zip?.slice(0, 3);
  const byZip = zipPrefix ? mods.find(m => m.zipPrefix && m.zipPrefix === zipPrefix) : undefined;
  if (byZip) return byZip.multiplier;
  const byState = loc?.state ? mods.find(m => m.state && m.state.toUpperCase() === loc.state!.toUpperCase()) : undefined;
  return byState?.multiplier ?? 1;
}

function calculateLactationCostEstimate(input: EstimatorInputs, cfg: Config): EstimateResult {
  const notes: string[] = [];
  const assumptions: string[] = [];
  const visitCfg = cfg.visits[input.visitType];
  if (!visitCfg) throw new Error(`Unsupported visit type: ${input.visitType}`);

  const regionMult = regionMultiplierOf(cfg, input.location);
  const selfPayRegional = visitCfg.selfPay * regionMult;

  if (!input.insurance.hasInsurance) {
    const est = roundTo(selfPayRegional, cfg.roundingToNearest);
    return {
      currency: "USD",
      estimate: { min: est, max: est },
      breakdown: {
        allowedAmount: selfPayRegional,
        copay: { min: 0, max: 0 },
        deductibleApplied: { min: 0, max: 0 },
        coinsurance: { min: 0, max: 0 },
        regionMultiplierApplied: regionMult,
        outOfNetworkMultiplierApplied: 1,
        notes,
        assumptions,
        possibleZeroCost: false,
      },
      disclaimer: "This is an estimate for self-pay. Actual charges may vary by provider and region.",
    };
  }

  const insuranceType = input.insurance.insuranceType ?? "private";
  const insDefaults = cfg.insuranceDefaults[insuranceType];
  if (!insDefaults) throw new Error(`Unsupported insurance type: ${insuranceType}`);

  const allowedPct = visitCfg.allowedRatePctByInsurance?.[insuranceType] ?? 0.7; // default 70%
  let allowedAmount = selfPayRegional * allowedPct;
  const oonMult = input.insurance.outOfNetwork ? cfg.outOfNetworkMultiplier : 1;
  allowedAmount *= oonMult;

  const [covMin, covMax] = insDefaults.coveragePctRange; // payer share
  const [copayMinCfg, copayMaxCfg] = insDefaults.copayRange;
  const copayKnown = input.insurance.copayKnown;
  const copayRange: Range = copayKnown ? { min: copayKnown, max: copayKnown } : { min: copayMinCfg, max: copayMaxCfg };

  const status: DeductibleStatus = input.insurance.deductibleStatus ?? "unknown";
  const typicalDeductibleRemaining = input.insurance.deductibleRemaining ?? insDefaults.typicalDeductibleRemaining ?? 0;

  function totalWhenDeductibleMet(coveragePct: number, copay: number) {
    const coinsurance = (1 - coveragePct) * allowedAmount;
    return { copay, deductibleApplied: 0, coinsurance };
  }
  function totalWhenDeductibleNotMet(coveragePct: number, copay: number, deductibleRemaining: number) {
    const deductibleApplied = Math.min(allowedAmount, deductibleRemaining);
    const remaining = Math.max(0, allowedAmount - deductibleApplied);
    const coinsurance = (1 - coveragePct) * remaining;
    return { copay, deductibleApplied, coinsurance };
  }

  let lowTotal = Infinity;
  let highTotal = -Infinity;
  let lowBreak = { copay: 0, deductibleApplied: 0, coinsurance: 0 };
  let highBreak = { copay: 0, deductibleApplied: 0, coinsurance: 0 };
  const bestCoverage = covMax;
  const worstCoverage = covMin;

  if (status === "met") {
    const low = totalWhenDeductibleMet(bestCoverage, copayRange.min);
    const high = totalWhenDeductibleMet(worstCoverage, copayRange.max);
    lowTotal = low.copay + low.coinsurance;
    highTotal = high.copay + high.coinsurance;
    lowBreak = low; highBreak = high;
  } else if (status === "not_met") {
    const low = totalWhenDeductibleNotMet(bestCoverage, copayRange.min, typicalDeductibleRemaining);
    const high = totalWhenDeductibleNotMet(worstCoverage, copayRange.max, typicalDeductibleRemaining);
    lowTotal = low.copay + low.deductibleApplied + low.coinsurance;
    highTotal = high.copay + high.deductibleApplied + high.coinsurance;
    lowBreak = low; highBreak = high;
  } else {
    const met = totalWhenDeductibleMet(bestCoverage, copayRange.min);
    const notMet = totalWhenDeductibleNotMet(worstCoverage, copayRange.max, typicalDeductibleRemaining);
    lowTotal = met.copay + met.coinsurance; // best case
    highTotal = notMet.copay + notMet.deductibleApplied + notMet.coinsurance; // worst case
    lowBreak = met; highBreak = notMet;
  }

  let possibleZeroCost = false;
  if (
    cfg.acaZeroCostHintEnabled &&
    (insuranceType === "private" || insuranceType === "aca") &&
    !input.insurance.outOfNetwork &&
    (input.visitType === "initial" || input.visitType === "followup")
  ) {
    possibleZeroCost = true;
    notes.push("Many ACA-compliant plans cover in-network lactation support at $0. Check your plan benefits.");
  }

  const estimateMin = roundTo(Math.max(0, lowTotal), cfg.roundingToNearest);
  const estimateMax = roundTo(Math.max(estimateMin, highTotal), cfg.roundingToNearest);

  return {
    currency: "USD",
    estimate: { min: estimateMin, max: estimateMax },
    breakdown: {
      allowedAmount: roundTo(allowedAmount, 1),
      copay: { min: roundTo(lowBreak.copay, 1), max: roundTo(highBreak.copay, 1) },
      deductibleApplied: {
        min: roundTo((lowBreak as any).deductibleApplied ?? 0, 1),
        max: roundTo((highBreak as any).deductibleApplied ?? 0, 1),
      },
      coinsurance: {
        min: roundTo(lowBreak.coinsurance, 1),
        max: roundTo(highBreak.coinsurance, 1),
      },
      regionMultiplierApplied: regionMult,
      outOfNetworkMultiplierApplied: oonMult,
      notes,
      assumptions,
      possibleZeroCost,
    },
    disclaimer:
      "This is a good-faith estimate based on your inputs and typical benefits. Actual out-of-pocket costs depend on your specific plan, network status, and claim adjudication.",
  };
}

// -------------------- UI Helpers --------------------
const currency = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

// -------------------- Page Component --------------------
export default function CalculatorTestPage() {
  // Problem first: parents do not know costs. We make it simple.
  const [visitType, setVisitType] = useState<VisitType>("initial");
  const [zip, setZip] = useState("");
  const [stateCode, setStateCode] = useState("CA");
  const [hasInsurance, setHasInsurance] = useState(true);
  const [insuranceType, setInsuranceType] = useState<InsuranceType>("private");
  const [deductibleStatus, setDeductibleStatus] = useState<DeductibleStatus>("unknown");
  const [deductibleRemaining, setDeductibleRemaining] = useState<string>("");
  const [outOfNetwork, setOutOfNetwork] = useState(false);
  const [copayKnown, setCopayKnown] = useState<string>("");

  const estimate = useMemo(() => {
    try {
      return calculateLactationCostEstimate(
        {
          visitType,
          location: { state: stateCode || undefined, zip: zip || undefined },
          insurance: {
            hasInsurance,
            insuranceType: hasInsurance ? insuranceType : undefined,
            deductibleStatus: hasInsurance ? deductibleStatus : undefined,
            deductibleRemaining: hasInsurance && deductibleRemaining ? Number(deductibleRemaining) : undefined,
            copayKnown: hasInsurance && copayKnown ? Number(copayKnown) : undefined,
            outOfNetwork: hasInsurance ? outOfNetwork : false,
          },
        },
        defaultConfig
      );
    } catch (e) {
      return null;
    }
  }, [visitType, stateCode, zip, hasInsurance, insuranceType, deductibleStatus, deductibleRemaining, outOfNetwork, copayKnown]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Calculator Test Page</h1>
        <p className="mt-1 text-sm text-gray-600">Lactation Visit Out-of-Pocket Cost Estimator (prototype). Answer a few quick questions to see a good-faith estimate.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Form */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-medium">Your Visit</h2>

          <label className="mb-2 block text-sm font-medium">Visit type</label>
          <select
            className="mb-4 w-full rounded-xl border p-2"
            value={visitType}
            onChange={(e) => setVisitType(e.target.value as VisitType)}
          >
            <option value="initial">Initial Consultation</option>
            <option value="followup">Follow-Up Visit</option>
            <option value="virtual">Virtual Visit</option>
          </select>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium">State</label>
              <input
                className="w-full rounded-xl border p-2"
                placeholder="CA"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">ZIP</label>
              <input
                className="w-full rounded-xl border p-2"
                placeholder="92401"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, "").slice(0,5))}
              />
            </div>
          </div>

          <hr className="my-4" />

          <h2 className="mb-3 text-lg font-medium">Insurance</h2>

          <label className="mb-2 block text-sm font-medium">Do you have insurance?</label>
          <div className="mb-3 flex gap-3">
            <button
              className={`rounded-xl px-3 py-2 text-sm border ${hasInsurance ? "bg-gray-900 text-white" : "bg-white"}`}
              onClick={() => setHasInsurance(true)}
            >Yes</button>
            <button
              className={`rounded-xl px-3 py-2 text-sm border ${!hasInsurance ? "bg-gray-900 text-white" : "bg-white"}`}
              onClick={() => setHasInsurance(false)}
            >No</button>
          </div>

          {hasInsurance && (
            <>
              <label className="mb-2 block text-sm font-medium">Insurance type</label>
              <select
                className="mb-4 w-full rounded-xl border p-2"
                value={insuranceType}
                onChange={(e) => setInsuranceType(e.target.value as InsuranceType)}
              >
                <option value="private">Private / Employer</option>
                <option value="aca">ACA Marketplace</option>
                <option value="medicaid">Medicaid</option>
                <option value="other">Other</option>
              </select>

              <label className="mb-2 block text-sm font-medium">Deductible status</label>
              <select
                className="mb-4 w-full rounded-xl border p-2"
                value={deductibleStatus}
                onChange={(e) => setDeductibleStatus(e.target.value as DeductibleStatus)}
              >
                <option value="unknown">I don't know</option>
                <option value="met">Met</option>
                <option value="not_met">Not met</option>
              </select>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">Deductible remaining (optional)</label>
                  <input
                    className="w-full rounded-xl border p-2"
                    placeholder="e.g., 400"
                    inputMode="numeric"
                    value={deductibleRemaining}
                    onChange={(e) => setDeductibleRemaining(e.target.value.replace(/[^0-9.]/g, ""))}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Known copay (optional)</label>
                  <input
                    className="w-full rounded-xl border p-2"
                    placeholder="e.g., 25"
                    inputMode="numeric"
                    value={copayKnown}
                    onChange={(e) => setCopayKnown(e.target.value.replace(/[^0-9.]/g, ""))}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input id="oon" type="checkbox" checked={outOfNetwork} onChange={(e) => setOutOfNetwork(e.target.checked)} />
                <label htmlFor="oon" className="text-sm">Out-of-network</label>
              </div>
            </>
          )}
        </div>

        {/* Right: Result */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-medium">Estimate</h2>
          {!estimate ? (
            <p className="text-sm text-gray-600">Fill in your details to see your estimate.</p>
          ) : (
            <div>
              <div className="rounded-xl border bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Estimated out-of-pocket</p>
                <p className="mt-1 text-2xl font-semibold">
                  {currency(estimate.estimate.min)} – {currency(estimate.estimate.max)}
                </p>
                {estimate.breakdown.possibleZeroCost && (
                  <p className="mt-2 text-sm text-emerald-700">Heads up: many ACA-compliant plans cover in-network lactation support at $0.</p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border p-3">
                  <p className="text-gray-600">Allowed amount</p>
                  <p className="font-medium">{currency(estimate.breakdown.allowedAmount)}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-gray-600">Copay</p>
                  <p className="font-medium">{currency(estimate.breakdown.copay.min)} – {currency(estimate.breakdown.copay.max)}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-gray-600">Deductible</p>
                  <p className="font-medium">{currency(estimate.breakdown.deductibleApplied.min)} – {currency(estimate.breakdown.deductibleApplied.max)}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-gray-600">Coinsurance</p>
                  <p className="font-medium">{currency(estimate.breakdown.coinsurance.min)} – {currency(estimate.breakdown.coinsurance.max)}</p>
                </div>
              </div>

              {(estimate.breakdown.notes.length > 0 || estimate.breakdown.assumptions.length > 0) && (
                <div className="mt-4 rounded-xl border p-3">
                  <details>
                    <summary className="cursor-pointer text-sm font-medium">About this estimate</summary>
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                      {estimate.breakdown.assumptions.map((a, i) => (
                        <li key={`a-${i}`}>{a}</li>
                      ))}
                      {estimate.breakdown.notes.map((n, i) => (
                        <li key={`n-${i}`}>{n}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}

              <p className="mt-4 text-xs text-gray-500">{estimate.disclaimer}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a href="#" className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50">Schedule lactation visit</a>
                <a href="#" className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">Check benefits with my insurer</a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-4 text-sm text-gray-600">
        <p className="font-medium">Admin tips (for testing)</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Change state to CA to see a slight regional increase (1.05×).</li>
          <li>Toggle out-of-network to apply a 1.25× multiplier to allowed amounts.</li>
          <li>Switch deductible status between "Met / Not met / I don't know" to see range behavior.</li>
          <li>Add a known copay or deductible remaining to tighten the range.</li>
        </ul>
      </div>
    </div>
  );
}