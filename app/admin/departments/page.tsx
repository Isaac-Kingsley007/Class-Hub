import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DepartmentFormDialog, DeleteDepartmentButton } from "./department-form";

export default async function AdminDepartments() {
  const departments = await prisma.department.findMany({
    include: {
      _count: { select: { students: true, faculty: true, subjects: true } },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Departments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage academic departments — {departments.length} total
          </p>
        </div>
        <DepartmentFormDialog
          trigger={
            <Button className="bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700">
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Department
            </Button>
          }
        />
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white text-sm font-bold shadow">
                  {dept.code}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">{dept.name}</CardTitle>
                  <CardDescription className="truncate">{dept.description || "No description"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">
                  {dept._count.students} Students
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {dept._count.faculty} Faculty
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {dept._count.subjects} Subjects
                </Badge>
              </div>
              <div className="flex gap-2">
                <DepartmentFormDialog
                  dept={{
                    id: dept.id,
                    name: dept.name,
                    code: dept.code,
                    description: dept.description,
                  }}
                  trigger={<Button variant="outline" size="sm" className="flex-1">Edit</Button>}
                />
                <DeleteDepartmentButton id={dept.id} name={dept.name} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table View */}
      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>Table view of all departments with resource counts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Students</TableHead>
                  <TableHead className="text-center">Faculty</TableHead>
                  <TableHead className="text-center">Subjects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">{dept.code}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {dept.description || "—"}
                    </TableCell>
                    <TableCell className="text-center font-semibold">{dept._count.students}</TableCell>
                    <TableCell className="text-center font-semibold">{dept._count.faculty}</TableCell>
                    <TableCell className="text-center font-semibold">{dept._count.subjects}</TableCell>
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
