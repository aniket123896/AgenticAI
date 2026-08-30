import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Staff from '../models/Staff.js';
import Complaint from '../models/Complaint.js';
import Comment from '../models/Comment.js';
import Feedback from '../models/Feedback.js';
import ComplaintHistory from '../models/ComplaintHistory.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to database for seeding...');
    await connectDB();

    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      Department.deleteMany(),
      Staff.deleteMany(),
      Complaint.deleteMany(),
      Comment.deleteMany(),
      Feedback.deleteMany(),
      ComplaintHistory.deleteMany()
    ]);

    console.log('👤 Creating users (Admin & Students)...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@college.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+1 555-0100'
    });

    const student1 = await User.create({
      name: 'Demo Student',
      email: 'student@college.com',
      password: 'Student@123',
      studentId: 'STU001',
      role: 'student',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      phone: '+1 555-0199'
    });

    const student2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.j@college.com',
      password: 'Student@123',
      studentId: 'STU002',
      role: 'student',
      department: 'Mechanical Engineering',
      year: '2nd Year',
      phone: '+1 555-0188'
    });

    console.log('🏢 Creating departments...');
    const departmentNames = [
      { name: 'IT Department', description: 'Campus network, servers, Wi-Fi, computer labs & software systems' },
      { name: 'Maintenance', description: 'Civil infrastructure, furniture, painting, and classroom fixtures' },
      { name: 'Hostel Department', description: 'Hostel accommodations, amenities, mess, and living facilities' },
      { name: 'Transport Department', description: 'College buses, parking facilities, and campus shuttles' },
      { name: 'Library', description: 'Central library, book circulation, study halls, and digital archives' },
      { name: 'Administration', description: 'Academic records, fees, admissions, and institutional inquiries' },
      { name: 'Security', description: 'Campus security, CCTV monitoring, gate passes, and safety protocols' },
      { name: 'Housekeeping', description: 'Classroom & washroom cleanliness, waste management, sanitization' },
      { name: 'Electrical Department', description: 'Power supply, lighting, ACs, generators, and lab electricals' }
    ];

    const createdDepts = await Department.insertMany(departmentNames);
    const deptMap = {};
    createdDepts.forEach((d) => {
      deptMap[d.name] = d;
    });

    console.log('👨‍💼 Creating staff members...');
    const staffMembers = [
      {
        name: 'Dr. Robert Martinez',
        email: 'robert.it@college.com',
        phone: '+1 555-1001',
        department: deptMap['IT Department']._id,
        designation: 'Senior Network Administrator'
      },
      {
        name: 'Alan Turing',
        email: 'alan.tech@college.com',
        phone: '+1 555-1002',
        department: deptMap['IT Department']._id,
        designation: 'Lab Systems Engineer'
      },
      {
        name: 'Carlos Mendez',
        email: 'carlos.maint@college.com',
        phone: '+1 555-1003',
        department: deptMap['Maintenance']._id,
        designation: 'Chief Maintenance Officer'
      },
      {
        name: 'Anita Sharma',
        email: 'anita.hostel@college.com',
        phone: '+1 555-1004',
        department: deptMap['Hostel Department']._id,
        designation: 'Hostel Warden - Block B'
      },
      {
        name: 'Michael Chang',
        email: 'michael.elec@college.com',
        phone: '+1 555-1005',
        department: deptMap['Electrical Department']._id,
        designation: 'Senior Electrical Engineer'
      },
      {
        name: 'Rachel Adams',
        email: 'rachel.clean@college.com',
        phone: '+1 555-1006',
        department: deptMap['Housekeeping']._id,
        designation: 'Housekeeping Supervisor'
      }
    ];

    const createdStaff = await Staff.insertMany(staffMembers);
    const staffMap = {};
    createdStaff.forEach((s) => {
      staffMap[s.name] = s;
    });

    console.log('📝 Creating sample complaints...');
    const year = new Date().getFullYear();

    // 1. Submitted complaint
    const cmp1 = await Complaint.create({
      complaintId: `CMP-${year}-0001`,
      title: 'Projector flickering and distorted colors in Room 304',
      description: 'The overhead projector in Room 304 frequently shuts down during lectures and displays a severe yellow tint.',
      category: 'Classroom',
      location: 'Block A, 3rd Floor, Lecture Hall 304',
      priority: 'Medium',
      status: 'Submitted',
      submittedBy: student1._id,
      attachments: []
    });

    await ComplaintHistory.create({
      complaint: cmp1._id,
      action: 'Complaint Created',
      performedBy: student1._id,
      previousValue: '',
      newValue: 'Submitted',
      notes: 'Submitted by Demo Student'
    });

    // 2. Under Review complaint
    const cmp2 = await Complaint.create({
      complaintId: `CMP-${year}-0002`,
      title: 'Water cooler leaking heavily on 2nd Floor corridor',
      description: 'The cold water dispenser near the mechanical department is leaking water continuously, creating a slip hazard.',
      category: 'Water Supply',
      location: 'Mechanical Block, 2nd Floor West Wing',
      priority: 'High',
      status: 'Under Review',
      submittedBy: student2._id,
      attachments: []
    });

    await ComplaintHistory.create({
      complaint: cmp2._id,
      action: 'Complaint Created',
      performedBy: student2._id,
      previousValue: '',
      newValue: 'Submitted',
      notes: 'Submitted by Sarah Jenkins'
    });
    await ComplaintHistory.create({
      complaint: cmp2._id,
      action: 'Status Changed',
      performedBy: admin._id,
      previousValue: 'Submitted',
      newValue: 'Under Review',
      notes: 'Admin placed complaint under review for urgent assessment'
    });

    // 3. In Progress complaint
    const cmp3 = await Complaint.create({
      complaintId: `CMP-${year}-0003`,
      title: 'Wi-Fi access point dead in Computer Lab 2',
      description: 'Students are unable to connect to the campus wireless network in Lab 2. The AP shows no power LED indicator.',
      category: 'Wi-Fi / Internet',
      location: 'Computer Engineering Department - Lab 2',
      priority: 'High',
      status: 'In Progress',
      submittedBy: student1._id,
      assignedDepartment: deptMap['IT Department']._id,
      assignedStaff: staffMap['Dr. Robert Martinez']._id,
      attachments: []
    });

    await ComplaintHistory.create({
      complaint: cmp3._id,
      action: 'Complaint Created',
      performedBy: student1._id,
      previousValue: '',
      newValue: 'Submitted'
    });
    await ComplaintHistory.create({
      complaint: cmp3._id,
      action: 'Department Assigned',
      performedBy: admin._id,
      previousValue: '',
      newValue: 'IT Department'
    });
    await ComplaintHistory.create({
      complaint: cmp3._id,
      action: 'Staff Assigned',
      performedBy: admin._id,
      previousValue: '',
      newValue: 'Dr. Robert Martinez'
    });
    await ComplaintHistory.create({
      complaint: cmp3._id,
      action: 'Status Changed',
      performedBy: admin._id,
      previousValue: 'Assigned',
      newValue: 'In Progress',
      notes: 'IT Team has dispatched replacement PoE adapter'
    });

    await Comment.create({
      complaint: cmp3._id,
      user: admin._id,
      comment: 'The Wi-Fi router has been inspected. Replacement hardware is on order and will be fitted today.'
    });

    // 4. Resolved complaint (ready for student closure & feedback)
    const cmp4 = await Complaint.create({
      complaintId: `CMP-${year}-0004`,
      title: 'Broken fluorescent tube light in Hostel Block B Study Room',
      description: 'Two tube lights in the 4th floor study room are completely burned out making it difficult to study at night.',
      category: 'Hostel',
      location: 'Hostel Block B, 4th Floor Study Hall',
      priority: 'Medium',
      status: 'Resolved',
      submittedBy: student1._id,
      assignedDepartment: deptMap['Electrical Department']._id,
      assignedStaff: staffMap['Michael Chang']._id,
      resolvedAt: new Date(),
      resolutionDetails: {
        text: 'Both LED fixtures were replaced with high-efficiency 36W tubes and wiring inspected.',
        resolvedBy: admin._id,
        resolvedAt: new Date()
      },
      attachments: []
    });

    await ComplaintHistory.create({
      complaint: cmp4._id,
      action: 'Complaint Created',
      performedBy: student1._id,
      previousValue: '',
      newValue: 'Submitted'
    });
    await ComplaintHistory.create({
      complaint: cmp4._id,
      action: 'Resolution Added',
      performedBy: admin._id,
      previousValue: 'In Progress',
      newValue: 'Resolved',
      notes: 'Fixtures replaced and verified operational'
    });

    // 5. Closed complaint with Feedback
    const cmp5 = await Complaint.create({
      complaintId: `CMP-${year}-0005`,
      title: 'Air conditioning not cooling in Central Library Reading Room',
      description: 'The central AC unit in the library reading room was blowing warm air causing discomfort.',
      category: 'Library',
      location: 'Central Library, 1st Floor East Wing',
      priority: 'Medium',
      status: 'Closed',
      submittedBy: student1._id,
      assignedDepartment: deptMap['Electrical Department']._id,
      assignedStaff: staffMap['Michael Chang']._id,
      resolvedAt: new Date(Date.now() - 86400000),
      closedAt: new Date(),
      resolutionDetails: {
        text: 'Coolant topped up and air filters cleaned. Thermostat calibrated.',
        resolvedBy: admin._id,
        resolvedAt: new Date(Date.now() - 86400000)
      },
      attachments: []
    });

    const feedback5 = await Feedback.create({
      complaint: cmp5._id,
      student: student1._id,
      rating: 5,
      comment: 'Prompt resolution! The library room is now very comfortable. Thank you.'
    });

    cmp5.feedback = feedback5._id;
    await cmp5.save();

    await ComplaintHistory.create({
      complaint: cmp5._id,
      action: 'Complaint Closed',
      performedBy: student1._id,
      previousValue: 'Resolved',
      newValue: 'Closed',
      notes: 'Demo Student confirmed resolution and marked closed'
    });
    await ComplaintHistory.create({
      complaint: cmp5._id,
      action: 'Feedback Submitted',
      performedBy: student1._id,
      previousValue: '',
      newValue: '5 Stars',
      notes: 'Student feedback received'
    });

    console.log('✅ Seed completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Admin Account:   admin@college.com   / Admin@123');
    console.log('Student Account: student@college.com / Student@123');
    console.log('----------------------------------------------------');

    return { admin, student1, student2 };
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// If run directly via node
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await disconnectDB();
      process.exit(1);
    });
}
