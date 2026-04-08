"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// Helper to get faculty ID from session
async function getFacultyId(): Promise<string | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;
  if (!userId) return null;
  const faculty = await prisma.faculty.findUnique({ where: { userId }, select: { id: true } });
  return faculty?.id || null;
}

// ─── Attendance Actions ──────────────────────────────────────────────────────

export async function markAttendanceBulk(formData: FormData) {
  const facultyId = await getFacultyId();
  if (!facultyId) return { error: "Not authenticated as faculty" };

  const subjectId = formData.get("subjectId")?.toString();
  const dateStr = formData.get("date")?.toString();

  if (!subjectId || !dateStr) return { error: "Subject and date are required" };

  const date = new Date(dateStr);
  date.setUTCHours(0, 0, 0, 0);

  // Get all student statuses from form
  const entries: { studentId: string; status: string; remarks: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("status_")) {
      const studentId = key.replace("status_", "");
      const remarks = formData.get(`remarks_${studentId}`)?.toString() || "";
      entries.push({ studentId, status: value.toString(), remarks });
    }
  }

  if (entries.length === 0) return { error: "No attendance data provided" };

  try {
    // Upsert each attendance record
    for (const entry of entries) {
      await prisma.attendance.upsert({
        where: {
          studentId_subjectId_date: {
            studentId: entry.studentId,
            subjectId,
            date,
          },
        },
        create: {
          studentId: entry.studentId,
          subjectId,
          facultyId,
          date,
          status: entry.status as "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
          remarks: entry.remarks || null,
        },
        update: {
          status: entry.status as "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
          remarks: entry.remarks || null,
        },
      });
    }
  } catch (e) {
    console.error("Attendance error:", e);
    return { error: "Failed to save attendance records" };
  }

  revalidatePath("/faculty/attendance");
  revalidatePath("/faculty/advisory");
  return { success: true, count: entries.length };
}

// ─── Academic Record Actions ─────────────────────────────────────────────────

const gradeFromPercentage = (pct: number): "A_PLUS" | "A" | "B_PLUS" | "B" | "C_PLUS" | "C" | "D" | "F" => {
  if (pct >= 90) return "A_PLUS";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B_PLUS";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C_PLUS";
  if (pct >= 40) return "C";
  if (pct >= 35) return "D";
  return "F";
};

export async function uploadMarksBulk(formData: FormData) {
  const facultyId = await getFacultyId();
  if (!facultyId) return { error: "Not authenticated as faculty" };

  const subjectId = formData.get("subjectId")?.toString();
  const examType = formData.get("examType")?.toString();
  const totalMarks = parseFloat(formData.get("totalMarks")?.toString() || "100");
  const academicYear = formData.get("academicYear")?.toString();

  if (!subjectId || !examType || !academicYear) {
    return { error: "Subject, exam type, and academic year are required" };
  }

  // Get subject info for semester and credits
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) return { error: "Subject not found" };

  // Get all marks from form
  const entries: { studentId: string; marks: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("marks_")) {
      const studentId = key.replace("marks_", "");
      const marks = parseFloat(value.toString());
      if (!isNaN(marks)) {
        entries.push({ studentId, marks });
      }
    }
  }

  if (entries.length === 0) return { error: "No marks data provided" };

  try {
    for (const entry of entries) {
      const percentage = totalMarks > 0 ? (entry.marks / totalMarks) * 100 : 0;
      const grade = gradeFromPercentage(percentage);

      // Check if record already exists for this student/subject/examType
      const existing = await prisma.academicRecord.findFirst({
        where: {
          studentId: entry.studentId,
          subjectId,
          examType,
          facultyId,
        },
      });

      if (existing) {
        await prisma.academicRecord.update({
          where: { id: existing.id },
          data: {
            marksObtained: entry.marks,
            totalMarks,
            grade,
          },
        });
      } else {
        await prisma.academicRecord.create({
          data: {
            studentId: entry.studentId,
            subjectId,
            facultyId,
            semester: subject.semester,
            marksObtained: entry.marks,
            totalMarks,
            grade,
            credits: subject.credits,
            academicYear,
            examType,
          },
        });
      }
    }
  } catch (e) {
    console.error("Marks error:", e);
    return { error: "Failed to save marks" };
  }

  revalidatePath("/faculty/subjects");
  revalidatePath("/faculty/marks");
  return { success: true, count: entries.length };
}
