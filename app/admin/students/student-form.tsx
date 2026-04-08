"use client";

import { useState } from "react";
import { createStudent, deleteStudent, updateStudent } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Department {
  id: string;
  name: string;
  code: string;
}

interface StudentFormProps {
  departments: Department[];
  student?: {
    id: string;
    userId: string;
    rollNumber: string;
    departmentId: string;
    semester: number;
    enrollmentYear: number;
    phone: string | null;
    address: string | null;
    dateOfBirth: string | null;
    userName: string;
    userEmail: string;
  };
  trigger: React.ReactNode;
}

export function StudentFormDialog({ departments, student, trigger }: StudentFormProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isEdit = !!student;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = isEdit ? await updateStudent(formData) : await createStudent(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    } else {
      setOpen(false);
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update student information." : "Create a new student account."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isEdit && (
            <>
              <input type="hidden" name="studentId" value={student.id} />
              <input type="hidden" name="userId" value={student.userId} />
            </>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" required defaultValue={student?.userName || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required defaultValue={student?.userEmail || ""} />
            </div>
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Default: password123" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input id="rollNumber" name="rollNumber" required defaultValue={student?.rollNumber || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department *</Label>
              <Select name="departmentId" defaultValue={student?.departmentId || ""} required>
                <SelectTrigger id="departmentId">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Input id="semester" name="semester" type="number" min={1} max={8} defaultValue={student?.semester || 1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollmentYear">Enrollment Year</Label>
              <Input
                id="enrollmentYear"
                name="enrollmentYear"
                type="number"
                defaultValue={student?.enrollmentYear || new Date().getFullYear()}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={student?.phone || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={student?.dateOfBirth || ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={student?.address || ""} />
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteStudentButton({ userId, name }: { userId: string; name: string }) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete student "${name}"? This action cannot be undone.`)) return;
    setPending(true);
    const formData = new FormData();
    formData.set("userId", userId);
    await deleteStudent(formData);
    setPending(false);
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
