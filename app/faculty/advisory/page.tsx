import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function FacultyAdvisory() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;

  const faculty = await prisma.faculty.findUnique({
    where: { userId },
    include: { department: true },
  });

  if (!faculty) {
    return <div className="p-8 text-center text-muted-foreground">Faculty profile not found.</div>;
  }

  // Get all students in the faculty's department (advisory class)
  const students = await prisma.student.findMany({
    where: { departmentId: faculty.departmentId },
    include: {
      user: true,
      attendanceRecords: {
        include: { subject: true },
      },
    },
    orderBy: [{ semester: "asc" }, { rollNumber: "asc" }],
  });

  // Build attendance summary per student
  type StudentSummary = {
    id: string;
    name: string;
    email: string;
    rollNumber: string;
    semester: number;
    totalClasses: number;
    attended: number;
    percentage: number;
    subjectBreakdown: {
      subjectCode: string;
      subjectName: string;
      total: number;
      attended: number;
      percentage: number;
    }[];
  };

  const studentSummaries: StudentSummary[] = students.map((student) => {
    const subjectMap = new Map<string, { code: string; name: string; total: number; attended: number }>();

    for (const record of student.attendanceRecords) {
      const existing = subjectMap.get(record.subjectId);
      const isAttended = record.status === "PRESENT" || record.status === "LATE";
      if (existing) {
        existing.total++;
        if (isAttended) existing.attended++;
      } else {
        subjectMap.set(record.subjectId, {
          code: record.subject.code,
          name: record.subject.name,
          total: 1,
          attended: isAttended ? 1 : 0,
        });
      }
    }

    const totalClasses = student.attendanceRecords.length;
    const attended = student.attendanceRecords.filter(
      (r) => r.status === "PRESENT" || r.status === "LATE"
    ).length;
    const percentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;

    const subjectBreakdown = Array.from(subjectMap.values()).map((s) => ({
      subjectCode: s.code,
      subjectName: s.name,
      total: s.total,
      attended: s.attended,
      percentage: s.total > 0 ? Math.round((s.attended / s.total) * 100) : 0,
    }));

    return {
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      rollNumber: student.rollNumber,
      semester: student.semester,
      totalClasses,
      attended,
      percentage,
      subjectBreakdown,
    };
  });

  // At-risk students (below 75%)
  const atRiskStudents = studentSummaries.filter((s) => s.percentage < 75 && s.totalClasses > 0);

  // Group by semester
  const semesters = [...new Set(studentSummaries.map((s) => s.semester))].sort();

  function getPercentageColor(pct: number) {
    if (pct >= 75) return "text-emerald-600 dark:text-emerald-400";
    if (pct >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  }

  function getProgressColor(pct: number) {
    if (pct >= 75) return "[&>div]:bg-emerald-500";
    if (pct >= 60) return "[&>div]:bg-amber-500";
    return "[&>div]:bg-rose-500";
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Class Advisory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Attendance overview for {faculty.department.name} ({faculty.department.code}) students.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentSummaries.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">{faculty.department.code} department</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Semesters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{semesters.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {semesters.map((s) => `Sem ${s}`).join(", ")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Good Standing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {studentSummaries.filter((s) => s.percentage >= 75).length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">≥ 75% attendance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>At Risk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-600">{atRiskStudents.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">&lt; 75% attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Alert */}
      {atRiskStudents.length > 0 && (
        <Card className="border-rose-200 dark:border-rose-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              At-Risk Students
            </CardTitle>
            <CardDescription>Students with attendance below 75% who may need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {atRiskStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50/50 p-3 dark:border-rose-900/30 dark:bg-rose-950/20"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-rose-100 text-rose-700 text-xs font-semibold dark:bg-rose-900/40 dark:text-rose-400">
                        {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.rollNumber} · Sem {student.semester}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={student.percentage}
                      className={`h-2 w-20 ${getProgressColor(student.percentage)}`}
                    />
                    <span className={`text-sm font-bold ${getPercentageColor(student.percentage)}`}>
                      {student.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Semester-wise Tables */}
      {semesters.map((semester) => {
        const semStudents = studentSummaries.filter((s) => s.semester === semester);
        // Collect all unique subjects for this semester
        const allSubjects = new Map<string, string>();
        semStudents.forEach((s) => {
          s.subjectBreakdown.forEach((sub) => {
            allSubjects.set(sub.subjectCode, sub.subjectName);
          });
        });
        const subjectList = Array.from(allSubjects.entries());

        return (
          <Card key={semester}>
            <CardHeader>
              <CardTitle>Semester {semester} Students</CardTitle>
              <CardDescription>
                {semStudents.length} students · Attendance breakdown per subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Student</TableHead>
                      {subjectList.map(([code]) => (
                        <TableHead key={code} className="text-center min-w-[80px]">
                          {code}
                        </TableHead>
                      ))}
                      <TableHead className="text-center min-w-[120px]">Overall</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {semStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-muted text-[10px] font-semibold">
                                {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{student.name}</p>
                              <p className="text-[11px] text-muted-foreground">{student.rollNumber}</p>
                            </div>
                          </div>
                        </TableCell>
                        {subjectList.map(([code]) => {
                          const sub = student.subjectBreakdown.find((s) => s.subjectCode === code);
                          const pct = sub?.percentage ?? 0;
                          return (
                            <TableCell key={code} className="text-center">
                              <span className={`text-sm font-semibold ${getPercentageColor(pct)}`}>
                                {sub ? `${pct}%` : "—"}
                              </span>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress
                              value={student.percentage}
                              className={`h-2 w-16 ${getProgressColor(student.percentage)}`}
                            />
                            <span className={`text-sm font-bold ${getPercentageColor(student.percentage)}`}>
                              {student.percentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className={
                              student.percentage >= 75
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                                : student.percentage >= 60
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                            }
                          >
                            {student.percentage >= 75 ? "Good" : student.percentage >= 60 ? "Warning" : "Critical"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {studentSummaries.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No students found in your department.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
