import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initiating Wisdomly OS Master Seed Protocol...');

  // 1. Wipe existing data (Reverse order to respect foreign keys)
  await prisma.homeworkSubmission.deleteMany();
  await prisma.homework.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.parent.deleteMany(); // Added to prevent cascade orphan errors
  await prisma.section.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();
  await prisma.schoolSubscription.deleteMany(); // Wipe subscriptions first
  await prisma.school.deleteMany(); // Wipe old schools to prevent slug unique constraints

  const schoolId = 'greenvalley'; // Your multi-tenant slug
  
  // Pre-hashed 'Welcome@123' with 12 bcrypt rounds (prevents external compile/runtime dependencies)
  const defaultPassword = '$2b$12$zjBmLSoUo2gq4QfGCKsN6OQN.WUl56Gq1h9kEpMiQfmH8kkPwdrAu';

  // ─── 1.5. CREATE/UPSERT DEMO SCHOOL ──────────────────────────────
  console.log('🏫 Provisioning Demo School...');
  await prisma.school.upsert({
    where: { id: schoolId },
    update: {},
    create: {
      id: schoolId,
      name: 'Green Valley School',
      slug: 'greenvalley-school',
      plan: 'FREE',
      studentLimit: 50,
      subscription: { create: { plan: 'FREE', studentLimit: 50 } }
    },
  });

  // ─── 2. CREATE SYSTEM ADMIN ──────────────────────────────────────
  console.log('👤 Provisioning Administrator...');
  const adminUser = await prisma.user.create({
    data: {
      schoolId,
      email: 'admin@greenvalley.edu',
      passwordHash: defaultPassword,
      role: 'ADMIN',
      isActive: true,
    }
  });

  // ─── 3. CREATE ACADEMIC STRUCTURE ────────────────────────────────
  console.log('🏫 Constructing Academic Layout...');
  const class10 = await prisma.class.create({
    data: { schoolId, name: 'Class 10', gradeLevel: 10 }
  });
  const class11 = await prisma.class.create({
    data: { schoolId, name: 'Class 11', gradeLevel: 11 }
  });

  const sec10A = await prisma.section.create({
    data: { schoolId, classId: class10.id, name: 'A' }
  });
  const sec10B = await prisma.section.create({
    data: { schoolId, classId: class10.id, name: 'B' }
  });
  const sec11A = await prisma.section.create({
    data: { schoolId, classId: class11.id, name: 'A' }
  });

  // ─── 4. CREATE FACULTY (TEACHERS) ────────────────────────────────
  console.log('💼 Onboarding Faculty Profiles...');
  const teacher1User = await prisma.user.create({
    data: { schoolId, email: 'vikram@greenvalley.edu', phone: '9876543210', passwordHash: defaultPassword, role: 'TEACHER' }
  });
  const teacher1 = await prisma.teacher.create({
    data: { schoolId, userId: teacher1User.id, name: 'Dr. Vikram Sarabhai', employeeId: 'T001', department: 'Science' }
  });

  const teacher2User = await prisma.user.create({
    data: { schoolId, email: 'ramanujan@greenvalley.edu', phone: '9876543211', passwordHash: defaultPassword, role: 'TEACHER' }
  });
  const teacher2 = await prisma.teacher.create({
    data: { schoolId, userId: teacher2User.id, name: 'Srinivasa Ramanujan', employeeId: 'T002', department: 'Mathematics' }
  });

  // ─── 5. CREATE SUBJECTS & ASSIGN TEACHERS ────────────────────────
  console.log('📚 Mapping Curriculum Catalog...');
  const subScience10 = await prisma.subject.create({
    data: { schoolId, classId: class10.id, teacherId: teacher1.id, name: 'Advanced Physics', code: 'PHY-101' }
  });
  const subMath10 = await prisma.subject.create({
    data: { schoolId, classId: class10.id, teacherId: teacher2.id, name: 'Algebra II', code: 'MAT-102' }
  });
  const subMath11 = await prisma.subject.create({
    data: { schoolId, classId: class11.id, teacherId: teacher2.id, name: 'Calculus I', code: 'MAT-201' }
  });

  // ─── 6. ENROLL STUDENTS ──────────────────────────────────────────
  console.log('🎓 Enrolling Student Matrix...');
  
  // Student 1: Arjun (Class 10 A)
  const student1User = await prisma.user.create({
    data: { schoolId, email: 'arjun@greenvalley.edu', passwordHash: defaultPassword, role: 'STUDENT' }
  });
  const student1 = await prisma.student.create({
    data: { schoolId, userId: student1User.id, name: 'Arjun Nair', rollNumber: '10A001', gender: 'MALE', classId: class10.id, sectionId: sec10A.id }
  });

  // Student 2: Priya (Class 10 A)
  const student2User = await prisma.user.create({
    data: { schoolId, email: 'priya@greenvalley.edu', passwordHash: defaultPassword, role: 'STUDENT' }
  });
  const student2 = await prisma.student.create({
    data: { schoolId, userId: student2User.id, name: 'Priya Patel', rollNumber: '10A002', gender: 'FEMALE', classId: class10.id, sectionId: sec10A.id }
  });

  // Student 3: Rahul (Class 10 B)
  const student3User = await prisma.user.create({
    data: { schoolId, email: 'rahul@greenvalley.edu', passwordHash: defaultPassword, role: 'STUDENT' }
  });
  const student3 = await prisma.student.create({
    data: { schoolId, userId: student3User.id, name: 'Rahul Sharma', rollNumber: '10B001', gender: 'MALE', classId: class10.id, sectionId: sec10B.id }
  });

  // ─── 7. GENERATE HOMEWORK & SUBMISSIONS ──────────────────────────
  console.log('📝 Generating Active Homework Assignments...');
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const hw1 = await prisma.homework.create({
    data: {
      schoolId,
      classId: class10.id,
      subjectId: subScience10.id,
      teacherId: teacher1.id,
      title: "Newton's Laws of Motion - Lab Report",
      description: 'Complete the lab worksheet attached in the portal. Ensure all diagrams are labeled.',
      dueDate: nextWeek,
    }
  });

  // Auto-generate pending submissions for Arjun, Priya, and Rahul (all are Class 10)
  await prisma.homeworkSubmission.createMany({
    data: [student1, student2, student3].map(s => ({
      schoolId,
      homeworkId: hw1.id,
      studentId: s.id,
      status: 'PENDING',
    }))
  });

  // ─── 8. BROADCAST NOTICES ────────────────────────────────────────
  console.log('📢 Broadcasting System Notices...');
  await prisma.notice.createMany({
    data: [
      { schoolId, authorId: adminUser.id, targetRole: 'ALL', title: 'Welcome to the New Academic Year!', content: 'Wisdomly OS is now fully operational. Please check your dashboards for updated schedules.' },
      { schoolId, authorId: adminUser.id, targetRole: 'TEACHER', title: 'Faculty Meeting on Friday', content: 'We will be reviewing the new grading rubrics in the staff room at 3:00 PM.' },
      { schoolId, authorId: adminUser.id, targetRole: 'STUDENT', title: 'Science Fair Registration Open', content: 'Submit your project proposals to Dr. Sarabhai by end of week.' }
    ]
  });

  console.log('✅ Master Seed Protocol Complete! Green Valley School is live.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });