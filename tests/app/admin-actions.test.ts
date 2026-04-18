import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockRevalidatePath,
  mockDepartmentCreate,
  mockSubjectCreate,
} = vi.hoisted(() => ({
  mockRevalidatePath: vi.fn(),
  mockDepartmentCreate: vi.fn(),
  mockSubjectCreate: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  hash: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    department: {
      create: mockDepartmentCreate,
    },
    subject: {
      create: mockSubjectCreate,
    },
  },
}));

import { createDepartment, createSubject } from "@/app/admin/actions";

describe("admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for missing department fields", async () => {
    const formData = new FormData();
    formData.set("name", "Computer Science");

    const result = await createDepartment(formData);

    expect(result).toEqual({ error: "Name and code are required" });
    expect(mockDepartmentCreate).not.toHaveBeenCalled();
  });

  it("creates department and revalidates on success", async () => {
    const formData = new FormData();
    formData.set("name", "Computer Science");
    formData.set("code", "CSE");
    formData.set("description", "Core engineering department");

    const result = await createDepartment(formData);

    expect(mockDepartmentCreate).toHaveBeenCalledWith({
      data: {
        name: "Computer Science",
        code: "CSE",
        description: "Core engineering department",
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/departments");
    expect(result).toEqual({ success: true });
  });

  it("maps _none faculty to null when creating subject", async () => {
    const formData = new FormData();
    formData.set("name", "Data Structures");
    formData.set("code", "CS201");
    formData.set("credits", "4");
    formData.set("semester", "3");
    formData.set("departmentId", "dept_1");
    formData.set("facultyId", "_none");

    const result = await createSubject(formData);

    expect(mockSubjectCreate).toHaveBeenCalledWith({
      data: {
        name: "Data Structures",
        code: "CS201",
        credits: 4,
        semester: 3,
        departmentId: "dept_1",
        facultyId: null,
        description: null,
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/subjects");
    expect(result).toEqual({ success: true });
  });
});
