export function AiBudgetIndicator({ used, limit }: { used: number; limit: number }) {
  const remaining = limit - used
  const pct = (used / limit) * 100

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct > 80 ? 'bg-destructive' : pct > 50 ? 'bg-warning' : 'bg-primary'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span>{remaining} AI queries left this month</span>
    </div>
  )
}
