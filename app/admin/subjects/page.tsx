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
import { SubjectFormDialog, DeleteSubjectButton } from "./subject-form";

export default async function AdminSubjects() {
  const subjects = await prisma.subject.findMany({
    include: {
      department: true,
      faculty: { include: { user: true } },
      _count: { select: { attendanceRecords: true, academicRecords: true } },
    },
    orderBy: [{ department: { code: "asc" } }, { semester: "asc" }, { code: "asc" }],
  });

  const departments = await prisma.department.findMany({ orderBy: { code: "asc" } });
  const facultyList = await prisma.faculty.findMany({
    include: { user: true, department: true },
    orderBy: { user: { name: "asc" } },
  });

  const facultyOptions = facultyList.map((f) => ({
    id: f.id,
    name: f.user.name,
    employeeId: f.employeeId,
    departmentCode: f.department.code,
  }));

  // Group by department
  const deptGroups = new Map<string, typeof subjects>();
  for (const s of subjects) {
    const key = s.department.code;
    const existing = deptGroups.get(key) || [];
    existing.push(s);
    deptGroups.set(key, existing);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Subjects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all subjects — {subjects.length} total across {deptGroups.size} departments
          </p>
        </div>
        <SubjectFormDialog
          departments={departments}
          facultyList={facultyOptions}
          trigger={
            <Button className="bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700">
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Subject
            </Button>
          }
        />
      </div>

      {/* Department-grouped tables */}
      {Array.from(deptGroups.entries()).map(([deptCode, deptSubjects]) => (
        <Card key={deptCode}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs font-bold">
                {deptCode}
              </div>
              <div>
                <CardTitle>{deptSubjects[0].department.name}</CardTitle>
                <CardDescription>{deptSubjects.length} subjects</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-center">Sem</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead className="text-center">Attendance</TableHead>
                    <TableHead className="text-center">Academic</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deptSubjects.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">{s.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{s.name}</p>
                        {s.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{s.description}</p>}
                      </TableCell>
                      <TableCell className="text-center">{s.semester}</TableCell>
                      <TableCell className="text-center">{s.credits}</TableCell>
                      <TableCell className="text-sm">
                        {s.faculty ? (
                          <span>{s.faculty.user.name}</span>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{s._count.attendanceRecords}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{s._count.academicRecords}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <SubjectFormDialog
                            departments={departments}
                            facultyList={facultyOptions}
                            subject={{
                              id: s.id,
                              name: s.name,
                              code: s.code,
                              credits: s.credits,
                              semester: s.semester,
                              departmentId: s.departmentId,
                              facultyId: s.facultyId,
                              description: s.description,
                            }}
                            trigger={<Button variant="outline" size="sm">Edit</Button>}
                          />
                          <DeleteSubjectButton id={s.id} name={s.name} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      {subjects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No subjects found. Create your first subject above.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
