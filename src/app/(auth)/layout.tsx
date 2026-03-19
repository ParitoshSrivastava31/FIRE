import React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/50 flex flex-col justify-center items-center p-4">
      {children}
    </div>
  )
}
