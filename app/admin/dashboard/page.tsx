import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function AdminDashboard() {
  const [studentCount, facultyCount, deptCount, subjectCount, attendanceCount, academicCount] =
    await Promise.all([
      prisma.student.count(),
      prisma.faculty.count(),
      prisma.department.count(),
      prisma.subject.count(),
      prisma.attendance.count(),
      prisma.academicRecord.count(),
    ]);

  // Recent students
  const recentStudents = await prisma.student.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true, department: true },
  });

  // Recent faculty
  const recentFaculty = await prisma.faculty.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true, department: true },
  });

  // Department summary
  const departments = await prisma.department.findMany({
    include: {
      _count: { select: { students: true, faculty: true, subjects: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          System overview — manage students, faculty, departments, and subjects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Link href="/admin/students">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription>Students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{studentCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">Enrolled</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/faculty">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription>Faculty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{facultyCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">Members</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/departments">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription>Departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{deptCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/subjects">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription>Subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subjectCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">Offered</p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{attendanceCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Academics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{academicCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">Records</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
          <CardDescription>Summary of all departments and their resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs font-bold">
                    {dept.code.slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{dept.code}</p>
                    <p className="text-xs text-muted-foreground truncate">{dept.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {dept._count.students} Students
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {dept._count.faculty} Faculty
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {dept._count.subjects} Subjects
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Students</CardTitle>
                <CardDescription>Latest enrolled students</CardDescription>
              </div>
              <Link
                href="/admin/students"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStudents.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/students/${s.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs font-semibold">
                        {s.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{s.user.name}</p>
                      <p className="text-xs text-muted-foreground">{s.rollNumber} · {s.department.code}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Sem {s.semester}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Faculty */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Faculty</CardTitle>
                <CardDescription>Latest faculty members</CardDescription>
              </div>
              <Link
                href="/admin/faculty"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentFaculty.map((f) => (
                <Link
                  key={f.id}
                  href={`/admin/faculty/${f.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-semibold">
                        {f.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{f.user.name}</p>
                      <p className="text-xs text-muted-foreground">{f.employeeId} · {f.department.code}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{f.designation || "—"}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
