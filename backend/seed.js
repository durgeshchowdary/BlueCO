const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Student = require('./models/Student');
const Coach = require('./models/Coach');
const Batch = require('./models/Batch');
const Attendance = require('./models/Attendance');
const Payment = require('./models/Payment');
const Event = require('./models/Event');
const User = require('./models/User');
const Academy = require('./models/Academy');
const Subscription = require('./models/Subscription');
const AuditLog = require('./models/AuditLog');
const FeaturePermission = require('./models/FeaturePermission');
const Permission = require('./models/Permission');
const Task = require('./models/Task');
const { hashPassword } = require('./utils/auth');
const { ROLES } = require('./constants/roles');
const { PERMISSIONS, EMPLOYEE_TYPE_PERMISSIONS } = require('./constants/permissions');

dotenv.config();

const seed = async () => {
  try {
    await connectDB();
    await Promise.all([
      Student.deleteMany(),
      Coach.deleteMany(),
      Batch.deleteMany(),
      Attendance.deleteMany(),
      Payment.deleteMany(),
      Event.deleteMany(),
      User.deleteMany(),
      Academy.deleteMany(),
      Subscription.deleteMany(),
      AuditLog.deleteMany(),
      FeaturePermission.deleteMany(),
      Permission.deleteMany(),
      Task.deleteMany(),
    ]);

    await Permission.insertMany(Object.values(PERMISSIONS).map((key) => ({
      key,
      label: key.split(':').map((part) => part.replace(/_/g, ' ')).join(' '),
      module: key.split(':')[0],
      allowedRoles: key.startsWith('platform') || key.startsWith('academies') || key.startsWith('subscriptions') || key.startsWith('revenue') || key.startsWith('logs') || key.startsWith('features') || key.startsWith('settings')
        ? [ROLES.SUPER_ADMIN]
        : [ROLES.ACADEMY_ADMIN, ROLES.COACH, ROLES.EMPLOYEE],
      defaultEmployeeTypes: Object.entries(EMPLOYEE_TYPE_PERMISSIONS)
        .filter(([, permissions]) => permissions.includes(key))
        .map(([employeeType]) => employeeType),
      isSensitive: key.includes('delete') || key.includes('write') || key.includes('revenue') || key.includes('settings'),
      isActive: true,
    })));

    const academy = await Academy.create({
      name: 'Vijayawada Blues',
      slug: 'vijayawada-blues',
      city: 'Vijayawada',
      status: 'active',
      ownerName: 'Durgesh Chowdary',
      contactEmail: 'admin@vijayawadablues.in',
      featureFlags: ['attendance', 'payments', 'events', 'ai_reports'],
    });

    await Subscription.create({
      academyId: academy._id,
      plan: 'enterprise',
      status: 'active',
      monthlyAmount: 49999,
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const coaches = [
      { academyId: academy._id, name: 'Vikram Shah', sport: 'Cricket', phone: '9321456780', salary: 65000, status: 'Active' },
      { academyId: academy._id, name: 'Priya Reddy', sport: 'Tennis', phone: '9456781230', salary: 62000, status: 'Active' },
      { academyId: academy._id, name: 'Aditya Kumar', sport: 'Football', phone: '9870012345', salary: 68000, status: 'Active' },
      { academyId: academy._id, name: 'Simran Kaur', sport: 'Basketball', phone: '9016778899', salary: 60000, status: 'Active' },
      { academyId: academy._id, name: 'Riya Nair', sport: 'Athletics', phone: '9400123456', salary: 59000, status: 'Active' },
      { academyId: academy._id, name: 'Aman Singh', sport: 'Cricket', phone: '9845123678', salary: 64000, status: 'Active' },
      { academyId: academy._id, name: 'Nisha Das', sport: 'Tennis', phone: '9123004567', salary: 61000, status: 'Active' },
      { academyId: academy._id, name: 'Sameer Khan', sport: 'Football', phone: '9988770011', salary: 67000, status: 'Inactive' },
    ];

    const batches = [
      { academyId: academy._id, name: 'Alpha', sport: 'Cricket', coachName: 'Vikram Shah', timing: '6:00 PM - 8:00 PM', capacity: 18 },
      { academyId: academy._id, name: 'Velocity', sport: 'Tennis', coachName: 'Priya Reddy', timing: '4:00 PM - 6:00 PM', capacity: 14 },
      { academyId: academy._id, name: 'Strikers', sport: 'Football', coachName: 'Aditya Kumar', timing: '5:00 PM - 7:00 PM', capacity: 20 },
      { academyId: academy._id, name: 'Fusion', sport: 'Basketball', coachName: 'Simran Kaur', timing: '3:00 PM - 5:00 PM', capacity: 16 },
      { academyId: academy._id, name: 'Sprinters', sport: 'Athletics', coachName: 'Riya Nair', timing: '7:00 AM - 9:00 AM', capacity: 12 },
      { academyId: academy._id, name: 'Pulse', sport: 'Cricket', coachName: 'Aman Singh', timing: '6:30 PM - 8:30 PM', capacity: 16 },
      { academyId: academy._id, name: 'Court Kings', sport: 'Tennis', coachName: 'Nisha Das', timing: '5:00 PM - 7:00 PM', capacity: 12 },
      { academyId: academy._id, name: 'Goal Collective', sport: 'Football', coachName: 'Sameer Khan', timing: '4:30 PM - 6:30 PM', capacity: 18 },
    ];

    const studentProfiles = [
      ['Aarav Patel', 14, 'Cricket', 'Alpha', 'Rajesh Patel', 4500, 'Paid'],
      ['Nina Sharma', 12, 'Tennis', 'Velocity', 'Sunita Sharma', 4200, 'Pending'],
      ['Kabir Singh', 16, 'Football', 'Strikers', 'Geeta Singh', 4800, 'Paid'],
      ['Myra Joshi', 13, 'Basketball', 'Fusion', 'Rohan Joshi', 4600, 'Pending'],
      ['Rohit Mehra', 15, 'Cricket', 'Alpha', 'Anita Mehra', 4500, 'Paid'],
      ['Sara Khan', 14, 'Athletics', 'Sprinters', 'Nabil Khan', 4300, 'Paid'],
      ['Maya Desai', 11, 'Tennis', 'Velocity', 'Rhea Desai', 4200, 'Pending'],
      ['Ishaan Verma', 15, 'Football', 'Goal Collective', 'Sunil Verma', 4800, 'Paid'],
      ['Priya Joshi', 13, 'Basketball', 'Fusion', 'Kiran Joshi', 4600, 'Paid'],
      ['Devansh Rao', 14, 'Cricket', 'Pulse', 'Praveen Rao', 4500, 'Pending'],
      ['Ananya Sen', 12, 'Athletics', 'Sprinters', 'Mina Sen', 4300, 'Paid'],
      ['Aryan Gupta', 16, 'Football', 'Goal Collective', 'Vikram Gupta', 4800, 'Paid'],
      ['Zara Patel', 13, 'Tennis', 'Court Kings', 'Rajat Patel', 4200, 'Paid'],
      ['Kabir Mehta', 14, 'Cricket', 'Alpha', 'Rekha Mehta', 4500, 'Pending'],
      ['Tanvi Roy', 15, 'Basketball', 'Fusion', 'Sanjay Roy', 4600, 'Paid'],
      ['Neil Das', 16, 'Football', 'Strikers', 'Anjana Das', 4800, 'Paid'],
      ['Isha Kapoor', 12, 'Tennis', 'Velocity', 'Pooja Kapoor', 4200, 'Paid'],
      ['Kunal Shah', 15, 'Athletics', 'Sprinters', 'Meena Shah', 4300, 'Pending'],
      ['Alia Nair', 13, 'Basketball', 'Fusion', 'Ramesh Nair', 4600, 'Paid'],
      ['Rhea Kumar', 14, 'Cricket', 'Pulse', 'Deven Kumar', 4500, 'Paid'],
      ['Arjun Singh', 16, 'Football', 'Strikers', 'Neha Singh', 4800, 'Pending'],
      ['Meera Joshi', 12, 'Tennis', 'Court Kings', 'Arun Joshi', 4200, 'Paid'],
      ['Shaan Patel', 15, 'Athletics', 'Sprinters', 'Tina Patel', 4300, 'Paid'],
      ['Nyla Shah', 13, 'Cricket', 'Alpha', 'Hetal Shah', 4500, 'Paid'],
      ['Veer Kumar', 14, 'Football', 'Goal Collective', 'Jaya Kumar', 4800, 'Paid'],
      ['Diya Sharma', 11, 'Tennis', 'Velocity', 'Aarti Sharma', 4200, 'Pending'],
      ['Mihir Roy', 15, 'Basketball', 'Fusion', 'Ritu Roy', 4600, 'Paid'],
      ['Sanya Mehra', 13, 'Athletics', 'Sprinters', 'Ravi Mehra', 4300, 'Paid'],
      ['Rahil Desai', 16, 'Cricket', 'Pulse', 'Ila Desai', 4500, 'Paid'],
      ['Anika Sen', 14, 'Football', 'Strikers', 'Rakesh Sen', 4800, 'Pending'],
    ];

    const students = studentProfiles.map(([name, age, sport, batch, parentName, monthlyFee, feeStatus]) => ({
      name,
      age,
      sport,
      batch,
      phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
      parentName,
      monthlyFee,
      feeStatus,
      academyId: academy._id,
      joinedAt: new Date(2024, Math.floor(Math.random() * 4), Math.floor(Math.random() * 28) + 1),
    }));

    const today = new Date();
    const thisMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(today);

    const attendanceStatuses = ['Present', 'Absent'];
    const attendance = [];
    for (let dayOffset = 0; dayOffset < 12; dayOffset += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);
      students.slice(dayOffset, dayOffset + 4).forEach((student, index) => {
        attendance.push({
          studentName: student.name,
          sport: student.sport,
          date,
          status: attendanceStatuses[(index + dayOffset) % attendanceStatuses.length],
          academyId: academy._id,
        });
      });
    }

    const payments = students.slice(0, 25).map((student, index) => ({
      studentName: student.name,
      amount: student.monthlyFee,
      status: index % 4 === 0 ? 'Pending' : 'Paid',
      month: thisMonth,
      paidAt: new Date(today.getTime() - index * 24 * 60 * 60 * 1000),
      academyId: academy._id,
    }));

    const events = [
      { academyId: academy._id, title: 'City Junior Cricket Cup', sport: 'Cricket', date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), location: 'North Arena', description: 'A competitive tournament for under-16 teams.' },
      { academyId: academy._id, title: 'Girls Tennis Clinic', sport: 'Tennis', date: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000), location: 'Court One', description: 'Skill sharpening clinic with top coaches.' },
      { academyId: academy._id, title: 'Football Skills Camp', sport: 'Football', date: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000), location: 'East Field', description: 'Focused drills for ball control and tactics.' },
      { academyId: academy._id, title: 'Weekend Basketball Challenge', sport: 'Basketball', date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), location: 'South Gym', description: 'Open play and friendly match day.' },
      { academyId: academy._id, title: 'AI Training Showcase', sport: 'Multi-sport', date: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000), location: 'Main Hall', description: 'Presenting AI-powered progress reports to parents.' },
      { academyId: academy._id, title: 'Speed & Agility Meet', sport: 'Athletics', date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), location: 'Track Stadium', description: 'Sprint and endurance assessments for young athletes.' },
      { academyId: academy._id, title: 'Coach Roundtable', sport: 'Multi-sport', date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), location: 'Conference Hall', description: 'Planning session for upcoming academy programs.' },
      { academyId: academy._id, title: 'Parent Showcase Day', sport: 'Multi-sport', date: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), location: 'Main Arena', description: 'Parents invited to view student progress and training results.' },
    ];

    const insertedStudents = await Student.insertMany(students);
    await Coach.insertMany(coaches);
    const insertedBatches = await Batch.insertMany(batches);
    await Attendance.insertMany(attendance);
    await Payment.insertMany(payments);
    await Event.insertMany(events);

    await User.insertMany([
      {
        name: 'Platform Owner',
        email: 'super@playgrid.ai',
        passwordHash: hashPassword('PlayGrid@123'),
        role: ROLES.SUPER_ADMIN,
        permissions: ['*'],
      },
      {
        name: 'Academy Admin',
        email: 'admin@vijayawadablues.in',
        passwordHash: hashPassword('PlayGrid@123'),
        role: ROLES.ACADEMY_ADMIN,
        academyId: academy._id,
        permissions: [],
      },
      {
        name: 'Vikram Coach',
        email: 'coach@vijayawadablues.in',
        passwordHash: hashPassword('PlayGrid@123'),
        role: ROLES.COACH,
        academyId: academy._id,
        assignedStudents: insertedStudents.slice(0, 8).map((student) => student._id),
        assignedBatches: insertedBatches.slice(0, 2).map((batch) => batch._id),
        permissions: [],
      },
      {
        name: 'Accounts Employee',
        email: 'accountant@vijayawadablues.in',
        passwordHash: hashPassword('PlayGrid@123'),
        role: ROLES.EMPLOYEE,
        academyId: academy._id,
        employeeType: 'accountant',
        permissions: [],
      },
      {
        name: 'Support Employee',
        email: 'support@vijayawadablues.in',
        passwordHash: hashPassword('PlayGrid@123'),
        role: ROLES.EMPLOYEE,
        academyId: academy._id,
        employeeType: 'support_staff',
        permissions: [],
      },
    ]);

    console.log('Data seeded successfully');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
