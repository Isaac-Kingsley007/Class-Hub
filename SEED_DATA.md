# Database Seed Data Reference

## Running the Seed Script

1. Install dependencies (if not already done):
   ```bash
   pnpm install
   ```

2. Make sure your database is set up and migrated:
   ```bash
   pnpm prisma migrate dev
   ```

3. Run the seed script:
   ```bash
   pnpm db:seed
   ```

   Or using Prisma directly:
   ```bash
   pnpm prisma db seed
   ```

## Test Login Credentials

**All users have the same password: `password123`**

### 🔐 Admin Account
- **Email:** `admin@college.edu`
- **Role:** System Administrator
- **Access:** Full system access

### 👨‍🏫 Faculty Accounts

| Name | Email | Department | Designation |
|------|-------|------------|-------------|
| Dr. John Doe | john.doe@college.edu | CSE | Professor |
| Dr. Jane Smith | jane.smith@college.edu | CSE | Associate Professor |
| Prof. Robert Wilson | robert.wilson@college.edu | EEE | Assistant Professor |
| Dr. Sarah Johnson | sarah.johnson@college.edu | IT | Associate Professor |

### 👨‍🎓 Student Accounts

| Name | Email | Department | Semester | Roll Number |
|------|-------|------------|----------|-------------|
| Alice Brown | alice.brown@student.college.edu | CSE | 3 | CSE2023001 |
| Bob Miller | bob.miller@student.college.edu | CSE | 3 | CSE2023002 |
| Carol Davis | carol.davis@student.college.edu | CSE | 1 | CSE2024001 |
| David Lee | david.lee@student.college.edu | EEE | 3 | EEE2023001 |
| Emma Wilson | emma.wilson@student.college.edu | IT | 3 | IT2023001 |
| Frank Taylor | frank.taylor@student.college.edu | IT | 1 | IT2024001 |

## Database Contents

The seed script creates:

### Departments (4)
- Computer Science & Engineering (CSE)
- Electrical & Electronics Engineering (EEE)
- Mechanical Engineering (MECH)
- Information Technology (IT)

### Subjects (10)
Subjects are distributed across departments and semesters:
- CSE: Data Structures, DBMS, Operating Systems, Programming, Mathematics
- EEE: Circuit Analysis, Digital Electronics
- IT: Web Technologies, Computer Networks, Introduction to IT

### Attendance Records
- ~30 days of attendance data for all students
- Weekends excluded
- Realistic attendance patterns (mostly present with some absences/late marks)

### Academic Records
For each student-subject combination:
- **Midterm Exam** (out of 50 marks)
- **Assignment** (out of 25 marks)
- **Final Exam** (out of 75 marks, for semester 3 students only)
- Grades automatically calculated based on percentage

## Data Characteristics

- **Passwords:** All hashed using bcrypt (10 rounds)
- **Attendance:** ~85% average attendance across all students
- **Academic Performance:** Varied marks showing realistic distribution
- **Dates:** Enrollment years and dates are realistic and consistent
- **Phone Numbers:** Sample format: +1234567XXX

## Notes for Development

1. The seed script **clears all existing data** before seeding
2. IDs are generated using cuid() for uniqueness
3. Faculty-subject assignments are preset
4. Student attendance and marks correlate with their semester
5. All foreign key relationships are properly maintained

## Next Steps

After seeding, you can:
1. Implement authentication using these credentials
2. Test role-based access control
3. Build dashboards showing this data
4. Add more students/faculty as needed
5. Test attendance marking and grade entry features
