import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutUser } from "@/app/login/actions";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function StudentDashboard() {
  const cookieStore = await cookies();
  const role = cookieStore.get("session_user_role")?.value;
  const name = cookieStore.get("session_user_name")?.value;
  const userId = cookieStore.get("session_user_id")?.value;

  if (role !== "student") {
    redirect("/login");
  }

  // Fetch student profile
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      department: true,
      attendanceRecords: {
        take: 3,
        orderBy: { date: 'desc' }
      }
    }
  });

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 p-4 sm:p-8">
      <header className="flex items-center justify-between mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground mr-2">Welcome, {name}</span>
          <form action={logoutUser}>
            <Button variant="outline" size="sm">Logout</Button>
          </form>
        </div>
      </header>

      <main className="flex-1 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Semester</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student?.semester || 1}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{student?.department?.code || "N/A"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Roll Number</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student?.rollNumber || "N/A"}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {student?.attendanceRecords.length === 0 ? (
                <p className="text-muted-foreground">No recent attendance records found.</p>
              ) : (
                <div className="space-y-4 mt-2">
                  {student?.attendanceRecords.map(record => (
                    <div key={record.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{new Date(record.date).toLocaleDateString()}</span>
                      <span className={`font-semibold ${record.status === 'PRESENT' ? 'text-green-600' : 'text-red-600'}`}>
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
