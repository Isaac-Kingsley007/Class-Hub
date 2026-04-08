import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

export default async function FacultySubjects() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;

  const faculty = await prisma.faculty.findUnique({
    where: { userId },
    include: {
      subjects: {
        include: {
          department: true,
          academicRecords: {
            include: {
              student: {
                include: { user: true },
              },
            },
            orderBy: [{ studentId: "asc" }, { examType: "asc" }],
          },
        },
      },
    },
  });

  if (!faculty) {
    return <div className="p-8 text-center text-muted-foreground">Faculty profile not found.</div>;
  }

  // Process each subject
  const subjectData = faculty.subjects.map((subject) => {
    // Group records by student
    const studentMap = new Map<
      string,
      {
        name: string;
        rollNumber: string;
        records: {
          examType: string | null;
          marksObtained: number;
          totalMarks: number;
          grade: string | null;
        }[];
      }
    >();

    for (const record of subject.academicRecords) {
      const existing = studentMap.get(record.studentId);
      const entry = {
        examType: record.examType,
        marksObtained: record.marksObtained,
        totalMarks: record.totalMarks,
        grade: record.grade,
      };
      if (existing) {
        existing.records.push(entry);
      } else {
        studentMap.set(record.studentId, {
          name: record.student.user.name,
          rollNumber: record.student.rollNumber,
          records: [entry],
        });
      }
    }

    const students = Array.from(studentMap.entries()).map(([id, data]) => {
      const midterm = data.records.find((r) => r.examType === "Midterm");
      const assignment = data.records.find((r) => r.examType === "Assignment");
      const final_ = data.records.find((r) => r.examType === "Final");
      const totalObtained = data.records.reduce((sum, r) => sum + r.marksObtained, 0);
      const totalMax = data.records.reduce((sum, r) => sum + r.totalMarks, 0);
      const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
      // Use final grade if available, otherwise midterm
      const overallGrade = final_?.grade || midterm?.grade || null;

      return {
        id,
        name: data.name,
        rollNumber: data.rollNumber,
        midterm,
        assignment,
        final: final_,
        totalObtained,
        totalMax,
        percentage,
        overallGrade,
      };
    });

    // Stats
    const allPercentages = students.map((s) => s.percentage);
    const avgPercentage =
      allPercentages.length > 0
        ? Math.round(allPercentages.reduce((a, b) => a + b, 0) / allPercentages.length)
        : 0;
    const passCount = students.filter((s) => s.percentage >= 40).length;
    const passPercentage = students.length > 0 ? Math.round((passCount / students.length) * 100) : 0;

    // Grade distribution
    const gradeDist: Record<string, number> = {};
    for (const s of students) {
      if (s.overallGrade) {
        gradeDist[s.overallGrade] = (gradeDist[s.overallGrade] || 0) + 1;
      }
    }

    return {
      subject,
      students,
      avgPercentage,
      passPercentage,
      passCount,
      gradeDist,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Subject Marks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Academic records for all subjects you handle. View student marks, grades, and performance.
        </p>
      </div>

      {/* Overview Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{faculty.subjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students (Unique)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(subjectData.flatMap((s) => s.students.map((st) => st.id))).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {subjectData.reduce((sum, s) => sum + s.students.reduce((acc, st) => acc + (st.midterm ? 1 : 0) + (st.assignment ? 1 : 0) + (st.final ? 1 : 0), 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Subject Cards */}
      {subjectData.map(({ subject, students, avgPercentage, passPercentage, passCount, gradeDist }) => (
        <Card key={subject.id}>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-sm font-bold">
                  {subject.code.slice(0, 3)}
                </div>
                <div>
                  <CardTitle>{subject.name}</CardTitle>
                  <CardDescription>
                    {subject.code} · {subject.credits} Credits · Semester {subject.semester} · {subject.department.code}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400">
                  Avg: {avgPercentage}%
                </Badge>
                <Badge variant="secondary" className={passPercentage >= 70 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"}>
                  Pass: {passCount}/{students.length} ({passPercentage}%)
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Grade Distribution Row */}
            {Object.keys(gradeDist).length > 0 && (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(gradeLabels).map(([key, label]) => {
                    const count = gradeDist[key] || 0;
                    if (count === 0) return null;
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${gradeColors[key]}`}
                      >
                        <span className="font-bold">{label}</span>
                        <span>×{count}</span>
                      </div>
                    );
                  })}
                </div>
                <Separator className="mb-4" />
              </>
            )}

            {/* Marks Table */}
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No academic records for this subject yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Student</TableHead>
                      <TableHead className="text-center">Midterm</TableHead>
                      <TableHead className="text-center">Assignment</TableHead>
                      <TableHead className="text-center">Final</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">%</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
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
                        <TableCell className="text-center">
                          {student.midterm ? (
                            <span className="text-sm font-medium">
                              {student.midterm.marksObtained}
                              <span className="text-muted-foreground">/{student.midterm.totalMarks}</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {student.assignment ? (
                            <span className="text-sm font-medium">
                              {student.assignment.marksObtained}
                              <span className="text-muted-foreground">/{student.assignment.totalMarks}</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {student.final ? (
                            <span className="text-sm font-medium">
                              {student.final.marksObtained}
                              <span className="text-muted-foreground">/{student.final.totalMarks}</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {student.totalObtained}
                          <span className="text-muted-foreground font-normal">/{student.totalMax}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-bold ${
                              student.percentage >= 80
                                ? "text-emerald-600"
                                : student.percentage >= 50
                                ? "text-amber-600"
                                : "text-rose-600"
                            }`}
                          >
                            {student.percentage}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {student.overallGrade ? (
                            <Badge className={gradeColors[student.overallGrade]} variant="secondary">
                              {gradeLabels[student.overallGrade]}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {faculty.subjects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No subjects assigned to you yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
