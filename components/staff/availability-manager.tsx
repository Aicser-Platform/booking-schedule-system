"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

interface AvailabilityManagerProps {
  staffId: string;
}

const DAYS_OF_WEEK = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const apiUrl = "";

export function AvailabilityManager({ staffId }: AvailabilityManagerProps) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [workBlocks, setWorkBlocks] = useState<any[]>([]);
  const [breakBlocks, setBreakBlocks] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const effectiveStaffId = "me";

  const [newScheduleTimezone, setNewScheduleTimezone] = useState("UTC");
  const [newWorkBlock, setNewWorkBlock] = useState({
    weekday: "1",
    start_time_local: "09:00",
    end_time_local: "17:00",
  });
  const [newBreakBlock, setNewBreakBlock] = useState({
    weekday: "1",
    start_time_local: "12:00",
    end_time_local: "13:00",
  });
  const [newException, setNewException] = useState({
    type: "time_off",
    start_utc: "",
    end_utc: "",
    is_all_day: false,
    reason: "",
  });

  const [requestType, setRequestType] = useState<"weekly" | "exception">(
    "weekly",
  );
  const [requestAction, setRequestAction] = useState<
    "add" | "update" | "delete"
  >("add");
  const [requestWeekday, setRequestWeekday] = useState("1");
  const [requestStartTime, setRequestStartTime] = useState("09:00");
  const [requestEndTime, setRequestEndTime] = useState("17:00");
  const [requestBlockId, setRequestBlockId] = useState("");
  const [exceptionType, setExceptionType] = useState<
    "time_off" | "blocked_time" | "extra_availability" | "override_day"
  >("time_off");
  const [exceptionStart, setExceptionStart] = useState("");
  const [exceptionEnd, setExceptionEnd] = useState("");
  const [exceptionAllDay, setExceptionAllDay] = useState(false);
  const [requestExceptionId, setRequestExceptionId] = useState("");
  const [requestReason, setRequestReason] = useState("");

  useEffect(() => {
    void fetchSchedules();
    void fetchExceptions();
  }, [staffId]);

  useEffect(() => {
    if (activeScheduleId) {
      void fetchBlocks(activeScheduleId);
    }
  }, [activeScheduleId]);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/availability/weekly-schedules/${effectiveStaffId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
        const defaultSchedule =
          data.find((schedule: any) => schedule.is_default) || data[0];
        setActiveScheduleId(defaultSchedule?.id ?? null);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlocks = async (scheduleId: string) => {
    try {
      const res = await fetch(
        `/api/availability/weekly-schedules/${scheduleId}/blocks`,
      );
      if (res.ok) {
        const data = await res.json();
        setWorkBlocks(data.work_blocks || []);
        setBreakBlocks(data.break_blocks || []);
      }
    } catch (error) {
      console.error("Error fetching blocks:", error);
    }
  };

  const fetchExceptions = async () => {
    try {
      const res = await fetch(
        `/api/availability/staff-exceptions/${effectiveStaffId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setExceptions(data);
      }
    } catch (error) {
      console.error("Error fetching exceptions:", error);
    }
  };

  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await fetch(`/api/availability/schedule-requests`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
        setRequestError(null);
      } else if (res.status === 403) {
        setRequestError(
          "Access denied. Please sign in with a staff/admin account.",
        );
      } else {
        setRequestError("Unable to load requests. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequestError("Unable to load requests. Please try again.");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      const res = await fetch(`/api/availability/weekly-schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id: effectiveStaffId,
          timezone: newScheduleTimezone,
          is_default: true,
        }),
      });
      if (res.ok) {
        await fetchSchedules();
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  const handleAddWorkBlock = async () => {
    if (!activeScheduleId) return;
    try {
      const res = await fetch(
        `/api/availability/weekly-schedules/work-blocks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schedule_id: activeScheduleId,
            weekday: Number.parseInt(newWorkBlock.weekday),
            start_time_local: newWorkBlock.start_time_local,
            end_time_local: newWorkBlock.end_time_local,
          }),
        },
      );
      if (res.ok) {
        await fetchBlocks(activeScheduleId);
      }
    } catch (error) {
      console.error("Error adding work block:", error);
    }
  };

  const handleAddBreakBlock = async () => {
    if (!activeScheduleId) return;
    try {
      const res = await fetch(
        `/api/availability/weekly-schedules/break-blocks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schedule_id: activeScheduleId,
            weekday: Number.parseInt(newBreakBlock.weekday),
            start_time_local: newBreakBlock.start_time_local,
            end_time_local: newBreakBlock.end_time_local,
          }),
        },
      );
      if (res.ok) {
        await fetchBlocks(activeScheduleId);
      }
    } catch (error) {
      console.error("Error adding break block:", error);
    }
  };

  const handleDeleteWorkBlock = async (blockId: string) => {
    try {
      await fetch(`/api/availability/weekly-schedules/work-blocks/${blockId}`, {
        method: "DELETE",
      });
      if (activeScheduleId) {
        await fetchBlocks(activeScheduleId);
      }
    } catch (error) {
      console.error("Error deleting work block:", error);
    }
  };

  const handleDeleteBreakBlock = async (blockId: string) => {
    try {
      await fetch(
        `/api/availability/weekly-schedules/break-blocks/${blockId}`,
        {
          method: "DELETE",
        },
      );
      if (activeScheduleId) {
        await fetchBlocks(activeScheduleId);
      }
    } catch (error) {
      console.error("Error deleting break block:", error);
    }
  };

  const handleAddException = async () => {
    if (!newException.start_utc || !newException.end_utc) return;
    try {
      const res = await fetch(`/api/availability/staff-exceptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id: effectiveStaffId,
          type: newException.type,
          start_utc: newException.start_utc,
          end_utc: newException.end_utc,
          is_all_day: newException.is_all_day,
          reason: newException.reason,
        }),
      });
      if (res.ok) {
        setNewException({
          type: "time_off",
          start_utc: "",
          end_utc: "",
          is_all_day: false,
          reason: "",
        });
        await fetchExceptions();
      }
    } catch (error) {
      console.error("Error adding exception:", error);
    }
  };

  const handleDeleteException = async (exceptionId: string) => {
    try {
      await fetch(`/api/availability/staff-exceptions/${exceptionId}`, {
        method: "DELETE",
      });
      await fetchExceptions();
    } catch (error) {
      console.error("Error deleting exception:", error);
    }
  };

  const handleSubmitRequest = async () => {
    setIsSubmittingRequest(true);
    try {
      const needsBlockId = requestType === "weekly" && requestAction !== "add";
      const needsExceptionId =
        requestType === "exception" && requestAction !== "add";
      if (needsBlockId && !requestBlockId) {
        setIsSubmittingRequest(false);
        return;
      }
      if (needsExceptionId && !requestExceptionId) {
        setIsSubmittingRequest(false);
        return;
      }

      const payload =
        requestType === "weekly"
          ? {
              target: "weekly_schedule",
              action: requestAction,
              weekday: Number.parseInt(requestWeekday),
              start_time: requestStartTime,
              end_time: requestEndTime,
              block_id: requestAction === "add" ? null : requestBlockId,
            }
          : {
              target: "exception",
              action: requestAction,
              type: exceptionType,
              start_utc: exceptionStart || null,
              end_utc: exceptionEnd || null,
              is_all_day: exceptionAllDay,
              exception_id: requestAction === "add" ? null : requestExceptionId,
            };

      if (requestType === "exception" && (!exceptionStart || !exceptionEnd)) {
        setIsSubmittingRequest(false);
        return;
      }
      const response = await fetch(`/api/availability/schedule-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id: effectiveStaffId,
          payload,
          reason: requestReason || null,
        }),
      });

      if (response.ok) {
        setRequestType("weekly");
        setRequestAction("add");
        setRequestWeekday("1");
        setRequestStartTime("09:00");
        setRequestEndTime("17:00");
        setRequestBlockId("");
        setExceptionType("time_off");
        setExceptionStart("");
        setExceptionEnd("");
        setExceptionAllDay(false);
        setRequestExceptionId("");
        setRequestReason("");
        await fetchRequests();
      }
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const activeSchedule = useMemo(
    () => schedules.find((schedule) => schedule.id === activeScheduleId),
    [schedules, activeScheduleId],
  );

  const requestBlockOptions = useMemo(
    () =>
      workBlocks.map((block) => ({
        id: block.id,
        label: `${
          DAYS_OF_WEEK.find((day) => day.value === block.weekday.toString())
            ?.label || "Day"
        } ${block.start_time_local} - ${block.end_time_local}`,
      })),
    [workBlocks],
  );

  const requestExceptionOptions = useMemo(
    () =>
      exceptions.map((exception) => ({
        id: exception.id,
        label: `${exception.type?.replace("_", " ") || "Exception"} ${new Date(
          exception.start_utc,
        ).toLocaleString()} - ${new Date(exception.end_utc).toLocaleString()}`,
      })),
    [exceptions],
  );

  return (
    <Tabs defaultValue="weekly" className="space-y-4">
      <TabsList>
        <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
        <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
        <TabsTrigger value="requests" onClick={fetchRequests}>
          Requests
        </TabsTrigger>
      </TabsList>

      <TabsContent value="weekly" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Template</CardTitle>
            <CardDescription>Weekly working hours and breaks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedules.length === 0 ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Schedule timezone</Label>
                  <Input
                    value={newScheduleTimezone}
                    onChange={(e) => setNewScheduleTimezone(e.target.value)}
                    placeholder="Asia/Phnom_Penh"
                  />
                </div>
                <Button onClick={handleCreateSchedule}>Create Schedule</Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Active schedule</Label>
                  <Select
                    value={activeScheduleId || ""}
                    onValueChange={(v) => setActiveScheduleId(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {schedules.map((schedule) => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          {schedule.is_default ? "Default" : "Seasonal"} (
                          {schedule.timezone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                  <div>Timezone: {activeSchedule?.timezone || "UTC"}</div>
                  <div>
                    Effective: {activeSchedule?.effective_from || "Always"} -{" "}
                    {activeSchedule?.effective_to || ""}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Working Blocks</CardTitle>
            <CardDescription>Define working hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Day of week</Label>
                <Select
                  value={newWorkBlock.weekday}
                  onValueChange={(v) =>
                    setNewWorkBlock({ ...newWorkBlock, weekday: v })
                  }
                >
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
                <Label>Start time</Label>
                <Input
                  type="time"
                  value={newWorkBlock.start_time_local}
                  onChange={(e) =>
                    setNewWorkBlock({
                      ...newWorkBlock,
                      start_time_local: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End time</Label>
                <Input
                  type="time"
                  value={newWorkBlock.end_time_local}
                  onChange={(e) =>
                    setNewWorkBlock({
                      ...newWorkBlock,
                      end_time_local: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button onClick={handleAddWorkBlock} disabled={!activeScheduleId}>
              <Plus className="mr-2 h-4 w-4" />
              Add Work Block
            </Button>
            {workBlocks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No work blocks yet.
              </p>
            ) : (
              <div className="space-y-2">
                {workBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Badge>
                        {
                          DAYS_OF_WEEK.find(
                            (day) => day.value === block.weekday.toString(),
                          )?.label
                        }
                      </Badge>
                      <span className="text-sm">
                        {block.start_time_local} - {block.end_time_local}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWorkBlock(block.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Break Blocks</CardTitle>
            <CardDescription>Add breaks inside working hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Day of week</Label>
                <Select
                  value={newBreakBlock.weekday}
                  onValueChange={(v) =>
                    setNewBreakBlock({ ...newBreakBlock, weekday: v })
                  }
                >
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
                <Label>Start time</Label>
                <Input
                  type="time"
                  value={newBreakBlock.start_time_local}
                  onChange={(e) =>
                    setNewBreakBlock({
                      ...newBreakBlock,
                      start_time_local: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End time</Label>
                <Input
                  type="time"
                  value={newBreakBlock.end_time_local}
                  onChange={(e) =>
                    setNewBreakBlock({
                      ...newBreakBlock,
                      end_time_local: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button onClick={handleAddBreakBlock} disabled={!activeScheduleId}>
              <Plus className="mr-2 h-4 w-4" />
              Add Break Block
            </Button>
            {breakBlocks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No break blocks yet.
              </p>
            ) : (
              <div className="space-y-2">
                {breakBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Badge>
                        {
                          DAYS_OF_WEEK.find(
                            (day) => day.value === block.weekday.toString(),
                          )?.label
                        }
                      </Badge>
                      <span className="text-sm">
                        {block.start_time_local} - {block.end_time_local}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBreakBlock(block.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="exceptions" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Exception</CardTitle>
            <CardDescription>
              Time off, blocked time, or extra availability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newException.type}
                  onValueChange={(v) =>
                    setNewException({ ...newException, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time_off">Time off</SelectItem>
                    <SelectItem value="blocked_time">Blocked time</SelectItem>
                    <SelectItem value="extra_availability">
                      Extra availability
                    </SelectItem>
                    <SelectItem value="override_day">Override day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>All day</Label>
                <Select
                  value={newException.is_all_day ? "true" : "false"}
                  onValueChange={(v) =>
                    setNewException({
                      ...newException,
                      is_all_day: v === "true",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start (UTC)</Label>
                <Input
                  type="datetime-local"
                  value={newException.start_utc}
                  onChange={(e) =>
                    setNewException({
                      ...newException,
                      start_utc: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End (UTC)</Label>
                <Input
                  type="datetime-local"
                  value={newException.end_utc}
                  onChange={(e) =>
                    setNewException({
                      ...newException,
                      end_utc: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input
                value={newException.reason}
                onChange={(e) =>
                  setNewException({ ...newException, reason: e.target.value })
                }
                placeholder="Optional reason"
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
            <CardDescription>Time off and special openings</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : exceptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No exceptions set.
              </p>
            ) : (
              <div className="space-y-2">
                {exceptions.map((exception) => (
                  <div
                    key={exception.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge>{exception.type?.replace("_", " ")}</Badge>
                        <span className="text-sm">
                          {new Date(exception.start_utc).toLocaleString()} -{" "}
                          {new Date(exception.end_utc).toLocaleString()}
                        </span>
                      </div>
                      {exception.reason && (
                        <p className="text-sm text-muted-foreground">
                          {exception.reason}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteException(exception.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="requests" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Schedule Change</CardTitle>
            <CardDescription>
              Submit a schedule change for admin approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Request type</Label>
                <Select
                  value={requestType}
                  onValueChange={(v) =>
                    setRequestType(v as "weekly" | "exception")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly schedule</SelectItem>
                    <SelectItem value="exception">Exception</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={requestAction}
                  onValueChange={(v) =>
                    setRequestAction(v as "add" | "update" | "delete")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {requestType === "weekly" ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Day of week</Label>
                  <Select
                    value={requestWeekday}
                    onValueChange={setRequestWeekday}
                  >
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
                  <Label>Start time</Label>
                  <Input
                    type="time"
                    value={requestStartTime}
                    onChange={(e) => setRequestStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End time</Label>
                  <Input
                    type="time"
                    value={requestEndTime}
                    onChange={(e) => setRequestEndTime(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Exception type</Label>
                  <Select
                    value={exceptionType}
                    onValueChange={(v) =>
                      setExceptionType(
                        v as
                          | "time_off"
                          | "blocked_time"
                          | "extra_availability"
                          | "override_day",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time_off">Time off</SelectItem>
                      <SelectItem value="blocked_time">Blocked time</SelectItem>
                      <SelectItem value="extra_availability">
                        Extra availability
                      </SelectItem>
                      <SelectItem value="override_day">Override day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>All day</Label>
                  <Select
                    value={exceptionAllDay ? "true" : "false"}
                    onValueChange={(v) => setExceptionAllDay(v === "true")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start (UTC)</Label>
                  <Input
                    type="datetime-local"
                    value={exceptionStart}
                    onChange={(e) => setExceptionStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End (UTC)</Label>
                  <Input
                    type="datetime-local"
                    value={exceptionEnd}
                    onChange={(e) => setExceptionEnd(e.target.value)}
                  />
                </div>
              </div>
            )}
            {requestType === "weekly" && requestAction !== "add" && (
              <div className="space-y-2">
                <Label>Work block</Label>
                <Select
                  value={requestBlockId}
                  onValueChange={setRequestBlockId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a work block" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestBlockOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {requestType === "exception" && requestAction !== "add" && (
              <div className="space-y-2">
                <Label>Exception</Label>
                <Select
                  value={requestExceptionId}
                  onValueChange={setRequestExceptionId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an exception" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestExceptionOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Optional reason for the request"
              />
            </div>
            <Button
              onClick={handleSubmitRequest}
              disabled={isSubmittingRequest}
            >
              Submit Request
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>My Requests</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRequests}
                disabled={isLoadingRequests}
              >
                {isLoadingRequests ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
            <CardDescription>Track approval status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRequests ? (
              <p className="text-sm text-muted-foreground">
                Loading requests...
              </p>
            ) : requestError ? (
              <p className="text-sm text-destructive">{requestError}</p>
            ) : requests.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm font-medium">No requests yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Submit a schedule change above to start the approval flow.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => {
                  const payload = request.payload || {};
                  const target = payload.target as string | undefined;
                  const action = payload.action as string | undefined;
                  const createdAt = request.created_at
                    ? new Date(request.created_at).toLocaleString()
                    : null;

                  return (
                    <div
                      key={request.id}
                      className="rounded-lg border bg-background/50 p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            Schedule request
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {request.id}
                          </div>
                          {createdAt && (
                            <div className="text-xs text-muted-foreground">
                              Submitted: {createdAt}
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "default"
                              : request.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>

                      {(target || action) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {target && (
                            <Badge variant="outline">
                              Target: {target.replace("_", " ")}
                            </Badge>
                          )}
                          {action && (
                            <Badge variant="outline">Action: {action}</Badge>
                          )}
                        </div>
                      )}

                      {request.reason && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Reason: {request.reason}
                        </p>
                      )}

                      {request.review_note && (
                        <div className="mt-3 rounded-md bg-muted/40 p-3">
                          <p className="text-xs font-medium">Review note</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {request.review_note}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
