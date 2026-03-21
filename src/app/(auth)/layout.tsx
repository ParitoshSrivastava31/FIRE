import React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb bg-[var(--gold)] w-[400px] h-[400px] top-[-10%] right-[10%] animate-drift" style={{ animationDuration: '30s' }} />
        <div className="orb bg-[var(--blue)] w-[300px] h-[300px] bottom-[5%] left-[5%] animate-drift" style={{ animationDelay: '-10s', animationDuration: '25s' }} />
      </div>
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  )
}
