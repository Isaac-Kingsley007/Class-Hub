"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DailyRecord {
  id: string;
  date: string; // ISO string
  status: string;
  subjectName: string;
  subjectCode: string;
  remarks: string | null;
}

interface AttendanceChartsProps {
  present: number;
  absent: number;
  late: number;
  excused: number;
  dailyRecords: DailyRecord[];
}

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "#10b981",
  ABSENT: "#f43f5e",
  LATE: "#f59e0b",
  EXCUSED: "#38bdf8",
};

const STATUS_LABELS: Record<string, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  EXCUSED: "Excused",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  ABSENT: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
  LATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  EXCUSED: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AttendanceCharts({ present, absent, late, excused, dailyRecords }: AttendanceChartsProps) {
  const pieData = [
    { name: "Present", value: present, key: "PRESENT" },
    { name: "Absent", value: absent, key: "ABSENT" },
    { name: "Late", value: late, key: "LATE" },
    { name: "Excused", value: excused, key: "EXCUSED" },
  ].filter((d) => d.value > 0);

  const total = present + absent + late + excused;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>Overall attendance status distribution</CardDescription>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} class${value !== 1 ? "es" : ""}`,
                    name,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Stat pills */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Present", value: present, color: "text-emerald-600" },
              { label: "Absent", value: absent, color: "text-rose-600" },
              { label: "Late", value: late, color: "text-amber-600" },
              { label: "Excused", value: excused, color: "text-sky-600" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border p-3 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Records */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Log</CardTitle>
          <CardDescription>Attendance marked by faculty, most recent first</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyRecords.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No daily records marked yet. Your attendance will appear here once a faculty member marks it.
            </p>
          ) : (
            <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
              {dailyRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium">{formatDate(rec.date)}</p>
                    <p className="text-xs text-muted-foreground">
                      {rec.subjectName} · {rec.subjectCode}
                    </p>
                    {rec.remarks && (
                      <p className="text-xs text-muted-foreground italic">"{rec.remarks}"</p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className={STATUS_BADGE_CLASS[rec.status] ?? ""}
                  >
                    {STATUS_LABELS[rec.status] ?? rec.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
