import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get("session_user_role")?.value;

  if (role) {
    redirect(`/${role}/dashboard`);
  }
  redirect("/login");
}
