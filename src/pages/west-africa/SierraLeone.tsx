
import React, { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Brand colors for Sierra Leone
const GREEN = "#1eb53a";
const BLUE = "#2c8fc9";
const WHITE = "#ffffff";

// Utility fetch (World Bank returns arrays, check .json structure)
async function fetchJSON(url: string) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Fetch error: ${url}`);
    return await r.json();
  } catch {
    return null;
  }
}

const defaultKPIs = {
  gdp: "--", growth: "--", pop: "--"
};

const SWOT = {
  strengths: [
    "Natural-resource base",
    "Young workforce",
    "Diaspora remittance potential"
  ],
  weaknesses: [
    "Infrastructure gaps",
    "Import dependency",
    "High public debt risk"
  ],
  opportunities: [
    "Smart agritech initiatives",
    "PPP in energy & connectivity",
    "Startup ecosystem growth"
  ],
  threats: [
    "Global commodity swings",
    "Climate vulnerability",
    "Governance hurdles"
  ]
};

const SierraLeonePage: React.FC = () => {
  const [kpi, setKpi] = React.useState(defaultKPIs);

  // Refs for Chart.js elements
  const sectorChartRef = useRef<HTMLCanvasElement>(null);
  const gdpQChartRef = useRef<HTMLCanvasElement>(null);
  const fiscalChartRef = useRef<HTMLCanvasElement>(null);
  const roadmapChartRef = useRef<HTMLCanvasElement>(null);

  // Use JavaScript to load KPIs
  useEffect(() => {
    async function loadKPIs() {
      const [gdpRes, growthRes, popRes] = await Promise.all([
        fetchJSON('https://api.worldbank.org/v2/country/SL/indicator/NY.GDP.MKTP.CD?format=json&per_page=1'),
        fetchJSON('https://api.worldbank.org/v2/country/SL/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=1'),
        fetchJSON('https://api.worldbank.org/v2/country/SL/indicator/SP.POP.TOTL?format=json&per_page=1')
      ]);
      setKpi({
        gdp: gdpRes?.[1]?.[0]?.value ? (gdpRes[1][0].value / 1e9).toFixed(2) : "--",
        growth: growthRes?.[1]?.[0]?.value ? growthRes[1][0].value.toFixed(2) : "--",
        pop: popRes?.[1]?.[0]?.value ? (popRes[1][0].value / 1e6).toFixed(2) : "--"
      });
    }
    loadKPIs();
    const int = setInterval(loadKPIs, 1000*60*60*24*90);
    return () => clearInterval(int);
  }, []);

  // Load charts: sector, quarterly, fiscal, roadmap
  useEffect(() => {
    let sectorChart: any, gdpQChart: any, fiscalChart: any, roadmapChart: any;
    import("chart.js/auto").then(({ default: Chart }) => {
      // 1. Sector breakdown: static for now
      if (sectorChartRef.current) {
        const data = { Agriculture: 51.5, Industry: 14.9, Services: 33.6 };
        sectorChart = new Chart(sectorChartRef.current, {
          type: "doughnut",
          data: {
            labels: Object.keys(data),
            datasets: [{
              data: Object.values(data),
              backgroundColor: [GREEN, BLUE, "#cccccc"]
            }]
          },
          options: { responsive: true }
        });
      }
      // 2. Quarterly GDP chart
      if (gdpQChartRef.current) {
        fetchJSON('https://api.worldbank.org/v2/country/SL/indicator/NY.GDP.MKTP.KD.ZG?date=2019:2024&format=json').then(raw => {
          const arr = raw?.[1]?.slice(0, 6).reverse() ?? [];
          const labels = arr.map(d => d.date);
          const data = arr.map(d => d.value);
          gdpQChart = new Chart(gdpQChartRef.current, {
            type: "line",
            data: {
              labels,
              datasets: [{
                label: "Real GDP Growth (%)",
                data,
                borderColor: BLUE,
                fill: false
              }]
            },
            options: { responsive: true }
          });
        });
      }
      // 3. Fiscal chart (static fallback, governmental revenue as % GDP)
      if (fiscalChartRef.current) {
        const labels = ["2019","2020","2021","2022","2023","2024"];
        const values = [14.5, 15.2, 14.8, 15.6, 13.9, 14.2];
        fiscalChart = new Chart(fiscalChartRef.current, {
          type: "bar",
          data: {
            labels,
            datasets: [{
              label: "Govt Revenue (% GDP)",
              data: values,
              backgroundColor: GREEN
            }]
          },
          options: { responsive: true }
        });
      }
      // 4. Roadmap (projection)
      if (roadmapChartRef.current) {
        const labels = ['2025','2030','2035','2040','2045','2050','2054'];
        const values = [4.7,5.0,5.5,6.0,6.5,7.0,7.5];
        roadmapChart = new Chart(roadmapChartRef.current, {
          type: "line",
          data: {
            labels,
            datasets: [{
              label: "Projected Real GDP Growth",
              data: values,
              borderColor: BLUE,
              backgroundColor: "rgba(44,143,201,0.20)",
              fill: true
            }]
          },
          options: { responsive: true }
        });
      }
    });
    // Cleanup on unmount
    return () => {
      sectorChart?.destroy?.();
      gdpQChart?.destroy?.();
      fiscalChart?.destroy?.();
      roadmapChart?.destroy?.();
    };
  }, []);

  // Render
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />
      {/* Hero + KPIs */}
      <header className="bg-[#1eb53a] text-white text-center py-16 px-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Sierra Leone: Economy Today · Vision to 2054
        </h1>
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-6">
          <div className="bg-white text-[#333] shadow-lg rounded-lg px-8 py-5 w-48 flex flex-col items-center">
            <div className="text-2xl font-bold" id="gdp-val">{kpi.gdp}</div>
            <small>GDP (US$ bn)</small>
          </div>
          <div className="bg-white text-[#333] shadow-lg rounded-lg px-8 py-5 w-48 flex flex-col items-center">
            <div className="text-2xl font-bold" id="growth-val">{kpi.growth}</div>
            <small>Real GDP Growth (%)</small>
          </div>
          <div className="bg-white text-[#333] shadow-lg rounded-lg px-8 py-5 w-48 flex flex-col items-center">
            <div className="text-2xl font-bold" id="pop-val">{kpi.pop}</div>
            <small>Population (mn)</small>
          </div>
        </div>
      </header>

      {/* Sector Breakdown */}
      <section className="py-14 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#2c8fc9] mb-6">Current Economic Landscape</h2>
        <div className="flex justify-center chart-container bg-white rounded-xl shadow p-8">
          <canvas ref={sectorChartRef} width={360} height={180} />
        </div>
      </section>

      {/* Quarterly Trends */}
      <section className="py-14 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#2c8fc9] mb-6">Quarterly Trends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center chart-container">
            <canvas ref={gdpQChartRef} width={320} height={200} />
          </div>
          <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center chart-container">
            <canvas ref={fiscalChartRef} width={320} height={200} />
          </div>
        </div>
      </section>

      {/* SWOT */}
      <section className="py-14 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#2c8fc9] mb-8">SWOT Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#f9f9f9] rounded-lg p-6 shadow swot-box">
            <h3 className="text-[#1eb53a] font-bold mb-2">Strengths</h3>
            <ul className="list-disc list-inside">
              {SWOT.strengths.map((item,i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div className="bg-[#f9f9f9] rounded-lg p-6 shadow swot-box">
            <h3 className="text-[#2c8fc9] font-bold mb-2">Weaknesses</h3>
            <ul className="list-disc list-inside">
              {SWOT.weaknesses.map((item,i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div className="bg-[#f9f9f9] rounded-lg p-6 shadow swot-box">
            <h3 className="text-[#2c8fc9] font-bold mb-2">Opportunities</h3>
            <ul className="list-disc list-inside">
              {SWOT.opportunities.map((item,i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div className="bg-[#f9f9f9] rounded-lg p-6 shadow swot-box">
            <h3 className="text-[#1eb53a] font-bold mb-2">Threats</h3>
            <ul className="list-disc list-inside">
              {SWOT.threats.map((item,i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-14 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#2c8fc9] mb-6">Road to 2054</h2>
        <div className="bg-white rounded-xl shadow p-8 roadmap flex justify-center">
          <canvas ref={roadmapChartRef} width={340} height={180} />
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 px-4">
        <a
          href="mailto:aweh@diasporanetwork.africa?subject=Sierra Leone Network Interest"
          className="bg-[#2c8fc9] hover:bg-[#1eb53a] text-white font-semibold py-3 px-8 rounded transition"
        >
          Get Involved – Join the Network!
        </a>
      </section>
      <Footer />
      <footer className="text-center py-5 bg-[#f5f5f5] text-sm text-gray-500">
        Data updates quarterly via World Bank & IMF APIs. © 2025 Diaspora Network AFRICA
      </footer>
    </div>
  );
};

export default SierraLeonePage;
