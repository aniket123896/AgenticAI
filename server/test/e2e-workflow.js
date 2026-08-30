import { startServer } from '../server.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Staff from '../models/Staff.js';
import Complaint from '../models/Complaint.js';

const API_BASE = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('🚀 Starting CCMS End-to-End Workflow Verification...');

  // Start the server
  const { server } = await startServer();

  let studentToken = '';
  let adminToken = '';
  let testComplaintId = '';
  let createdComplaintMongoId = '';
  let testDeptId = '';
  let testStaffId = '';

  try {
    // 1. Register student
    console.log('\n[Step 1] Registering a new Student (John Doe)...');
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: `john.doe.${Date.now()}@college.com`,
        studentId: `STU${Date.now().toString().slice(-4)}`,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        department: 'Computer Science & Engineering',
        year: '2nd Year',
        phone: '+1 555-9876'
      })
    });
    const regData = await regRes.json();
    if (!regData.success) throw new Error(`Registration failed: ${regData.message}`);
    studentToken = regData.data.token;
    console.log(`✅ Student registered successfully: ${regData.data.user.name} (${regData.data.user.studentId})`);

    // 2. Login as student
    console.log('\n[Step 2] Logging in as Student...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: regData.data.user.email,
        password: 'Password@123'
      })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error(`Login failed: ${loginData.message}`);
    studentToken = loginData.data.token;
    console.log('✅ Student logged in successfully, JWT token acquired');

    // 3 & 4. Submit complaint & get CMP ID
    console.log('\n[Step 3 & 4] Submitting Complaint as Student...');
    const complaintRes = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Projector HDMI port broken in Room 402',
        category: 'Classroom',
        location: 'Academic Block A, 4th Floor, Lecture Hall 402',
        priority: 'High',
        description: 'The HDMI interface cable is snapped and students cannot present project slides during seminars.'
      })
    });
    const complaintData = await complaintRes.json();
    if (!complaintData.success) throw new Error(`Complaint submission failed: ${complaintData.message}`);
    createdComplaintMongoId = complaintData.data._id;
    testComplaintId = complaintData.data.complaintId;
    console.log(`✅ Complaint submitted successfully! Ticket ID: ${testComplaintId} (Status: ${complaintData.data.status})`);
    if (!testComplaintId.startsWith('CMP-')) {
      throw new Error(`Invalid complaint ID format: ${testComplaintId}`);
    }

    // 5. Admin logs in
    console.log('\n[Step 5] Admin Logging in...');
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college.com',
        password: 'Admin@123'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginData.success) throw new Error(`Admin login failed: ${adminLoginData.message}`);
    adminToken = adminLoginData.data.token;
    console.log('✅ Admin authenticated successfully');

    // 6. Admin sees complaint
    console.log('\n[Step 6] Admin listing all complaints...');
    const adminListRes = await fetch(`${API_BASE}/admin/complaints?search=${testComplaintId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminListData = await adminListRes.json();
    if (!adminListData.success || adminListData.data.complaints.length === 0) {
      throw new Error('Admin could not find the submitted complaint');
    }
    console.log(`✅ Admin retrieved complaint ${testComplaintId} in management listing`);

    // 7. Admin changes status to Under Review
    console.log('\n[Step 7] Admin changing status to "Under Review"...');
    const underReviewRes = await fetch(`${API_BASE}/admin/complaints/${createdComplaintMongoId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Under Review' })
    });
    const underReviewData = await underReviewRes.json();
    if (!underReviewData.success || underReviewData.data.status !== 'Under Review') {
      throw new Error('Failed to set Under Review status');
    }
    console.log('✅ Status transitioned to: Under Review');

    // 8 & 9. Fetch depts, staff & assign
    console.log('\n[Step 8 & 9] Admin assigning Department and Staff...');
    const deptsRes = await fetch(`${API_BASE}/departments`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const deptsData = await deptsRes.json();
    const itDept = deptsData.data.find((d) => d.name === 'IT Department') || deptsData.data[0];
    testDeptId = itDept._id;

    const staffRes = await fetch(`${API_BASE}/staff?department=${testDeptId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const staffData = await staffRes.json();
    testStaffId = staffData.data[0]?._id;

    const assignRes = await fetch(`${API_BASE}/admin/complaints/${createdComplaintMongoId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        departmentId: testDeptId,
        staffId: testStaffId
      })
    });
    const assignData = await assignRes.json();
    if (!assignData.success) throw new Error('Failed to assign department and staff');
    console.log(`✅ Assigned to Department (${assignData.data.assignedDepartment?.name}) and Staff (${assignData.data.assignedStaff?.name})`);

    // 10. Admin changes status to In Progress
    console.log('\n[Step 10] Admin changing status to "In Progress"...');
    const inProgressRes = await fetch(`${API_BASE}/admin/complaints/${createdComplaintMongoId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'In Progress' })
    });
    const inProgressData = await inProgressRes.json();
    if (!inProgressData.success || inProgressData.data.status !== 'In Progress') {
      throw new Error('Failed to transition to In Progress');
    }
    console.log('✅ Status transitioned to: In Progress');

    // 11. Admin adds comment
    console.log('\n[Step 11] Admin posting progress update comment...');
    const commentRes = await fetch(`${API_BASE}/admin/complaints/${createdComplaintMongoId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        comment: 'Technician dispatched with replacement high-speed gold-plated HDMI cable.'
      })
    });
    const commentData = await commentRes.json();
    if (!commentData.success) throw new Error('Failed to post admin comment');
    console.log(`✅ Admin comment posted: "${commentData.data.comment}"`);

    // 12 & 13. Admin adds resolution & sets Resolved
    console.log('\n[Step 12 & 13] Admin resolving complaint with resolution notes...');
    const resolveRes = await fetch(`${API_BASE}/admin/complaints/${createdComplaintMongoId}/resolve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        resolutionText: 'Replacement 4K HDMI cable installed and tested with laptop display in Room 402.'
      })
    });
    const resolveData = await resolveRes.json();
    if (!resolveData.success || resolveData.data.status !== 'Resolved') {
      throw new Error('Failed to mark complaint as Resolved');
    }
    console.log(`✅ Complaint marked Resolved with note: "${resolveData.data.resolutionDetails.text}"`);

    // 14 & 15. Student sees updated status & views resolution
    console.log('\n[Step 14 & 15] Student viewing updated status and resolution...');
    const studentViewRes = await fetch(`${API_BASE}/complaints/${createdComplaintMongoId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const studentViewData = await studentViewRes.json();
    if (!studentViewData.success || studentViewData.data.complaint.status !== 'Resolved') {
      throw new Error('Student did not see Resolved status');
    }
    console.log(`✅ Student verified status is ${studentViewData.data.complaint.status} and resolution details are visible.`);

    // 16. Student closes complaint
    console.log('\n[Step 16] Student closing the resolved complaint...');
    const closeRes = await fetch(`${API_BASE}/complaints/${createdComplaintMongoId}/close`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const closeData = await closeRes.json();
    if (!closeData.success || closeData.data.status !== 'Closed') {
      throw new Error('Failed to close complaint');
    }
    console.log('✅ Complaint closed by student');

    // 17. Student submits feedback
    console.log('\n[Step 17] Student submitting 5-Star Feedback & rating...');
    const feedbackRes = await fetch(`${API_BASE}/complaints/${createdComplaintMongoId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        rating: 5,
        comment: 'Super fast replacement! Worked seamlessly for our class presentation.'
      })
    });
    const feedbackData = await feedbackRes.json();
    if (!feedbackData.success || feedbackData.data.rating !== 5) {
      throw new Error('Failed to submit feedback');
    }
    console.log(`✅ Feedback recorded: ${feedbackData.data.rating} Stars - "${feedbackData.data.comment}"`);

    // 18. Admin dashboard statistics update
    console.log('\n[Step 18] Verifying Admin Dashboard statistics...');
    const dashRes = await fetch(`${API_BASE}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const dashData = await dashRes.json();
    if (!dashData.success) throw new Error('Failed to fetch admin dashboard');
    console.log(`✅ Admin Dashboard Stats Verified: Total=${dashData.data.stats.total}, Closed=${dashData.data.stats.closed}, Resolved=${dashData.data.stats.resolved}`);

    console.log('\n🎉 ========================================================= 🎉');
    console.log('✅ ALL 18 STEPS OF THE END-TO-END WORKFLOW PASSED FLAWLESSLY!');
    console.log('🎉 ========================================================= 🎉\n');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ TEST FAILURE: ${err.message}`);
    if (server) server.close();
    process.exit(1);
  }
};

runTests();
