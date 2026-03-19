import React from "react"
import { MapPin, TrendingUp, Search, Shield, Building, Filter, Calculator } from "lucide-react"

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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Real Estate Explorer</h1>
          <p className="text-muted-foreground mt-1">Discover, analyse, and plan your next property investment.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search city e.g. Kanpur" 
              className="pl-9 px-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
              defaultValue="Kanpur"
            />
          </div>
          <button className="p-2 border rounded-md hover:bg-muted bg-background text-muted-foreground hover:text-foreground transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
              <h2 className="font-semibold flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                Localities in Kanpur
              </h2>
              <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">Updated 2 days ago</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                  <tr>
                    <th className="px-5 py-4 font-medium">Locality</th>
                    <th className="px-5 py-4 font-medium text-right">Price / sqft (₹)</th>
                    <th className="px-5 py-4 font-medium text-right">Rental Yield</th>
                    <th className="px-5 py-4 font-medium text-right">YoY Appreciation</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {localities.map((loc) => (
                    <tr key={loc.id} className="hover:bg-muted/10 transition-colors cursor-pointer">
                      <td className="px-5 py-4">
                        <div className="font-medium text-foreground">{loc.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                          {loc.type}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono">
                        {loc.sqftMin.toLocaleString('en-IN')} - {loc.sqftMax.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md font-medium">
                          {loc.yield}%
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end items-center gap-1 text-green-600 dark:text-green-500 font-medium font-mono">
                          <TrendingUp size={14} />
                          {loc.yoy}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-card border rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-950/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                  <Shield size={24} />
                </div>
                <h2 className="text-lg font-bold">AI Real Estate Advisor</h2>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                Based on your current savings rate and income, buying a 2BHK in <strong>Kalyanpur</strong> is your most optimal path. The area is seeing massive infrastructure growth and typical rental yield is 4.1%. Given your current surplus of ₹15,000/mo, you can accumulate the 20% downpayment in <strong>3.2 years</strong> if you direct it towards a short-term conservative fund.
              </p>
              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Generate Full Analysis →
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calculator size={18} className="text-primary" />
              Affordability Check
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Target Property Value</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <input type="text" defaultValue="65,000,000" className="w-full bg-background border rounded-md pl-8 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Downpayment Available</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <input type="text" defaultValue="15,000,000" className="w-full bg-background border rounded-md pl-8 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono" />
                </div>
              </div>
              
              <div className="pt-2 border-t mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Estimated EMI</span>
                  <span className="font-bold font-mono">₹48,500</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Tenure: 20 yrs</span>
                  <span className="text-muted-foreground">@ 8.5% p.a.</span>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-xs leading-relaxed mt-2 border border-red-100 dark:border-red-900/30">
                <strong>Warning:</strong> The EMI exceeds 40% of your current monthly income. It is advised to increase downpayment or look for properties under ₹45L.
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="h-48 bg-muted relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto text-muted-foreground/30 mb-2" size={32} />
                  <p className="text-xs text-muted-foreground font-medium">Interactive Map View</p>
                  <p className="text-[10px] text-muted-foreground mt-1 px-4">Available only for specific Tier 2/3 cities currently.</p>
                </div>
              </div>
              {/* Mocking a map overlay effect */}
              <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/5 mix-blend-multiply"></div>
            </div>
            <div className="p-3 bg-card border-t text-center">
              <button className="text-sm font-medium text-primary hover:underline">Expand interactive map</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
