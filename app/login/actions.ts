    "use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function loginUser(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Invalid credentials" };
  }

  // Basic mock session cookie handling for demo purposes
  const cookieStore = await cookies();
  cookieStore.set("session_user_role", user.role.toLowerCase(), {
    httpOnly: true,
    path: "/",
  });
  cookieStore.set("session_user_id", user.id, {
    httpOnly: true,
    path: "/",
  });
  cookieStore.set("session_user_name", user.name, {
    httpOnly: true,
    path: "/",
  });

  // Redirect to corresponding dashboard
  redirect(`/${user.role.toLowerCase()}/dashboard`);
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session_user_role");
  cookieStore.delete("session_user_id");
  cookieStore.delete("session_user_name");
  redirect("/login");
}
