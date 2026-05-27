import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const school = await prisma.school.upsert({
    where: { slug: 'greenvalley-school' },
    update: {},
    create: {
      name: 'Green Valley School',
      slug: 'greenvalley-school',
      plan: 'FREE',
      studentLimit: 50,
      subscription: { create: { plan: 'FREE', studentLimit: 50 } }
    },
  });

  const pwd = '$2b$12$v4dHRxsuFk4O1i/ge/Ct0eZ.YNtM6uqr59Qbmfwke7yO4NmC2yPCG'; // Test@1234

  const admin = await prisma.user.upsert({
    where: { schoolId_email: { schoolId: school.id, email: 'admin@greenvalley.edu' } },
    update: { passwordHash: pwd },
    create: { schoolId: school.id, email: 'admin@greenvalley.edu', passwordHash: pwd, role: Role.ADMIN },
  });

  const teacher = await prisma.user.upsert({
    where: { schoolId_email: { schoolId: school.id, email: 'teacher1@greenvalley.edu' } },
    update: { passwordHash: pwd },
    create: {
      schoolId: school.id, email: 'teacher1@greenvalley.edu', passwordHash: pwd, role: Role.TEACHER,
      teacher: { create: { schoolId: school.id, employeeId: 'T001', name: 'Arun Kumar' } }
    },
  });

  const class10 = await prisma.class.upsert({
    where: { schoolId_name: { schoolId: school.id, name: 'Class 10' } },
    update: {},
    create: { schoolId: school.id, name: 'Class 10', gradeLevel: 10 },
  });

  const sectionA = await prisma.section.upsert({
    where: { schoolId_classId_name: { schoolId: school.id, classId: class10.id, name: 'A' } },
    update: {},
    create: { schoolId: school.id, classId: class10.id, name: 'A' },
  });

  const parent = await prisma.user.upsert({
    where: { schoolId_phone: { schoolId: school.id, phone: '9876543212' } },
    update: { passwordHash: pwd },
    create: {
      schoolId: school.id, phone: '9876543212', passwordHash: pwd, role: Role.PARENT,
      parent: { create: { schoolId: school.id, name: 'Ramesh Nair' } }
    },
  });
  
  const parentRecord = await prisma.parent.findUnique({ where: { userId: parent.id } });

  const student = await prisma.user.upsert({
    where: { schoolId_email: { schoolId: school.id, email: 'student@greenvalley.edu' } },
    update: { passwordHash: pwd },
    create: {
      schoolId: school.id, email: 'student@greenvalley.edu', passwordHash: pwd, role: Role.STUDENT,
      student: { create: { schoolId: school.id, rollNumber: '10A001', name: 'Arjun Nair', classId: class10.id, sectionId: sectionA.id, parentId: parentRecord?.id } }
    },
  });

  console.log('✅ Admin: admin@greenvalley.edu / Test@1234');
  console.log('✅ Teacher: teacher1@greenvalley.edu / Test@1234');
  console.log('✅ Parent Phone: 9876543212 / Test@1234');
  console.log('✅ Student Roll: 10A001 / Test@1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());