
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const COUNTRY_LIST = [
  {
    name: "Sierra Leone", code: "SL",
    page: "/west-africa/sierra-leone",
    gdp: "6.4", growth: "4.2", inflation: "28.3", debt: "44.1",
    flag: "🇸🇱"
  },
  {
    name: "Ghana", code: "GH",
    page: "#",
    gdp: "72.8", growth: "3.1", inflation: "35.2", debt: "77.6",
    flag: "🇬🇭"
  },
  {
    name: "Liberia", code: "LR",
    page: "#",
    gdp: "3.2", growth: "4.7", inflation: "7.8", debt: "56.1",
    flag: "🇱🇷"
  },
  // Placeholders - extend as needed!
  {
    name: "Nigeria", code: "NG", page: "#", gdp: "--", growth: "--", inflation: "--", debt: "--", flag:"🇳🇬"
  },
  {
    name: "Senegal", code: "SN", page: "#", gdp: "--", growth: "--", inflation: "--", debt: "--", flag:"🇸🇳"
  }
];

export default function WestAfricaIndex() {
  return (
    <div className="min-h-screen py-10 bg-[#f7fafc]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3" style={{color:"#2c8fc9"}}>
          West Africa Economic Dashboard
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600">
          Compare key economic indicators across West African countries. Click a country to view its dashboard.
        </p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {COUNTRY_LIST.map((c) => (
          <Link
            key={c.name}
            to={c.page}
            className="hover:scale-105 transition-transform"
            style={{textDecoration:"none"}}
          >
            <Card style={{background:"#fff", borderTop:`4px solid #2c8fc9`}} className="min-h-[170px] flex flex-col justify-between">
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{c.flag}</span>
                  <span className="text-xl font-bold" style={{color:"#1eb53a"}}>{c.name}</span>
                </div>
                <div className="text-sm flex flex-col gap-1">
                  <div><strong>GDP</strong>: {c.gdp} bn USD</div>
                  <div><strong>Growth</strong>: {c.growth}%</div>
                  <div><strong>Inflation</strong>: {c.inflation}%</div>
                  <div><strong>Debt</strong>: {c.debt}%</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
