import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutUser } from "@/app/login/actions";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function FacultyDashboard() {
  const cookieStore = await cookies();
  const role = cookieStore.get("session_user_role")?.value;
  const name = cookieStore.get("session_user_name")?.value;
  const userId = cookieStore.get("session_user_id")?.value;

  if (role !== "faculty") {
    redirect("/login");
  }

  // Fetch faculty profile
  const faculty = await prisma.faculty.findUnique({
    where: { userId },
    include: {
      department: true,
      subjects: true,
    }
  });

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 p-4 sm:p-8">
      <header className="flex items-center justify-between mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
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
              <CardTitle className="text-sm font-medium">Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{faculty?.department?.name || "N/A"}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assigned Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faculty?.subjects.length || 0}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>My Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {faculty?.subjects.length === 0 ? (
                <p className="text-muted-foreground">No subjects assigned yet.</p>
              ) : (
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {faculty?.subjects.map(sub => (
                    <li key={sub.id} className="text-muted-foreground">
                      {sub.code} - {sub.name} (Semester {sub.semester})
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
