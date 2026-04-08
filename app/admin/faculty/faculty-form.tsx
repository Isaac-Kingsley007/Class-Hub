"use client";

import { useState } from "react";
import { createFaculty, deleteFaculty, updateFaculty } from "@/app/admin/actions";
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

interface FacultyFormProps {
  departments: Department[];
  faculty?: {
    id: string;
    userId: string;
    employeeId: string;
    departmentId: string;
    designation: string | null;
    phone: string | null;
    dateOfJoining: string | null;
    userName: string;
    userEmail: string;
  };
  trigger: React.ReactNode;
}

export function FacultyFormDialog({ departments, faculty, trigger }: FacultyFormProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isEdit = !!faculty;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = isEdit ? await updateFaculty(formData) : await createFaculty(formData);
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
          <DialogTitle>{isEdit ? "Edit Faculty" : "Add New Faculty"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update faculty information." : "Create a new faculty account."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isEdit && (
            <>
              <input type="hidden" name="facultyId" value={faculty.id} />
              <input type="hidden" name="userId" value={faculty.userId} />
            </>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" required defaultValue={faculty?.userName || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required defaultValue={faculty?.userEmail || ""} />
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
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input id="employeeId" name="employeeId" required defaultValue={faculty?.employeeId || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department *</Label>
              <Select name="departmentId" defaultValue={faculty?.departmentId || ""} required>
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
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" name="designation" placeholder="e.g. Professor" defaultValue={faculty?.designation || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={faculty?.phone || ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfJoining">Date of Joining</Label>
            <Input id="dateOfJoining" name="dateOfJoining" type="date" defaultValue={faculty?.dateOfJoining || ""} />
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Faculty"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteFacultyButton({ userId, name }: { userId: string; name: string }) {
  const [pending, setPending] = useState(false);
  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete faculty "${name}"? This action cannot be undone.`)) return;
    setPending(true);
    const formData = new FormData();
    formData.set("userId", userId);
    await deleteFaculty(formData);
    setPending(false);
  }
  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
