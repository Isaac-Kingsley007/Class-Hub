"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SubjectPerf {
  name: string;
  pct: number;
}

interface AcademicsChartsProps {
  gradeCounts: Record<string, number>;
  subjectPerformances: SubjectPerf[];
}

const GRADE_COLORS: Record<string, string> = {
  A_PLUS: "#10b981",
  A: "#34d399",
  B_PLUS: "#38bdf8",
  B: "#60a5fa",
  C_PLUS: "#f59e0b",
  C: "#fb923c",
  D: "#f97316",
  F: "#f43f5e",
};

const GRADE_LABELS: Record<string, string> = {
  A_PLUS: "A+",
  A: "A",
  B_PLUS: "B+",
  B: "B",
  C_PLUS: "C+",
  C: "C",
  D: "D",
  F: "F",
};

// A nice palette for radar chart
const RADAR_COLOR = "#6366f1";

export function AcademicsCharts({ gradeCounts, subjectPerformances }: AcademicsChartsProps) {
  const pieData = Object.entries(gradeCounts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      name: GRADE_LABELS[key] ?? key,
      value: count,
      key,
    }));

  const radarData = subjectPerformances.map((s) => ({
    subject: s.name.length > 10 ? s.name.slice(0, 10) + "…" : s.name,
    score: s.pct,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Grade Distribution Pie */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
          <CardDescription>Breakdown of grades across all exams</CardDescription>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No grade data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={true}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.key} fill={GRADE_COLORS[entry.key] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} exam${value !== 1 ? "s" : ""}`,
                    `Grade ${name}`,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Subject Performance Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
          <CardDescription>Overall percentage per subject (all exams combined)</CardDescription>
        </CardHeader>
        <CardContent>
          {radarData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No subject data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar
                  name="Score %"
                  dataKey="score"
                  stroke={RADAR_COLOR}
                  fill={RADAR_COLOR}
                  fillOpacity={0.35}
                />
                <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
