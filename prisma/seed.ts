import { PrismaClient, Role, AttendanceStatus, Grade } from '../app/generated/prisma/client'
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from 'bcryptjs'
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({adapter})

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.academicRecord.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.student.deleteMany()
  await prisma.faculty.deleteMany()
  await prisma.department.deleteMany()
  await prisma.user.deleteMany()

  // Hash password for all users (password: "password123")
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Departments
  console.log('📚 Creating departments...')
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Department of Computer Science and Engineering',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Electrical & Electronics Engineering',
        code: 'EEE',
        description: 'Department of Electrical and Electronics Engineering',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Mechanical Engineering',
        code: 'MECH',
        description: 'Department of Mechanical Engineering',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Information Technology',
        code: 'IT',
        description: 'Department of Information Technology',
      },
    }),
  ])

  // Create Admin User
  console.log('👤 Creating admin user...')
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@college.edu',
      password: hashedPassword,
      name: 'System Administrator',
      role: Role.ADMIN,
    },
  })

  // Create Faculty Users
  console.log('👨‍🏫 Creating faculty users...')
  const facultyUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@college.edu',
        password: hashedPassword,
        name: 'Dr. John Doe',
        role: Role.FACULTY,
        faculty: {
          create: {
            employeeId: 'FAC001',
            departmentId: departments[0].id, // CSE
            designation: 'Professor',
            phone: '+1234567890',
            dateOfJoining: new Date('2015-08-01'),
          },
        },
      },
      include: { faculty: true },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@college.edu',
        password: hashedPassword,
        name: 'Dr. Jane Smith',
        role: Role.FACULTY,
        faculty: {
          create: {
            employeeId: 'FAC002',
            departmentId: departments[0].id, // CSE
            designation: 'Associate Professor',
            phone: '+1234567891',
            dateOfJoining: new Date('2017-06-15'),
          },
        },
      },
      include: { faculty: true },
    }),
    prisma.user.create({
      data: {
        email: 'robert.wilson@college.edu',
        password: hashedPassword,
        name: 'Prof. Robert Wilson',
        role: Role.FACULTY,
        faculty: {
          create: {
            employeeId: 'FAC003',
            departmentId: departments[1].id, // EEE
            designation: 'Assistant Professor',
            phone: '+1234567892',
            dateOfJoining: new Date('2019-01-10'),
          },
        },
      },
      include: { faculty: true },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.johnson@college.edu',
        password: hashedPassword,
        name: 'Dr. Sarah Johnson',
        role: Role.FACULTY,
        faculty: {
          create: {
            employeeId: 'FAC004',
            departmentId: departments[3].id, // IT
            designation: 'Associate Professor',
            phone: '+1234567893',
            dateOfJoining: new Date('2016-03-20'),
          },
        },
      },
      include: { faculty: true },
    }),
  ])

  // Create Student Users
  console.log('👨‍🎓 Creating student users...')
  const studentUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice.brown@student.college.edu',
        password: hashedPassword,
        name: 'Alice Brown',
        role: Role.STUDENT,
        student: {
          create: {
            rollNumber: 'CSE2023001',
            departmentId: departments[0].id,
            semester: 3,
            enrollmentYear: 2023,
            phone: '+1234567800',
            address: '123 Campus Street, City',
            dateOfBirth: new Date('2004-05-15'),
          },
        },
      },
      include: { student: true },
    }),
    prisma.user.create({
      data: {
        email: 'bob.miller@student.college.edu',
        password: hashedPassword,
        name: 'Bob Miller',
        role: Role.STUDENT,
        student: {
          create: {
            rollNumber: 'CSE2023002',
            departmentId: departments[0].id,
            semester: 3,
            enrollmentYear: 2023,
            phone: '+1234567801',
            address: '456 University Ave, City',
            dateOfBirth: new Date('2004-08-22'),
          },
        },
      },
      include: { student: true },
    }),
    prisma.user.create({
      data: {
        email: 'carol.davis@student.college.edu',
        password: hashedPassword,
        name: 'Carol Davis',
        role: Role.STUDENT,
        student: {
          create: {
            rollNumber: 'CSE2024001',
            departmentId: departments[0].id,
            semester: 1,
            enrollmentYear: 2024,
            phone: '+1234567802',
            address: '789 College Road, City',
            dateOfBirth: new Date('2005-03-10'),
          },
        },
      },
      include: { student: true },
    }),
    prisma.user.create({
      data: {
        email: 'david.lee@student.college.edu',
        password: hashedPassword,
        name: 'David Lee',
        role: Role.STUDENT,
        student: {
          create: {
            rollNumber: 'EEE2023001',
            departmentId: departments[1].id,
            semester: 3,
            enrollmentYear: 2023,
            phone: '+1234567803',
            address: '321 Student Lane, City',
            dateOfBirth: new Date('2004-11-30'),
          },
        },
      },
      include: { student: true },
    }),
    prisma.user.create({
      data: {
        email: 'emma.wilson@student.college.edu',
        password: hashedPassword,
        name: 'Emma Wilson',
        role: Role.STUDENT,
        student: {
          create: {
            rollNumber: 'IT2023001',
            departmentId: departments[3].id,
            semester: 3,
            enrollmentYear: 2023,
            phone: '+1234567804',
            address: '654 Education Blvd, City',
            dateOfBirth: new Date('2004-07-18'),
          },
        },
      },
      include: { student: true },
    }),
    prisma.user.create({
      data: {
        email: 'frank.taylor@student.college.edu',
        password: hashedPassword,
        name: 'Frank Taylor',
        role: Role.STUDENT,
        student: {
          create: {
            rollNumber: 'IT2024001',
            departmentId: departments[3].id,
            semester: 1,
            enrollmentYear: 2024,
            phone: '+1234567805',
            address: '987 Academic Circle, City',
            dateOfBirth: new Date('2005-01-25'),
          },
        },
      },
      include: { student: true },
    }),
  ])

  // Create Subjects
  console.log('📖 Creating subjects...')
  const subjects = await Promise.all([
    // CSE Subjects - Semester 3
    prisma.subject.create({
      data: {
        name: 'Data Structures and Algorithms',
        code: 'CSE301',
        credits: 4,
        semester: 3,
        departmentId: departments[0].id,
        facultyId: facultyUsers[0].faculty!.id,
        description: 'Fundamental data structures and algorithmic techniques',
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Database Management Systems',
        code: 'CSE302',
        credits: 3,
        semester: 3,
        departmentId: departments[0].id,
        facultyId: facultyUsers[1].faculty!.id,
        description: 'Relational databases, SQL, and database design',
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Operating Systems',
        code: 'CSE303',
        credits: 3,
        semester: 3,
        departmentId: departments[0].id,
        facultyId: facultyUsers[0].faculty!.id,
        description: 'Process management, memory management, and file systems',
      },
    }),
    // CSE Subjects - Semester 1
    prisma.subject.create({
      data: {
        name: 'Introduction to Programming',
        code: 'CSE101',
        credits: 4,
        semester: 1,
        departmentId: departments[0].id,
        facultyId: facultyUsers[1].faculty!.id,
        description: 'Basic programming concepts using C/Python',
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Mathematics for Computing',
        code: 'CSE102',
        credits: 3,
        semester: 1,
        departmentId: departments[0].id,
        facultyId: facultyUsers[0].faculty!.id,
        description: 'Discrete mathematics and linear algebra',
      },
    }),
    // EEE Subjects
    prisma.subject.create({
      data: {
        name: 'Circuit Analysis',
        code: 'EEE301',
        credits: 4,
        semester: 3,
        departmentId: departments[1].id,
        facultyId: facultyUsers[2].faculty!.id,
        description: 'AC/DC circuits and network theorems',
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Digital Electronics',
        code: 'EEE302',
        credits: 3,
        semester: 3,
        departmentId: departments[1].id,
        facultyId: facultyUsers[2].faculty!.id,
        description: 'Boolean algebra and logic gates',
      },
    }),
    // IT Subjects
    prisma.subject.create({
      data: {
        name: 'Web Technologies',
        code: 'IT301',
        credits: 3,
        semester: 3,
        departmentId: departments[3].id,
        facultyId: facultyUsers[3].faculty!.id,
        description: 'HTML, CSS, JavaScript, and modern web frameworks',
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Computer Networks',
        code: 'IT302',
        credits: 4,
        semester: 3,
        departmentId: departments[3].id,
        facultyId: facultyUsers[3].faculty!.id,
        description: 'Network protocols, TCP/IP, and internet architecture',
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Introduction to IT',
        code: 'IT101',
        credits: 3,
        semester: 1,
        departmentId: departments[3].id,
        facultyId: facultyUsers[3].faculty!.id,
        description: 'Fundamentals of information technology',
      },
    }),
  ])

  // Create Attendance Records (last 30 days)
  console.log('📅 Creating attendance records...')
  const today = new Date()
  const attendanceRecords = []

  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const date = new Date(today)
    date.setDate(date.getDate() - dayOffset)

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    // CSE Semester 3 students attendance
    for (const student of studentUsers.filter(
      (s) => s.student!.departmentId === departments[0].id && s.student!.semester === 3
    )) {
      for (const subject of subjects.filter((s) => s.departmentId === departments[0].id && s.semester === 3)) {
        attendanceRecords.push(
          prisma.attendance.create({
            data: {
              studentId: student.student!.id,
              subjectId: subject.id,
              facultyId: subject.facultyId!,
              date: date,
              status: Math.random() > 0.2 ? AttendanceStatus.PRESENT : Math.random() > 0.5 ? AttendanceStatus.LATE : AttendanceStatus.ABSENT,
              remarks: Math.random() > 0.9 ? 'Medical leave' : undefined,
            },
          })
        )
      }
    }

    // CSE Semester 1 students attendance
    for (const student of studentUsers.filter(
      (s) => s.student!.departmentId === departments[0].id && s.student!.semester === 1
    )) {
      for (const subject of subjects.filter((s) => s.departmentId === departments[0].id && s.semester === 1)) {
        attendanceRecords.push(
          prisma.attendance.create({
            data: {
              studentId: student.student!.id,
              subjectId: subject.id,
              facultyId: subject.facultyId!,
              date: date,
              status: Math.random() > 0.15 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
            },
          })
        )
      }
    }

    // EEE students attendance
    for (const student of studentUsers.filter((s) => s.student!.departmentId === departments[1].id)) {
      for (const subject of subjects.filter((s) => s.departmentId === departments[1].id)) {
        attendanceRecords.push(
          prisma.attendance.create({
            data: {
              studentId: student.student!.id,
              subjectId: subject.id,
              facultyId: subject.facultyId!,
              date: date,
              status: Math.random() > 0.25 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
            },
          })
        )
      }
    }

    // IT students attendance
    for (const student of studentUsers.filter((s) => s.student!.departmentId === departments[3].id)) {
      for (const subject of subjects.filter((s) => s.departmentId === departments[3].id && s.semester === student.student!.semester)) {
        attendanceRecords.push(
          prisma.attendance.create({
            data: {
              studentId: student.student!.id,
              subjectId: subject.id,
              facultyId: subject.facultyId!,
              date: date,
              status: Math.random() > 0.18 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
            },
          })
        )
      }
    }
  }

  await Promise.all(attendanceRecords)

  // Create Academic Records
  console.log('📊 Creating academic records...')
  const academicRecords = []

  // Helper function to calculate grade
  const calculateGrade = (percentage: number): Grade => {
    if (percentage >= 90) return Grade.A_PLUS
    if (percentage >= 80) return Grade.A
    if (percentage >= 70) return Grade.B_PLUS
    if (percentage >= 60) return Grade.B
    if (percentage >= 50) return Grade.C_PLUS
    if (percentage >= 40) return Grade.C
    if (percentage >= 35) return Grade.D
    return Grade.F
  }

  // Create records for all students
  for (const student of studentUsers) {
    const studentSubjects = subjects.filter(
      (s) => s.departmentId === student.student!.departmentId && s.semester === student.student!.semester
    )

    for (const subject of studentSubjects) {
      // Midterm exam
      const midtermMarks = Math.floor(Math.random() * 30) + 20 // 20-50 out of 50
      academicRecords.push(
        prisma.academicRecord.create({
          data: {
            studentId: student.student!.id,
            subjectId: subject.id,
            facultyId: subject.facultyId!,
            semester: student.student!.semester,
            marksObtained: midtermMarks,
            totalMarks: 50,
            grade: calculateGrade((midtermMarks / 50) * 100),
            credits: subject.credits,
            academicYear: `${student.student!.enrollmentYear}-${student.student!.enrollmentYear + 1}`,
            examType: 'Midterm',
          },
        })
      )

      // Assignment
      const assignmentMarks = Math.floor(Math.random() * 15) + 10 // 10-25 out of 25
      academicRecords.push(
        prisma.academicRecord.create({
          data: {
            studentId: student.student!.id,
            subjectId: subject.id,
            facultyId: subject.facultyId!,
            semester: student.student!.semester,
            marksObtained: assignmentMarks,
            totalMarks: 25,
            grade: calculateGrade((assignmentMarks / 25) * 100),
            credits: subject.credits,
            academicYear: `${student.student!.enrollmentYear}-${student.student!.enrollmentYear + 1}`,
            examType: 'Assignment',
          },
        })
      )

      // Final exam (for semester 3 students only)
      if (student.student!.semester === 3) {
        const finalMarks = Math.floor(Math.random() * 40) + 35 // 35-75 out of 75
        academicRecords.push(
          prisma.academicRecord.create({
            data: {
              studentId: student.student!.id,
              subjectId: subject.id,
              facultyId: subject.facultyId!,
              semester: student.student!.semester,
              marksObtained: finalMarks,
              totalMarks: 75,
              grade: calculateGrade((finalMarks / 75) * 100),
              credits: subject.credits,
              academicYear: `${student.student!.enrollmentYear}-${student.student!.enrollmentYear + 1}`,
              examType: 'Final',
            },
          })
        )
      }
    }
  }

  await Promise.all(academicRecords)

  console.log('✅ Database seeded successfully!')
  console.log('\n📝 Login Credentials (All passwords: password123):')
  console.log('\n🔐 Admin:')
  console.log(`   Email: admin@college.edu`)
  console.log('\n👨‍🏫 Faculty:')
  console.log(`   Email: john.doe@college.edu`)
  console.log(`   Email: jane.smith@college.edu`)
  console.log(`   Email: robert.wilson@college.edu`)
  console.log(`   Email: sarah.johnson@college.edu`)
  console.log('\n👨‍🎓 Students:')
  console.log(`   Email: alice.brown@student.college.edu (CSE - Sem 3)`)
  console.log(`   Email: bob.miller@student.college.edu (CSE - Sem 3)`)
  console.log(`   Email: carol.davis@student.college.edu (CSE - Sem 1)`)
  console.log(`   Email: david.lee@student.college.edu (EEE - Sem 3)`)
  console.log(`   Email: emma.wilson@student.college.edu (IT - Sem 3)`)
  console.log(`   Email: frank.taylor@student.college.edu (IT - Sem 1)`)
  console.log('\n📊 Summary:')
  console.log(`   • ${await prisma.user.count()} Users`)
  console.log(`   • ${await prisma.department.count()} Departments`)
  console.log(`   • ${await prisma.student.count()} Students`)
  console.log(`   • ${await prisma.faculty.count()} Faculty Members`)
  console.log(`   • ${await prisma.subject.count()} Subjects`)
  console.log(`   • ${await prisma.attendance.count()} Attendance Records`)
  console.log(`   • ${await prisma.academicRecord.count()} Academic Records`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
