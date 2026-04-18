import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFindUnique,
  mockCompare,
  mockCookies,
  mockRedirect,
  cookieStore,
} = vi.hoisted(() => {
  const cookieStore = {
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  };

  return {
    mockFindUnique: vi.fn(),
    mockCompare: vi.fn(),
    mockCookies: vi.fn(async () => cookieStore),
    mockRedirect: vi.fn(),
    cookieStore,
  };
});

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: mockFindUnique,
    },
  },
}));

vi.mock("bcryptjs", () => ({
  compare: mockCompare,
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

import { loginUser, logoutUser } from "@/app/login/actions";

describe("login actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when credentials are missing", async () => {
    const formData = new FormData();

    const result = await loginUser(formData);

    expect(result).toEqual({ error: "Email and password are required" });
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns invalid credentials when user does not exist", async () => {
    const formData = new FormData();
    formData.set("email", "missing@example.com");
    formData.set("password", "secret");
    mockFindUnique.mockResolvedValueOnce(null);

    const result = await loginUser(formData);

    expect(result).toEqual({ error: "Invalid credentials" });
    expect(mockCompare).not.toHaveBeenCalled();
  });

  it("sets cookies and redirects when login succeeds", async () => {
    const formData = new FormData();
    formData.set("email", "faculty@example.com");
    formData.set("password", "correct-password");

    mockFindUnique.mockResolvedValueOnce({
      id: "user_1",
      role: "FACULTY",
      name: "Prof. Ada",
      password: "hashed",
    });
    mockCompare.mockResolvedValueOnce(true);

    await loginUser(formData);

    expect(cookieStore.set).toHaveBeenCalledWith("session_user_role", "faculty", {
      httpOnly: true,
      path: "/",
    });
    expect(cookieStore.set).toHaveBeenCalledWith("session_user_id", "user_1", {
      httpOnly: true,
      path: "/",
    });
    expect(cookieStore.set).toHaveBeenCalledWith("session_user_name", "Prof. Ada", {
      httpOnly: true,
      path: "/",
    });
    expect(mockRedirect).toHaveBeenCalledWith("/faculty/dashboard");
  });

  it("clears session cookies and redirects during logout", async () => {
    await logoutUser();

    expect(cookieStore.delete).toHaveBeenCalledWith("session_user_role");
    expect(cookieStore.delete).toHaveBeenCalledWith("session_user_id");
    expect(cookieStore.delete).toHaveBeenCalledWith("session_user_name");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });
});
