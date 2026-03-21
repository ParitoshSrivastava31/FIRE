"use client";

import React, { useState } from "react"
import { User, Bell, Shield, CreditCard, Download, Trash2, Sparkles, Check, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csvData = "Date,Type,Category,Amount\n2023-10-01,Expense,Food,800\n2023-10-05,Expense,Transport,150\n2023-11-01,Income,Salary,120000";
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'monetra_financial_data.csv');
      a.click();
      setIsExporting(false);
    }, 1000);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      // Simulate account deletion
      window.location.href = "/signup";
    }, 2000);
  };
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-[var(--text-main)]">Settings</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-1">Manage your account, profile, and subscription.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 items-start">
        {/* Side nav */}
        <div className="space-y-0.5">
          <nav className="flex flex-col gap-0.5">
            <a href="#profile" className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[var(--gold)] bg-[var(--gold-dim)] rounded-xl transition-all duration-300">
              <User size={16} /> Profile
            </a>
            <a href="#notifications" className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--surface)] rounded-xl transition-all duration-300">
              <Bell size={16} /> Notifications
            </a>
            <a href="#subscription" className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--surface)] rounded-xl transition-all duration-300">
              <CreditCard size={16} /> Subscription
            </a>
            <a href="#security" className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--surface)] rounded-xl transition-all duration-300">
              <Shield size={16} /> Security
            </a>
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Profile */}
          <section id="profile" className="glass-card p-5">
            <h2 className="text-sm font-semibold text-[var(--text-main)] mb-5 pb-3 border-b border-[var(--border)]">Profile Information</h2>
            
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--emerald)] flex items-center justify-center text-xl font-bold text-white">
                JD
              </div>
              <button className="btn-ghost text-[12px]">Change Avatar</button>
            </div>
            
            <form className="space-y-4 max-w-md">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="section-label">First Name</label>
                  <input type="text" defaultValue="John" className="input-premium text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <label className="section-label">Last Name</label>
                  <input type="text" defaultValue="Doe" className="input-premium text-[13px]" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="section-label">Email Address</label>
                <input type="email" defaultValue="hello@johndoe.com" disabled className="input-premium text-[13px] opacity-60 cursor-not-allowed" />
                <p className="text-[11px] text-[var(--text-muted)]">Used for login. Cannot be changed here.</p>
              </div>

              <div className="space-y-1.5">
                <label className="section-label">City</label>
                <select className="input-premium text-[13px]">
                  <option>Kanpur</option>
                  <option>Lucknow</option>
                  <option>Indore</option>
                  <option>Ahmedabad</option>
                  <option>Pune</option>
                </select>
                <p className="text-[11px] text-[var(--text-muted)]">Personalises Real Estate Explorer data.</p>
              </div>

              <div className="space-y-1.5">
                <label className="section-label">Occupation</label>
                <select className="input-premium text-[13px]">
                  <option>Salaried Professional</option>
                  <option>Freelancer</option>
                  <option>Business Owner</option>
                  <option>Student</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[var(--border)]">
                <button type="button" className="btn-primary text-[12px]">Save Changes</button>
              </div>
            </form>
          </section>

          {/* Subscription */}
          <section id="subscription" className="glass-card p-5">
            <h2 className="text-sm font-semibold text-[var(--text-main)] mb-5 pb-3 border-b border-[var(--border)]">Subscription Plan</h2>
            
            <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--blue-dim)] to-[var(--gold-dim)] p-5">
              <div className="mb-5">
                <span className="section-label text-[var(--blue)]">Current Plan</span>
                <h3 className="text-xl font-serif font-bold text-[var(--text-main)] mt-1">Free</h3>
                <p className="text-[12px] text-[var(--text-muted)] mt-1">3 AI generations left this month.</p>
              </div>
              
              <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-semibold text-[13px] text-[var(--text-main)]">Upgrade to <span className="gradient-text from-[var(--gold)] to-[var(--blue)]">Pro</span></div>
                  <div className="font-mono text-base font-bold text-[var(--text-main)]">₹199<span className="text-[11px] text-[var(--text-muted)] font-normal font-sans">/mo</span></div>
                </div>
                <ul className="space-y-2 text-[12px] text-[var(--text-sec)] mb-5">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--emerald)] shrink-0" /> Unlimited AI Theses & Spending Audits
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--emerald)] shrink-0" /> Unlimited portfolio holdings tracked
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--emerald)] shrink-0" /> Daily AI Insights enabled
                  </li>
                </ul>
                <button className="w-full btn-primary text-[12px] text-center flex items-center justify-center gap-1.5">
                  <Sparkles size={13} />
                  Upgrade Plan
                </button>
              </div>
            </div>
          </section>
          
          {/* Data & Privacy */}
          <section id="data" className="glass-card p-5">
            <h2 className="text-sm font-semibold text-[var(--text-main)] mb-5 pb-3 border-b border-[var(--border)]">Data & Privacy</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 rounded-xl border border-[var(--border)] hover:border-[var(--border-light)] hover:bg-[var(--surface)] transition-all duration-300 group">
                <div>
                  <h4 className="text-[13px] font-medium text-[var(--text-main)] flex items-center gap-2">
                    <Download size={14} className="text-[var(--text-muted)]" /> Export Data
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">Download all financial data and AI theses as CSV.</p>
                </div>
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="btn-ghost text-[11px] !px-3 !py-1.5 flex items-center gap-2"
                >
                  {isExporting ? "Exporting..." : "Export"}
                </button>
              </div>
              
              <div className={`flex justify-between items-center p-4 rounded-xl transition-all duration-300 group ${showDeleteConfirm ? 'border border-[var(--red)] bg-[var(--red)]/10' : 'border border-[var(--red)]/15 bg-[var(--red)]/5'}`}>
                <div>
                  <h4 className="text-[13px] font-medium text-[var(--red)] flex items-center gap-2">
                    {showDeleteConfirm ? <AlertTriangle size={14} /> : <Trash2 size={14} />} 
                    {showDeleteConfirm ? "Are you absolutely sure?" : "Delete Account"}
                  </h4>
                  <p className="text-[11px] text-[var(--red)]/70">
                    {showDeleteConfirm 
                      ? "This action cannot be undone. All data will be wiped." 
                      : "Permanently delete your account and all financial data."}
                  </p>
                </div>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 bg-transparent border border-[var(--red)]/30 text-[var(--red)] hover:bg-[var(--red)]/10 rounded-xl text-[11px] font-semibold transition-all">Cancel</button>
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-3 py-1.5 bg-[var(--red)] hover:bg-[var(--red)]/90 text-white rounded-xl text-[11px] font-semibold transition-all flex items-center gap-2"
                    >
                      {isDeleting ? "Deleting..." : "Confirm Delete"}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowDeleteConfirm(true)} className="px-3 py-1.5 bg-[var(--red)] hover:bg-[var(--red)]/90 text-white rounded-xl text-[11px] font-semibold transition-all duration-300">Delete</button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
