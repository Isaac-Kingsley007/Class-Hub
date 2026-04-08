import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

export default async function AdminFacultyDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const faculty = await prisma.faculty.findUnique({
    where: { id },
    include: {
      user: true,
      department: true,
      subjects: {
        include: {
          department: true,
          academicRecords: {
            include: { student: { include: { user: true } } },
            orderBy: [{ studentId: "asc" }, { examType: "asc" }],
          },
          _count: { select: { attendanceRecords: true } },
        },
      },
    },
  });

  if (!faculty) notFound();

  const initials = faculty.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/faculty" className="hover:text-foreground">Faculty</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{faculty.user.name}</span>
      </div>

      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-emerald-600 to-teal-600" />
        <CardContent className="-mt-10 pb-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{faculty.user.name}</h2>
              <p className="text-sm text-muted-foreground">{faculty.user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">{faculty.department.code}</Badge>
                {faculty.designation && <Badge variant="secondary">{faculty.designation}</Badge>}
                <Badge variant="secondary">ID: {faculty.employeeId}</Badge>
              </div>
            </div>
            <Link href="/admin/faculty">
              <Button variant="outline" size="sm">← Back to List</Button>
            </Link>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-semibold">{faculty.department.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-semibold">{faculty.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Joining</p>
              <p className="font-semibold">
                {faculty.dateOfJoining ? new Date(faculty.dateOfJoining).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Subjects Handling</p>
              <p className="font-semibold">{faculty.subjects.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects & Their Students' Marks */}
      {faculty.subjects.map((subject) => {
        // Group academic records by student for this subject
        const studentMap = new Map<string, {
          name: string;
          rollNumber: string;
          records: { examType: string | null; marksObtained: number; totalMarks: number; grade: string | null }[];
        }>();

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

        const students = Array.from(studentMap.entries()).map(([sid, data]) => {
          const midterm = data.records.find((r) => r.examType === "Midterm");
          const assignment = data.records.find((r) => r.examType === "Assignment");
          const final_ = data.records.find((r) => r.examType === "Final");
          const totalObtained = data.records.reduce((sum, r) => sum + r.marksObtained, 0);
          const totalMax = data.records.reduce((sum, r) => sum + r.totalMarks, 0);
          const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
          const overallGrade = final_?.grade || midterm?.grade || null;
          return { id: sid, ...data, midterm, assignment, final: final_, totalObtained, totalMax, percentage, overallGrade };
        });

        return (
          <Card key={subject.id}>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-bold">
                    {subject.code.slice(0, 3)}
                  </div>
                  <div>
                    <CardTitle>{subject.name}</CardTitle>
                    <CardDescription>{subject.code} · {subject.credits} Credits · Semester {subject.semester} · {subject.department.code}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{students.length} Students</Badge>
                  <Badge variant="secondary">{subject._count.attendanceRecords} Attendance Records</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No academic records yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="text-center">Midterm</TableHead>
                        <TableHead className="text-center">Assignment</TableHead>
                        <TableHead className="text-center">Final</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">%</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <Link href={`/admin/students/${s.id}`} className="hover:underline">
                              <p className="text-sm font-medium">{s.name}</p>
                              <p className="text-[11px] text-muted-foreground">{s.rollNumber}</p>
                            </Link>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {s.midterm ? <>{s.midterm.marksObtained}<span className="text-muted-foreground">/{s.midterm.totalMarks}</span></> : "—"}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {s.assignment ? <>{s.assignment.marksObtained}<span className="text-muted-foreground">/{s.assignment.totalMarks}</span></> : "—"}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {s.final ? <>{s.final.marksObtained}<span className="text-muted-foreground">/{s.final.totalMarks}</span></> : "—"}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {s.totalObtained}<span className="text-muted-foreground font-normal">/{s.totalMax}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${s.percentage >= 80 ? "text-emerald-600" : s.percentage >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                              {s.percentage}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {s.overallGrade ? (
                              <Badge className={gradeColors[s.overallGrade]} variant="secondary">
                                {gradeLabels[s.overallGrade]}
                              </Badge>
                            ) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {faculty.subjects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No subjects assigned to this faculty member.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
