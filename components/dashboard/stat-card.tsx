import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: number
  changeLabel?: string
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0

  return (
    <Card className={cn("glass-card p-0", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {change !== undefined && (
              <p className="mt-1 text-xs text-muted-foreground">
                {changeLabel || "from last month"}
              </p>
            )}
          </div>
        </div>
        {change !== undefined && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold",
              isPositive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700",
            )}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
        )}
      </CardContent>
    </Card>
  )
}
