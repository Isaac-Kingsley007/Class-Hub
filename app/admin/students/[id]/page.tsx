import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const gradeLabels: Record<string, string> = {
  A_PLUS: "A+", A: "A", B_PLUS: "B+", B: "B", C_PLUS: "C+", C: "C", D: "D", F: "F",
};
const gradeColors: Record<string, string> = {
  A_PLUS: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  A: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  B_PLUS: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  B: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  C_PLUS: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  C: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  D: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  F: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
};

export default async function AdminStudentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      department: true,
      attendanceRecords: {
        include: { subject: true, faculty: { include: { user: true } } },
        orderBy: { date: "desc" },
      },
      academicRecords: {
        include: { subject: true, faculty: { include: { user: true } } },
        orderBy: [{ subjectId: "asc" }, { examType: "asc" }],
      },
    },
  });

  if (!student) notFound();

  const initials = student.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Attendance summary by subject
  const attendanceBySubject = new Map<string, { code: string; name: string; total: number; present: number; absent: number; late: number; excused: number }>();
  for (const r of student.attendanceRecords) {
    const existing = attendanceBySubject.get(r.subjectId);
    const isPresent = r.status === "PRESENT";
    const isLate = r.status === "LATE";
    const isAbsent = r.status === "ABSENT";
    const isExcused = r.status === "EXCUSED";
    if (existing) {
      existing.total++;
      if (isPresent) existing.present++;
      if (isAbsent) existing.absent++;
      if (isLate) existing.late++;
      if (isExcused) existing.excused++;
    } else {
      attendanceBySubject.set(r.subjectId, {
        code: r.subject.code, name: r.subject.name,
        total: 1, present: isPresent ? 1 : 0, absent: isAbsent ? 1 : 0, late: isLate ? 1 : 0, excused: isExcused ? 1 : 0,
      });
    }
  }

  const totalClasses = student.attendanceRecords.length;
  const totalPresent = student.attendanceRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const overallPct = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

  function pctColor(pct: number) {
    if (pct >= 75) return "text-emerald-600";
    if (pct >= 60) return "text-amber-600";
    return "text-rose-600";
  }
  function progressColor(pct: number) {
    if (pct >= 75) return "[&>div]:bg-emerald-500";
    if (pct >= 60) return "[&>div]:bg-amber-500";
    return "[&>div]:bg-rose-500";
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/students" className="hover:text-foreground">Students</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{student.user.name}</span>
      </div>

      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-indigo-600 to-violet-600" />
        <CardContent className="-mt-10 pb-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{student.user.name}</h2>
              <p className="text-sm text-muted-foreground">{student.user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">{student.department.code}</Badge>
                <Badge variant="secondary">Semester {student.semester}</Badge>
                <Badge variant="secondary">Roll: {student.rollNumber}</Badge>
              </div>
            </div>
            <Link href="/admin/students">
              <Button variant="outline" size="sm">← Back to List</Button>
            </Link>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-semibold">{student.department.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Enrollment Year</p>
              <p className="font-semibold">{student.enrollmentYear}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-semibold">{student.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <p className="font-semibold">
                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="font-semibold">{student.address || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>Overall: {totalPresent}/{totalClasses} classes ({overallPct}%)</CardDescription>
            </div>
            <Badge className={`text-sm font-bold ${overallPct >= 75 ? "bg-emerald-100 text-emerald-700" : overallPct >= 60 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`} variant="secondary">
              {overallPct}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Present</TableHead>
                  <TableHead className="text-center">Absent</TableHead>
                  <TableHead className="text-center">Late</TableHead>
                  <TableHead className="w-[160px]">Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(attendanceBySubject.values()).map((s) => {
                  const pct = s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0;
                  return (
                    <TableRow key={s.code}>
                      <TableCell>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.code}</p>
                      </TableCell>
                      <TableCell className="text-center">{s.total}</TableCell>
                      <TableCell className="text-center text-emerald-600 font-medium">{s.present}</TableCell>
                      <TableCell className="text-center text-rose-600 font-medium">{s.absent}</TableCell>
                      <TableCell className="text-center text-amber-600 font-medium">{s.late}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className={`h-2 flex-1 ${progressColor(pct)}`} />
                          <span className={`text-sm font-bold ${pctColor(pct)}`}>{pct}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Academic Records */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Records</CardTitle>
          <CardDescription>All exam results and grades</CardDescription>
        </CardHeader>
        <CardContent>
          {student.academicRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No academic records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead className="text-center">Marks</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">%</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.academicRecords.map((r) => {
                    const pct = r.totalMarks > 0 ? Math.round((r.marksObtained / r.totalMarks) * 100) : 0;
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <p className="font-medium">{r.subject.name}</p>
                          <p className="text-xs text-muted-foreground">{r.subject.code}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{r.examType || "—"}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold">{r.marksObtained}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{r.totalMarks}</TableCell>
                        <TableCell className="text-center">
                          <span className={`font-semibold ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                            {pct}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {r.grade ? (
                            <Badge className={gradeColors[r.grade]} variant="secondary">
                              {gradeLabels[r.grade]}
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.faculty.user.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.academicYear}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
