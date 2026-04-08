"use client";

import { useState } from "react";
import { markAttendanceBulk } from "@/app/faculty/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  departmentCode: string;
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  semester: number;
}

interface ExistingRecord {
  studentId: string;
  status: string;
  remarks: string | null;
}

interface Props {
  subjects: Subject[];
  studentsBySubject: Record<string, Student[]>;
  existingBySubjectDate: Record<string, ExistingRecord[]>;
}

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export function AttendanceMarker({ subjects, studentsBySubject, existingBySubjectDate }: Props) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const students = studentsBySubject[selectedSubject] || [];

  // Load existing attendance when subject/date changes
  function loadExisting(subjectId: string, dateStr: string) {
    const key = `${subjectId}_${dateStr}`;
    const existing = existingBySubjectDate[key] || [];
    const newStatuses: Record<string, AttendanceStatus> = {};
    const newRemarks: Record<string, string> = {};

    // Default all to PRESENT
    const subStudents = studentsBySubject[subjectId] || [];
    for (const s of subStudents) {
      newStatuses[s.id] = "PRESENT";
      newRemarks[s.id] = "";
    }

    // Override with existing data
    for (const r of existing) {
      newStatuses[r.studentId] = r.status as AttendanceStatus;
      newRemarks[r.studentId] = r.remarks || "";
    }

    setStatuses(newStatuses);
    setRemarks(newRemarks);
  }

  function handleSubjectChange(subjectId: string) {
    setSelectedSubject(subjectId);
    setResult(null);
    loadExisting(subjectId, date);
  }

  function handleDateChange(newDate: string) {
    setDate(newDate);
    setResult(null);
    loadExisting(selectedSubject, newDate);
  }

  // Initialize on first render
  if (selectedSubject && Object.keys(statuses).length === 0 && students.length > 0) {
    loadExisting(selectedSubject, date);
  }

  function setAllStatus(status: AttendanceStatus) {
    const newStatuses: Record<string, AttendanceStatus> = {};
    for (const s of students) {
      newStatuses[s.id] = status;
    }
    setStatuses(newStatuses);
  }

  async function handleSubmit() {
    setPending(true);
    setResult(null);

    const formData = new FormData();
    formData.set("subjectId", selectedSubject);
    formData.set("date", date);

    for (const s of students) {
      formData.set(`status_${s.id}`, statuses[s.id] || "PRESENT");
      if (remarks[s.id]) {
        formData.set(`remarks_${s.id}`, remarks[s.id]);
      }
    }

    const res = await markAttendanceBulk(formData);
    if (res.error) {
      setResult({ type: "error", message: res.error });
    } else {
      setResult({ type: "success", message: `Attendance saved for ${res.count} students!` });
    }
    setPending(false);
  }

  const statusOptions: { value: AttendanceStatus; label: string; color: string; bgColor: string }[] = [
    { value: "PRESENT", label: "P", color: "text-emerald-700", bgColor: "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-900/70" },
    { value: "ABSENT", label: "A", color: "text-rose-700", bgColor: "bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/50 dark:hover:bg-rose-900/70" },
    { value: "LATE", label: "L", color: "text-amber-700", bgColor: "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-900/70" },
    { value: "EXCUSED", label: "E", color: "text-sky-700", bgColor: "bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/50 dark:hover:bg-sky-900/70" },
  ];

  const presentCount = Object.values(statuses).filter((s) => s === "PRESENT").length;
  const absentCount = Object.values(statuses).filter((s) => s === "ABSENT").length;
  const lateCount = Object.values(statuses).filter((s) => s === "LATE").length;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class & Date</CardTitle>
          <CardDescription>Choose the subject and date to mark attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.code} — {s.name} (Sem {s.semester})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No students enrolled for the selected subject.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quick Actions + Summary */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Mark all:</span>
              {statusOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant="outline"
                  size="sm"
                  className={`${opt.bgColor} ${opt.color} border-0`}
                  onClick={() => setAllStatus(opt.value)}
                >
                  {opt.value}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                Present: {presentCount}
              </Badge>
              <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400">
                Absent: {absentCount}
              </Badge>
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                Late: {lateCount}
              </Badge>
            </div>
          </div>

          {/* Student List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {subjects.find((s) => s.id === selectedSubject)?.name || "Select Subject"}
              </CardTitle>
              <CardDescription>{students.length} students · {date}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {students.map((student, idx) => {
                  const currentStatus = statuses[student.id] || "PRESENT";
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                        currentStatus === "PRESENT"
                          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20"
                          : currentStatus === "ABSENT"
                          ? "border-rose-200 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20"
                          : currentStatus === "LATE"
                          ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20"
                          : "border-sky-200 bg-sky-50/50 dark:border-sky-900/30 dark:bg-sky-950/20"
                      }`}
                    >
                      {/* Index */}
                      <span className="text-xs font-medium text-muted-foreground w-6 text-right">
                        {idx + 1}.
                      </span>

                      {/* Avatar */}
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-[10px] font-semibold">
                          {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <p className="text-[11px] text-muted-foreground">{student.rollNumber}</p>
                      </div>

                      {/* Status Buttons */}
                      <div className="flex items-center gap-1">
                        {statusOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              setStatuses((prev) => ({ ...prev, [student.id]: opt.value }))
                            }
                            className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-all ${
                              currentStatus === opt.value
                                ? `${opt.bgColor} ${opt.color} ring-2 ring-offset-1 ring-current scale-110`
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            }`}
                            title={opt.value}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Remarks */}
                      <Input
                        placeholder="Remarks (optional)"
                        className="w-32 sm:w-40 text-xs h-8"
                        value={remarks[student.id] || ""}
                        onChange={(e) =>
                          setRemarks((prev) => ({ ...prev, [student.id]: e.target.value }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-between">
            {result && (
              <p
                className={`text-sm font-medium ${
                  result.type === "success" ? "text-emerald-600" : "text-destructive"
                }`}
              >
                {result.message}
              </p>
            )}
            <div className="ml-auto">
              <Button
                onClick={handleSubmit}
                disabled={pending}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
              >
                {pending ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
