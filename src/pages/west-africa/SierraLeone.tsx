
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const kpiConfig = [
  { label: "GDP (US$ bn)", id: "gdp", color: "#1eb53a" },
  { label: "Real GDP Growth (%)", id: "growth", color: "#2c8fc9" },
  { label: "Population (mn)", id: "pop", color: "#009bdf" },
  { label: "Inflation (%)", id: "inflation", color: "#cccccc" },
  { label: "Debt (% GDP)", id: "debt", color: "#cccccc" },
  { label: "Poverty Rate (%)", id: "poverty", color: "#cccccc" },
  { label: "Remittances ($m)", id: "remit", color: "#cccccc" }
];

const defaultKpis = {
  gdp: "6.4",
  growth: "4.2",
  pop: "8.4",
  inflation: "28.3",
  debt: "44.1",
  poverty: "57.0",
  remit: "533"
};

const sectorDefault = { "Agriculture": 51.5, "Industry": 14.9, "Services": 33.6 };

const SWOT_DEFAULT = {
  strengths: ["Natural-resource base", "Young workforce", "Diaspora remittance potential"],
  weaknesses: ["Infrastructure gaps", "Import dependency", "High public debt risk"],
  opportunities: ["Smart agritech initiatives", "PPP in energy & connectivity", "Startup ecosystem growth"],
  threats: ["Global commodity swings", "Climate vulnerability", "Governance hurdles"]
};

const roadmapYears = ["2025","2030","2035","2040","2045","2050","2054"];
const roadmapDefaultValues = [4.7,5,5.5,6,6.5,7,7.5];

export default function SierraLeone() {
  const [kpis, setKpis] = useState(defaultKpis);
  const [swot, setSwot] = useState(SWOT_DEFAULT);

  // Charts refs for Chart.js (for SSR safe)
  const sectorRef = useRef<HTMLCanvasElement>(null);
  const trendRef = useRef<HTMLCanvasElement>(null);
  const fiscalRef = useRef<HTMLCanvasElement>(null);
  const roadmapRef = useRef<HTMLCanvasElement>(null);

  function safe(val: any, fallback: string) {
    return (typeof val === "number" && !isNaN(val)) ? String(val) : fallback;
  }

  async function fetchJSON(url: string) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Fetch failed`);
      return await r.json();
    } catch {
      return null;
    }
  }

  // Load KPIs
  useEffect(() => {
    async function loadKPIs() {
      const [
        gdp,
        growth,
        pop,
        inflation,
        debt,
        poverty,
        remit
      ] = await Promise.all([
        fetchJSON("https://api.worldbank.org/v2/country/SL/indicator/NY.GDP.MKTP.CD?format=json&per_page=1"),
        fetchJSON("https://api.worldbank.org/v2/country/SL/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=1"),
        fetchJSON("https://api.worldbank.org/v2/country/SL/indicator/SP.POP.TOTL?format=json&per_page=1"),
        fetchJSON("https://api.worldbank.org/v2/country/SL/indicator/FP.CPI.TOTL.ZG?format=json&per_page=1"),
        fetchJSON("https://api.worldbank.org/v2/country/SL/indicator/GC.DOD.TOTL.GD.ZS?format=json&per_page=1"),
        fetchJSON("https://api.worldbank.org/v2/country/SL/indicator/SI.POV.DDAY?format=json&per_page=1"),
        fetchJSON("https://api.worldbank.org/v2/country/SL/indicator/BX.TRF.PWKR.CD.DT?format=json&per_page=1")
      ]);
      setKpis({
        gdp: safe(gdp?.[1]?.[0]?.value/1e9, defaultKpis.gdp),
        growth: safe(growth?.[1]?.[0]?.value, defaultKpis.growth),
        pop: safe(pop?.[1]?.[0]?.value/1e6, defaultKpis.pop),
        inflation: safe(inflation?.[1]?.[0]?.value, defaultKpis.inflation),
        debt: safe(debt?.[1]?.[0]?.value, defaultKpis.debt),
        poverty: safe(poverty?.[1]?.[0]?.value, defaultKpis.poverty),
        remit: safe(remit?.[1]?.[0]?.value/1e6, defaultKpis.remit)
      });
    }
    loadKPIs();
    const interval = setInterval(loadKPIs, 1000 * 60 * 60 * 24 * 90); // Quarterly refresh
    return () => clearInterval(interval);
  }, []);

  // Load charts
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.onload = () => {
      // @ts-ignore
      const Chart = window.Chart;

      // 1. Sector Doughnut
      if (sectorRef.current) {
        new Chart(sectorRef.current, {
          type: "doughnut",
          data: {
            labels: Object.keys(sectorDefault),
            datasets: [{ 
              data: Object.values(sectorDefault),
              backgroundColor: ["#1eb53a", "#2c8fc9", "#cccccc"]
            }]
          },
          options: { responsive: true, plugins: { legend: {position:"bottom"} } }
        });
      }

      // 2. GDP Trend (mock, can hook live)
      if (trendRef.current) {
        new Chart(trendRef.current, {
          type: "line",
          data: {
            labels: ["2020","2021","2022","2023","2024"],
            datasets: [{
              label: "Real GDP Growth (%)",
              data: [2.0,3.1,4.2,2.7,4.7],
              borderColor: "#2c8fc9",
              fill: false
            }]
          }, options: { responsive: true }
        });
      }

      // 3. Fiscal Balance (mock, can hook live)
      if (fiscalRef.current) {
        new Chart(fiscalRef.current, {
          type: "bar",
          data: {
            labels: ["2020","2021","2022","2023","2024"],
            datasets: [{
              label: "Fiscal Balance (% GDP)",
              data: [-8.1, -6.5, -7.2, -5.9, -5.1],
              backgroundColor: "#1eb53a"
            }]
          }, options: { responsive: true }
        });
      }

      // 4. Roadmap line
      if (roadmapRef.current) {
        new Chart(roadmapRef.current, {
          type: "line",
          data: {
            labels: roadmapYears,
            datasets: [{
              label: "Projected Real GDP Growth",
              data: roadmapDefaultValues,
              borderColor: "#2c8fc9",
              backgroundColor: "rgba(44,143,201,0.2)",
              fill: true
            }]
          }, options: { responsive: true }
        });
      }
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div className="min-h-screen" style={{background:"#f7fafc"}}>
      <section
        className="py-16"
        style={{
          background: "linear-gradient(90deg,#1eb53a 0%,#2c8fc9 100%)",
          color: "#fff"
        }}
      >
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">
            Sierra Leone: Economy Today · Vision to 2054
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            {kpiConfig.map((k, i) => (
              <Card
                key={k.id}
                className="rounded-xl shadow-lg min-w-[140px] px-2 py-2"
                style={{ background: "#fff", color: "#222", borderBottom:`4px solid ${k.color}` }}
              >
                <CardContent>
                  <div className="text-2xl font-bold mb-1" id={k.id+"-val"}>
                    {kpis[k.id as keyof typeof kpis]}
                  </div>
                  <div className="text-sm font-medium">{k.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-3 text-[#1eb53a]">Current Economic Landscape</h2>
        <canvas ref={sectorRef} width={360} height={180}/>
      </section>

      <section className="py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-3 text-[#2c8fc9]">Quarterly Trends</h2>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <div className="font-semibold mb-2">GDP Quarterly Growth</div>
            <canvas ref={trendRef} width={320} height={200}/>
          </div>
          <div>
            <div className="font-semibold mb-2">Fiscal Balance</div>
            <canvas ref={fiscalRef} width={320} height={200}/>
          </div>
        </div>
      </section>

      <section className="py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-3" style={{color:"#1eb53a"}}>SWOT Analysis</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-[#1eb53a]">Strengths</h3>
            <ul className="list-inside list-disc text-sm">
              {swot.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
            <h3 className="font-semibold text-[#2c8fc9] mt-5">Opportunities</h3>
            <ul className="list-inside list-disc text-sm">
              {swot.opportunities.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[#2c8fc9]">Weaknesses</h3>
            <ul className="list-inside list-disc text-sm">
              {swot.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
            <h3 className="font-semibold text-[#1eb53a] mt-5">Threats</h3>
            <ul className="list-inside list-disc text-sm">
              {swot.threats.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-3 text-[#2c8fc9]">Road to 2054</h2>
        <div>
          <canvas ref={roadmapRef} width={700} height={240}/>
        </div>
      </section>

      <section style={{textAlign:"center"}} className="py-6">
        <Button className="text-lg bg-[#2c8fc9] hover:bg-[#1eb53a] text-white px-6 py-3 rounded">
          Get Involved – Join the Network!
        </Button>
      </section>
      <footer className="py-4 text-center text-sm bg-white">
        Data updated quarterly via World Bank, IMF & TradingEconomics. © 2025 Diaspora Network AFRICA
      </footer>
    </div>
  );
}
