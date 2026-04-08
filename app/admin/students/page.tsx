import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentFormDialog, DeleteStudentButton } from "./student-form";

export default async function AdminStudents() {
  const students = await prisma.student.findMany({
    include: {
      user: true,
      department: true,
      _count: { select: { attendanceRecords: true, academicRecords: true } },
    },
    orderBy: [{ department: { code: "asc" } }, { rollNumber: "asc" }],
  });

  const departments = await prisma.department.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all enrolled students — {students.length} total
          </p>
        </div>
        <StudentFormDialog
          departments={departments}
          trigger={
            <Button className="bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700">
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Student
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>Click on a student to view full details including attendance and academics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Student</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">Semester</TableHead>
                  <TableHead className="text-center">Year</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead className="text-center">Academics</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link href={`/admin/students/${s.id}`} className="flex items-center gap-3 hover:underline">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-[10px] font-semibold">
                            {s.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{s.user.name}</p>
                          <p className="text-[11px] text-muted-foreground">{s.user.email}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{s.rollNumber}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{s.department.code}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{s.semester}</TableCell>
                    <TableCell className="text-center">{s.enrollmentYear}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{s._count.attendanceRecords}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{s._count.academicRecords}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/students/${s.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        <StudentFormDialog
                          departments={departments}
                          student={{
                            id: s.id,
                            userId: s.userId,
                            rollNumber: s.rollNumber,
                            departmentId: s.departmentId,
                            semester: s.semester,
                            enrollmentYear: s.enrollmentYear,
                            phone: s.phone,
                            address: s.address,
                            dateOfBirth: s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().split("T")[0] : null,
                            userName: s.user.name,
                            userEmail: s.user.email,
                          }}
                          trigger={<Button variant="outline" size="sm">Edit</Button>}
                        />
                        <DeleteStudentButton userId={s.userId} name={s.user.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
