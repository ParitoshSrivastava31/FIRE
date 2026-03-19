import React from "react"
import { BellRing, ShieldAlert, TrendingDown, CheckCircle2, Info, Settings2, Smartphone, Mail, Settings } from "lucide-react"

export const metadata = {
  title: "Alerts & Notifications | Monetra",
  description: "Stay updated on your portfolio, goals, and market movements.",
}

export default function AlertsPage() {
  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "Portfolio Concentration Risk",
      message: "Your small-cap allocation has exceeded 40% of your total equity portfolio. Consider rebalancing into large-cap or flexi-cap funds.",
      time: "2 hours ago",
      icon: <ShieldAlert className="text-amber-500" size={20} />,
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      id: 2,
      type: "stock",
      title: "NTPC Price Target Hit",
      message: "NTPC has dropped below your set threshold of ₹310. It is currently at ₹308.50.",
      time: "5 hours ago",
      icon: <TrendingDown className="text-red-500" size={20} />,
      bg: "bg-red-100 dark:bg-red-900/30",
    },
    {
      id: 3,
      type: "milestone",
      title: "Goal Milestone Reached!",
      message: "Congratulations! You have reached 50% of your Emergency Fund target.",
      time: "1 day ago",
      icon: <CheckCircle2 className="text-green-500" size={20} />,
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      id: 4,
      type: "info",
      title: "SGB Series 2026-I Open",
      message: "The new Sovereign Gold Bond series is open for subscription. This aligns with your 10% gold allocation target.",
      time: "2 days ago",
      icon: <Info className="text-blue-500" size={20} />,
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      id: 5,
      type: "reminder",
      title: "SIP Deduction Tomorrow",
      message: "Your ₹15,000 SIP for Parag Parikh Flexi Cap Fund will be deducted tomorrow. Ensure sufficient balance in your linked bank account.",
      time: "3 days ago",
      icon: <BellRing className="text-purple-500" size={20} />,
      bg: "bg-purple-100 dark:bg-purple-900/30",
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts & Notifications</h1>
          <p className="text-muted-foreground mt-1">Review your recent financial updates and alerts.</p>
        </div>
        <button className="flex items-center gap-2 p-2 px-3 border rounded-md hover:bg-muted bg-background text-sm font-medium transition-colors">
          <Settings2 size={16} />
          <span>Alert Settings</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
              <h2 className="font-semibold text-sm">Recent Alerts</h2>
              <button className="text-xs font-medium text-primary hover:underline">Mark all as read</button>
            </div>
            <div className="divide-y text-sm">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 flex gap-4 hover:bg-muted/10 transition-colors">
                  <div className={"w-10 h-10 rounded-full flex items-center justify-center shrink-0 " + alert.bg}>
                    {alert.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{alert.time}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{alert.message}</p>
                    
                    {alert.type === 'warning' && (
                      <div className="mt-3">
                        <button className="text-xs font-medium text-amber-600 dark:text-amber-500 hover:underline">Review Portfolio</button>
                      </div>
                    )}
                    {alert.type === 'stock' && (
                      <div className="mt-3 flex gap-4">
                        <button className="text-xs font-medium text-red-600 dark:text-red-500 hover:underline">Buy Now</button>
                        <button className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">Dismiss</button>
                      </div>
                    )}
                    {alert.type === 'info' && (
                      <div className="mt-3">
                        <button className="text-xs font-medium text-blue-600 dark:text-blue-500 hover:underline">Apply for SGB</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-muted/20 border-t text-center">
              <button className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">Load older alerts</button>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings size={18} className="text-primary" />
              Delivery Preferences
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-md text-foreground"><Smartphone size={16} /></div>
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Enabled for all critical alerts</p>
                  </div>
                </div>
                <div className="w-9 h-5 bg-primary rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-md text-foreground"><Mail size={16} /></div>
                  <div>
                    <p className="font-medium">Email Digest</p>
                    <p className="text-xs text-muted-foreground">Weekly summary on Sunday</p>
                  </div>
                </div>
                <div className="w-9 h-5 bg-primary rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-5 text-center">
            <div className="w-12 h-12 bg-white dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600 shadow-sm">
              <span className="font-bold text-lg">W</span>
            </div>
            <h3 className="font-semibold mb-2">WhatsApp Alerts</h3>
            <p className="text-xs text-muted-foreground mb-4">Get instant price drops, rebalancing signals, and SIP reminders on WhatsApp.</p>
            <button className="w-full py-2 bg-[#25D366] hover:bg-[#20BE5A] text-white rounded-md text-sm font-medium transition-colors shadow-sm">
              Connect WhatsApp (Elite)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
