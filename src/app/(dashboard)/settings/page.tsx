import React from "react"
import { User, Bell, Shield, CreditCard, Download, Trash2, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Settings | Monetra",
  description: "Manage your Monetra account preferences, profile, and subscription.",
}

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences, profile, and subscription.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-8 items-start">
        <div className="space-y-1">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <a href="#profile" className="flex items-center gap-3 px-3 py-2 text-primary bg-primary/10 rounded-md">
              <User size={18} /> Profile
            </a>
            <a href="#notifications" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors">
              <Bell size={18} /> Notifications
            </a>
            <a href="#subscription" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors">
              <CreditCard size={18} /> Subscription
            </a>
            <a href="#security" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors">
              <Shield size={18} /> Security
            </a>
          </nav>
        </div>

        <div className="md:col-span-3 space-y-8">
          <section id="profile" className="space-y-6">
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-4">Profile Information</h2>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                JD
              </div>
              <button className="px-4 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-md transition-colors">
                Change Avatar
              </button>
            </div>
            
            <form className="space-y-4 max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input type="text" defaultValue="John" className="w-full px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input type="text" defaultValue="Doe" className="w-full px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input type="email" defaultValue="hello@johndoe.com" disabled className="w-full px-3 py-2 bg-muted border rounded-md text-sm cursor-not-allowed opacity-70" />
                <p className="text-xs text-muted-foreground">Your email is used for login and cannot be changed here.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <select className="w-full px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Kanpur</option>
                  <option>Lucknow</option>
                  <option>Indore</option>
                  <option>Ahmedabad</option>
                  <option>Pune</option>
                </select>
                <p className="text-xs text-muted-foreground">Used to personalise Real Estate Explorer data.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Occupation</label>
                <select className="w-full px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Salaried Professional</option>
                  <option>Freelancer</option>
                  <option>Business Owner</option>
                  <option>Student</option>
                </select>
              </div>

              <div className="pt-4 border-t mt-6">
                <button type="button" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          <section id="subscription" className="space-y-6 pt-8">
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-4">Subscription Plan</h2>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border border-indigo-200 dark:border-indigo-900/30 rounded-xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded uppercase tracking-wider">Current Plan</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground flex items-baseline gap-1">
                    Free
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">3 AI generations left this month.</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-card border rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-semibold">Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Pro</span></div>
                  <div className="font-bold text-lg">₹199<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> Unlimited AI Theses & Spending Audits
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> Unlimited portfolio holdings tracked
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> Daily AI Insights enabled
                  </li>
                </ul>
                <button className="w-full py-2 bg-foreground text-background hover:bg-foreground/90 rounded-md text-sm font-medium transition-colors">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </section>
          
          <section id="data" className="space-y-6 pt-8">
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-4">Data & Privacy</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg hover:border-foreground/20 transition-colors">
                <div>
                  <h4 className="font-medium text-sm flex items-center gap-2"><Download size={16} className="text-muted-foreground" /> Export Data</h4>
                  <p className="text-xs text-muted-foreground">Download all your financial data and AI theses as CSV.</p>
                </div>
                <button className="px-3 py-1.5 border hover:bg-muted rounded-md text-xs font-medium transition-colors">Export</button>
              </div>
              
              <div className="flex justify-between items-center p-4 border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm text-red-600 dark:text-red-400 flex items-center gap-2"><Trash2 size={16} /> Delete Account</h4>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80">Permanently delete your account and all financial data.</p>
                </div>
                <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors">Delete</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
