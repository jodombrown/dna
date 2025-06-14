
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CmsSwotEditor() {
  // Each value is a CSV string for quick editing.
  const [form, setForm] = useState({
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
    roadmap: ""
  });

  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  }

  function renderList(csv: string) {
    return csv.split(",").map((t, i) => (
      <li key={i}>{t.trim()}</li>
    ));
  }

  function renderRoadmap(csv: string) {
    return (
      <div>
        {csv.split(",").map((v, ix) =>
          <div key={ix}>Year {2025+ix*5}: {v.trim()}</div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafc] flex items-center justify-center py-10">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6" style={{color:"#2c8fc9"}}>SWOT and Roadmap Editor</h1>
        <p className="mb-6 text-gray-600">Enter comma-separated lists for each SWOT and Roadmap section. (Mock save, not yet connected to DB.)</p>
        <div className="mb-4">
          <label className="block font-semibold mb-1" style={{color:"#1eb53a"}}>Strengths</label>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={2}
            name="strengths"
            value={form.strengths}
            onChange={handleChange}
            placeholder="Comma-separated (eg: Natural resource base, Young workforce)"
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1" style={{color:"#2c8fc9"}}>Weaknesses</label>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={2}
            name="weaknesses"
            value={form.weaknesses}
            onChange={handleChange}
            placeholder="Comma-separated"
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1" style={{color:"#1eb53a"}}>Opportunities</label>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={2}
            name="opportunities"
            value={form.opportunities}
            onChange={handleChange}
            placeholder="Comma-separated"
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1" style={{color:"#2c8fc9"}}>Threats</label>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={2}
            name="threats"
            value={form.threats}
            onChange={handleChange}
            placeholder="Comma-separated"
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1" style={{color:"#2c8fc9"}}>Roadmap Projections (comma separated for each year interval, eg: 4.7, 5, 6...)</label>
          <input
            className="w-full border rounded p-2 text-sm"
            name="roadmap"
            value={form.roadmap}
            onChange={handleChange}
            placeholder="Comma-separated projections for 2025, 2030, ..., 2054"
          />
        </div>
        <Button type="submit" className="bg-[#2c8fc9] text-white py-2">Save</Button>
        {submitted && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mt-4 rounded">
            Saved! (mock only)
          </div>
        )}
        <div className="mt-4">
          <h3 className="font-bold mb-2" style={{color:"#1eb53a"}}>Preview:</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="font-semibold">Strengths</div>
              <ul>{renderList(form.strengths)}</ul>
            </div>
            <div>
              <div className="font-semibold">Weaknesses</div>
              <ul>{renderList(form.weaknesses)}</ul>
            </div>
            <div>
              <div className="font-semibold">Opportunities</div>
              <ul>{renderList(form.opportunities)}</ul>
            </div>
            <div>
              <div className="font-semibold">Threats</div>
              <ul>{renderList(form.threats)}</ul>
            </div>
          </div>
          <div className="mt-3 font-semibold">Roadmap:</div>
          <div className="text-xs">{renderRoadmap(form.roadmap)}</div>
        </div>
      </form>
    </div>
  );
}
