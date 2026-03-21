import React from "react"
import { MapPin, TrendingUp, Search, Shield, Filter, Calculator } from "lucide-react"

export const metadata = {
  title: "Real Estate Explorer | Monetra",
  description: "Explore real estate opportunities in Tier-2/3 cities across India.",
}

export default function RealEstatePage() {
  const localities = [
    { id: 1, name: "Swaroop Nagar", city: "Kanpur", sqftMin: 8500, sqftMax: 12000, yield: 2.8, yoy: 14.5, type: "Premium" },
    { id: 2, name: "Kidwai Nagar", city: "Kanpur", sqftMin: 5000, sqftMax: 7500, yield: 3.2, yoy: 12.1, type: "Mid-Segment" },
    { id: 3, name: "Kalyanpur", city: "Kanpur", sqftMin: 3500, sqftMax: 5500, yield: 4.1, yoy: 18.2, type: "Emerging" },
    { id: 4, name: "Civil Lines", city: "Kanpur", sqftMin: 9000, sqftMax: 14000, yield: 2.5, yoy: 9.8, type: "Premium" },
    { id: 5, name: "Kakadeo", city: "Kanpur", sqftMin: 4500, sqftMax: 6800, yield: 3.8, yoy: 15.4, type: "Student Hub" },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-[var(--text-main)]">Real Estate Explorer</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">Discover, analyse, and plan your next property investment.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
            <input 
              type="text" 
              placeholder="Search city e.g. Kanpur" 
              className="input-premium text-[13px] !pl-9 !pr-4 w-56"
              defaultValue="Kanpur"
            />
          </div>
          <button className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-light)] transition-all duration-300">
            <Filter size={14} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h2 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                <MapPin size={15} className="text-[var(--gold)]" />
                Localities in Kanpur
              </h2>
              <span className="section-label text-[var(--blue)] bg-[var(--blue-dim)] px-2 py-0.5 rounded-lg">Updated 2 days ago</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)] font-bold bg-[var(--surface)] border-b border-[var(--border)]">
                  <tr>
                    <th className="px-5 py-3 font-bold">Locality</th>
                    <th className="px-5 py-3 font-bold text-right">Price / sqft (₹)</th>
                    <th className="px-5 py-3 font-bold text-right">Rental Yield</th>
                    <th className="px-5 py-3 font-bold text-right">YoY Appreciation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {localities.map((loc) => (
                    <tr key={loc.id} className="hover:bg-[var(--surface)] transition-colors duration-300 cursor-pointer group">
                      <td className="px-5 py-3.5">
                        <div className="text-[13px] font-medium text-[var(--text-main)] group-hover:text-[var(--gold)] transition-colors duration-300">{loc.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]"></span>
                          <span className="text-[10px] text-[var(--text-muted)]">{loc.type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-[12px] text-[var(--text-sec)]">
                        {loc.sqftMin.toLocaleString('en-IN')} - {loc.sqftMax.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 bg-[var(--emerald-dim)] text-[var(--emerald)] text-[11px] rounded-lg font-semibold">
                          {loc.yield}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end items-center gap-1 text-[var(--emerald)] text-[12px] font-semibold font-mono">
                          <TrendingUp size={12} />
                          {loc.yoy}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="glass-card p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--blue-dim)] to-transparent opacity-30 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-[var(--blue-dim)]">
                  <Shield size={18} className="text-[var(--blue)]" />
                </div>
                <h2 className="text-[15px] font-semibold text-[var(--text-main)]">AI Real Estate Advisor</h2>
              </div>
              <p className="text-[13px] text-[var(--text-sec)] leading-relaxed mb-4">
                Based on your current savings rate and income, buying a 2BHK in <strong className="text-[var(--text-main)]">Kalyanpur</strong> is your most optimal path. The area is seeing massive infrastructure growth and typical rental yield is 4.1%. Given your current surplus of ₹15,000/mo, you can accumulate the 20% downpayment in <strong className="text-[var(--emerald)]">3.2 years</strong> if you direct it towards a short-term conservative fund.
              </p>
              <button className="text-[12px] font-semibold text-[var(--blue)] hover:underline">
                Generate Full Analysis →
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2 mb-4">
              <Calculator size={16} className="text-[var(--gold)]" />
              Affordability Check
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="section-label block mb-1.5">Target Property Value</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">₹</span>
                  <input type="text" defaultValue="65,000,000" className="input-premium text-[13px] !pl-7 font-mono" />
                </div>
              </div>
              
              <div>
                <label className="section-label block mb-1.5">Downpayment Available</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">₹</span>
                  <input type="text" defaultValue="15,000,000" className="input-premium text-[13px] !pl-7 font-mono" />
                </div>
              </div>
              
              <div className="pt-3 border-t border-[var(--border)]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] text-[var(--text-muted)]">Estimated EMI</span>
                  <span className="font-mono text-sm font-bold text-[var(--text-main)]">₹48,500</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)]">
                  <span>Tenure: 20 yrs</span>
                  <span>@ 8.5% p.a.</span>
                </div>
              </div>
              
              <div className="bg-[var(--red)]/5 border border-[var(--red)]/15 text-[var(--red)] p-3 rounded-xl text-[11px] leading-relaxed">
                <strong>Warning:</strong> The EMI exceeds 40% of your current monthly income. It is advised to increase downpayment or look for properties under ₹45L.
              </div>
            </div>
          </div>
          
          <div className="glass-card overflow-hidden">
            <div className="h-44 bg-[var(--surface)] relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto text-[var(--text-muted)] opacity-30 mb-2" size={28} />
                  <p className="text-[11px] font-medium text-[var(--text-muted)]">Interactive Map View</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1 px-4">Available only for specific Tier 2/3 cities currently.</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-[var(--blue)]/5 mix-blend-multiply"></div>
            </div>
            <div className="p-3 border-t border-[var(--border)] text-center">
              <button className="text-[11px] font-semibold text-[var(--gold)] hover:underline">Expand interactive map</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
