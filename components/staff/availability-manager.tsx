"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"

interface AvailabilityManagerProps {
  staffId: string
}

const DAYS_OF_WEEK = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
]

export function AvailabilityManager({ staffId }: AvailabilityManagerProps) {
  const [rules, setRules] = useState<any[]>([])
  const [exceptions, setExceptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // New rule form state
  const [newRule, setNewRule] = useState({
    day_of_week: "1",
    start_time: "09:00",
    end_time: "17:00",
  })

  // New exception form state
  const [newException, setNewException] = useState({
    date: "",
    is_available: false,
    reason: "",
  })

  useEffect(() => {
    fetchAvailability()
  }, [staffId])

  const fetchAvailability = async () => {
    setIsLoading(true)
    try {
      const [rulesRes, exceptionsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/availability/rules/${staffId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/availability/exceptions/${staffId}`),
      ])

      const rulesData = await rulesRes.json()
      const exceptionsData = await exceptionsRes.json()

      setRules(rulesData)
      setExceptions(exceptionsData)
    } catch (error) {
      console.error("Error fetching availability:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRule = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/availability/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id: staffId,
          service_id: null,
          day_of_week: Number.parseInt(newRule.day_of_week),
          start_time: newRule.start_time,
          end_time: newRule.end_time,
          timezone: "UTC",
        }),
      })

      if (response.ok) {
        await fetchAvailability()
        setNewRule({ day_of_week: "1", start_time: "09:00", end_time: "17:00" })
      }
    } catch (error) {
      console.error("Error adding rule:", error)
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/availability/rules/${ruleId}`, {
        method: "DELETE",
      })
      await fetchAvailability()
    } catch (error) {
      console.error("Error deleting rule:", error)
    }
  }

  const handleAddException = async () => {
    if (!newException.date) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/availability/exceptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id: staffId,
          service_id: null,
          date: newException.date,
          is_available: newException.is_available,
          reason: newException.reason,
        }),
      })

      if (response.ok) {
        await fetchAvailability()
        setNewException({ date: "", is_available: false, reason: "" })
      }
    } catch (error) {
      console.error("Error adding exception:", error)
    }
  }

  return (
    <Tabs defaultValue="rules" className="space-y-4">
      <TabsList>
        <TabsTrigger value="rules">Weekly Schedule</TabsTrigger>
        <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
      </TabsList>

      <TabsContent value="rules" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Availability Rule</CardTitle>
            <CardDescription>Set your regular weekly working hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select value={newRule.day_of_week} onValueChange={(v) => setNewRule({ ...newRule, day_of_week: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={newRule.start_time}
                  onChange={(e) => setNewRule({ ...newRule, start_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={newRule.end_time}
                  onChange={(e) => setNewRule({ ...newRule, end_time: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleAddRule}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Schedule</CardTitle>
            <CardDescription>Your regular weekly availability</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : rules.length > 0 ? (
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-4">
                      <Badge>{DAYS_OF_WEEK.find((d) => d.value === rule.day_of_week.toString())?.label}</Badge>
                      <span className="text-sm">
                        {rule.start_time} - {rule.end_time}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No availability rules set. Add your first rule above.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="exceptions" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Exception</CardTitle>
            <CardDescription>Block out holidays or add special availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newException.date}
                  onChange={(e) => setNewException({ ...newException, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newException.is_available.toString()}
                  onValueChange={(v) => setNewException({ ...newException, is_available: v === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Unavailable</SelectItem>
                    <SelectItem value="true">Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Input
                placeholder="e.g., Holiday, Vacation, Special hours"
                value={newException.reason}
                onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
              />
            </div>

            <Button onClick={handleAddException}>
              <Plus className="mr-2 h-4 w-4" />
              Add Exception
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Exceptions</CardTitle>
            <CardDescription>Your special availability or blocked dates</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : exceptions.length > 0 ? (
              <div className="space-y-2">
                {exceptions.map((exception) => (
                  <div key={exception.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{exception.date}</span>
                        <Badge variant={exception.is_available ? "default" : "destructive"}>
                          {exception.is_available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      {exception.reason && <p className="text-sm text-muted-foreground">{exception.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No exceptions set.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
