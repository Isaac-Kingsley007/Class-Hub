import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutUser } from "@/app/login/actions";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const role = cookieStore.get("session_user_role")?.value;
  const name = cookieStore.get("session_user_name")?.value;

  if (role !== "admin") {
    redirect("/login");
  }

  const [studentCount, facultyCount, deptCount] = await Promise.all([
    prisma.student.count(),
    prisma.faculty.count(),
    prisma.department.count(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 p-4 sm:p-8">
      <header className="flex items-center justify-between mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
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
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facultyCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deptCount}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage users, view system-wide reports, and oversee the entire institution from here.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
