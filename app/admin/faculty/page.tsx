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
import { FacultyFormDialog, DeleteFacultyButton } from "./faculty-form";

export default async function AdminFaculty() {
  const facultyList = await prisma.faculty.findMany({
    include: {
      user: true,
      department: true,
      _count: { select: { subjects: true, attendanceRecords: true, academicRecords: true } },
    },
    orderBy: [{ department: { code: "asc" } }, { employeeId: "asc" }],
  });

  const departments = await prisma.department.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Faculty</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all faculty members — {facultyList.length} total
          </p>
        </div>
        <FacultyFormDialog
          departments={departments}
          trigger={
            <Button className="bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700">
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Faculty
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Faculty</CardTitle>
          <CardDescription>Click on a faculty member to view details and subject assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Faculty</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-center">Subjects</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facultyList.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <Link href={`/admin/faculty/${f.id}`} className="flex items-center gap-3 hover:underline">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-[10px] font-semibold">
                            {f.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{f.user.name}</p>
                          <p className="text-[11px] text-muted-foreground">{f.user.email}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{f.employeeId}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{f.department.code}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{f.designation || "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{f._count.subjects}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/faculty/${f.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        <FacultyFormDialog
                          departments={departments}
                          faculty={{
                            id: f.id,
                            userId: f.userId,
                            employeeId: f.employeeId,
                            departmentId: f.departmentId,
                            designation: f.designation,
                            phone: f.phone,
                            dateOfJoining: f.dateOfJoining ? new Date(f.dateOfJoining).toISOString().split("T")[0] : null,
                            userName: f.user.name,
                            userEmail: f.user.email,
                          }}
                          trigger={<Button variant="outline" size="sm">Edit</Button>}
                        />
                        <DeleteFacultyButton userId={f.userId} name={f.user.name} />
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
