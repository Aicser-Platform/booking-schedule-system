import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export function StatCard({ title, value, icon: Icon, change, changeLabel, className }: StatCardProps) {
  const isPositive = change && change > 0

  return (
    <Card className={cn("glass-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={cn("font-medium", isPositive ? "text-green-500" : "text-red-500")}>
              {isPositive ? "+" : ""}
              {change}%
            </span>{" "}
            {changeLabel || "from last month"}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
