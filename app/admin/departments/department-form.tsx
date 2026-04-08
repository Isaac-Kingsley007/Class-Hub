"use client";

import { useState } from "react";
import { createDepartment, deleteDepartment, updateDepartment } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface DeptFormProps {
  dept?: { id: string; name: string; code: string; description: string | null };
  trigger: React.ReactNode;
}

export function DepartmentFormDialog({ dept, trigger }: DeptFormProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isEdit = !!dept;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = isEdit ? await updateDepartment(formData) : await createDepartment(formData);
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Department" : "Add Department"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update department information." : "Create a new department."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={dept.id} />}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required defaultValue={dept?.name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input id="code" name="code" required defaultValue={dept?.code || ""} placeholder="e.g. CSE" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={dept?.description || ""} />
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteDepartmentButton({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false);
  async function handleDelete() {
    if (!confirm(`Delete department "${name}"? This will fail if it has students, faculty, or subjects.`)) return;
    setPending(true);
    const formData = new FormData();
    formData.set("id", id);
    const result = await deleteDepartment(formData);
    if (result?.error) {
      alert(result.error);
    }
    setPending(false);
  }
  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
      {pending ? "..." : "Delete"}
    </Button>
  );
}
