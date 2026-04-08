"use client";

import { useState } from "react";
import { createSubject, deleteSubject, updateSubject } from "@/app/admin/actions";
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

interface FacultyOption {
  id: string;
  name: string;
  employeeId: string;
  departmentCode: string;
}

interface SubjectFormProps {
  departments: Department[];
  facultyList: FacultyOption[];
  subject?: {
    id: string;
    name: string;
    code: string;
    credits: number;
    semester: number;
    departmentId: string;
    facultyId: string | null;
    description: string | null;
  };
  trigger: React.ReactNode;
}

export function SubjectFormDialog({ departments, facultyList, subject, trigger }: SubjectFormProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isEdit = !!subject;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = isEdit ? await updateSubject(formData) : await createSubject(formData);
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
          <DialogTitle>{isEdit ? "Edit Subject" : "Add New Subject"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update subject information." : "Create a new subject."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={subject.id} />}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name *</Label>
              <Input id="name" name="name" required defaultValue={subject?.name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input id="code" name="code" required defaultValue={subject?.code || ""} placeholder="e.g. CSE301" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Input id="credits" name="credits" type="number" min={1} max={10} defaultValue={subject?.credits || 3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Input id="semester" name="semester" type="number" min={1} max={8} defaultValue={subject?.semester || 1} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department *</Label>
              <Select name="departmentId" defaultValue={subject?.departmentId || ""} required>
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
            <div className="space-y-2">
              <Label htmlFor="facultyId">Assigned Faculty</Label>
              <Select name="facultyId" defaultValue={subject?.facultyId || "_none"}>
                <SelectTrigger id="facultyId">
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {facultyList.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} ({f.departmentCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={subject?.description || ""} />
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteSubjectButton({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false);
  async function handleDelete() {
    if (!confirm(`Delete subject "${name}"? This will fail if it has attendance or academic records.`)) return;
    setPending(true);
    const formData = new FormData();
    formData.set("id", id);
    const result = await deleteSubject(formData);
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
