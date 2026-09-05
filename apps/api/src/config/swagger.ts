import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wisdomly OS API',
      version: '1.0.0',
      description: 'Enterprise School Management Platform API',
      contact: { name: 'Wisdomly Support', email: 'support@wisdomly.com' },
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Development' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {},
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & Registration' },
      { name: 'Students', description: 'Student management' },
      { name: 'Teachers', description: 'Teacher management' },
      { name: 'Classes', description: 'Class & section management' },
      { name: 'Subjects', description: 'Subject management' },
      { name: 'Timetable', description: 'Weekly schedule management' },
      { name: 'Attendance', description: 'Attendance tracking' },
      { name: 'Exams', description: 'Exam & results management' },
      { name: 'Marks', description: 'Marks entry & grading' },
      { name: 'Fees', description: 'Fee management & payments' },
      { name: 'Homework', description: 'Homework assignments & submissions' },
      { name: 'Library', description: 'Book catalog & borrowing' },
      { name: 'Staff', description: 'Non-teaching staff management' },
      { name: 'Messages', description: 'Internal messaging' },
      { name: 'Notices', description: 'Broadcast announcements' },
      { name: 'Leaves', description: 'Leave requests & approvals' },
      { name: 'Documents', description: 'Document uploads & management' },
      { name: 'Payments', description: 'Online payment integration' },
      { name: 'Analytics', description: 'Dashboard analytics & reports' },
      { name: 'School', description: 'School profile & settings' },
      { name: 'Super Admin', description: 'Platform administration' },
    ],
  },
  apis: ['./src/modules/**/*.router.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
