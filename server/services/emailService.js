import nodemailer from 'nodemailer';

let transporter = null;

// Initialize email transporter
const getTransporter = () => {
  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!emailUser || !emailPass) {
    return null;
  }

  if (emailUser.includes('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

/**
 * Send OTP for Student Registration or Login
 */
export const sendOtpEmail = async (email, otp, purpose = 'login') => {
  const mailTransporter = getTransporter();
  const subject = purpose === 'register' 
    ? '🔐 Verify Your Email - CCMS Campus Portal'
    : '🔑 Your Login Verification Code - CCMS Campus Portal';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">CCMS Campus Portal</h1>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">College Complaint Management System</p>
      </div>

      <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #edf2f7; text-align: center; margin-bottom: 20px;">
        <p style="color: #334155; font-size: 14px; margin-top: 0; margin-bottom: 12px;">
          ${purpose === 'register' ? 'Thank you for registering. Use the one-time verification code below to verify your student account:' : 'Here is your one-time verification code to sign in to your student account:'}
        </p>
        <div style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 6px; padding: 12px 28px; border-radius: 10px; margin: 8px 0; font-family: monospace;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0; margin-top: 12px;">
          This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
        </p>
      </div>

      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
        If you did not request this verification code, please ignore this email or contact campus IT support.
      </p>
    </div>
  `;

  console.log('\n==================================================');
  console.log(`📧 [EMAIL OTP SENT] To: ${email} | Purpose: ${purpose}`);
  console.log(`👉 VERIFICATION CODE: ${otp}`);
  console.log('==================================================\n');

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: `"CCMS Campus Portal" <${process.env.EMAIL_USER || 'no-reply@campus.edu'}>`,
        to: email,
        subject,
        html
      });
      return { sent: true };
    } catch (err) {
      console.error('Failed to send email via SMTP, logged to console instead:', err.message);
      return { sent: false, error: err.message };
    }
  }

  return { sent: false, note: 'SMTP not configured, OTP logged to console' };
};

/**
 * Send Email Notification on Complaint Status Change
 */
export const sendStatusUpdateEmail = async ({
  toEmail,
  studentName,
  complaintId,
  complaintTitle,
  oldStatus,
  newStatus,
  notes = '',
  assignedDept = '',
  assignedStaff = ''
}) => {
  if (!toEmail) return;

  const mailTransporter = getTransporter();
  const subject = `📢 Status Update: Complaint [${complaintId}] is now "${newStatus}"`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">CCMS Campus Grievance System</h1>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Complaint Status Notification</p>
      </div>

      <p style="color: #1e293b; font-size: 15px; margin-top: 0;">
        Dear <strong>${studentName || 'Student'}</strong>,
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        The administration has updated the status of your campus complaint:
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 18px 0;">
        <div style="margin-bottom: 8px;">
          <span style="font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">Ticket ID:</span>
          <span style="font-family: monospace; font-weight: 700; color: #4f46e5; margin-left: 6px;">${complaintId}</span>
        </div>
        <div style="margin-bottom: 12px;">
          <span style="font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">Title:</span>
          <span style="font-weight: 600; color: #0f172a; margin-left: 6px;">${complaintTitle}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0;">
          <span style="display: inline-block; padding: 4px 10px; background-color: #e2e8f0; color: #475569; font-size: 12px; font-weight: 700; border-radius: 6px;">${oldStatus}</span>
          <span style="color: #94a3b8; font-weight: bold; margin: 0 8px;">➔</span>
          <span style="display: inline-block; padding: 4px 12px; background-color: #e0e7ff; color: #4338ca; font-size: 13px; font-weight: 800; border-radius: 6px;">${newStatus}</span>
        </div>
        ${assignedDept ? `<p style="font-size: 13px; color: #334155; margin: 8px 0 0 0;"><strong>Assigned Department:</strong> ${assignedDept}</p>` : ''}
        ${assignedStaff ? `<p style="font-size: 13px; color: #334155; margin: 4px 0 0 0;"><strong>Staff In-Charge:</strong> ${assignedStaff}</p>` : ''}
        ${notes ? `<p style="font-size: 13px; color: #334155; margin: 8px 0 0 0; background-color: #ffffff; padding: 10px; border-radius: 8px; border: 1px dashed #cbd5e1;"><em>"${notes}"</em></p>` : ''}
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/student/complaints" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 10px;">
          View Complaint Details in Portal
        </a>
      </div>
    </div>
  `;

  console.log(`\n📢 [STATUS EMAIL SENT] To: ${toEmail} | Ticket: ${complaintId} | ${oldStatus} ➔ ${newStatus}`);

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: `"CCMS Notifications" <${process.env.EMAIL_USER || 'no-reply@campus.edu'}>`,
        to: toEmail,
        subject,
        html
      });
    } catch (err) {
      console.error('Failed to send status update email via SMTP:', err.message);
    }
  }
};

/**
 * Send Two-Way Closure Notification (Pending Student Confirmation)
 */
export const sendResolutionConfirmationEmail = async ({
  toEmail,
  studentName,
  complaintId,
  complaintTitle,
  resolutionNotes = '',
  complaintMongoId = ''
}) => {
  if (!toEmail) return;

  const mailTransporter = getTransporter();
  const subject = `⚠️ Resolution Verification: Did this fix your complaint [${complaintId}]?`;

  const reviewLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/student/complaints/${complaintMongoId || complaintId}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">Two-Way Resolution Verification</h1>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Campus Maintenance & Grievance Quality Assurance</p>
      </div>

      <p style="color: #1e293b; font-size: 15px; margin-top: 0;">
        Hello <strong>${studentName || 'Student'}</strong>,
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        The administration or technical team has marked your complaint <strong>${complaintTitle}</strong> (${complaintId}) as <strong>RESOLVED</strong>.
      </p>

      ${resolutionNotes ? `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px; margin: 16px 0;">
        <strong style="color: #166534; font-size: 12px; text-transform: uppercase;">Admin Resolution Notes:</strong>
        <p style="color: #14532d; font-size: 13px; margin: 6px 0 0 0;">"${resolutionNotes}"</p>
      </div>` : ''}

      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
        <h3 style="color: #b45309; margin: 0 0 8px 0; font-size: 16px;">Did this properly fix the problem?</h3>
        <p style="color: #78350f; font-size: 12px; margin: 0 0 16px 0;">
          Please confirm if the repair works as expected or reopen the ticket if the issue persists.
          <em>(Tickets automatically close after 3 days if no response is received.)</em>
        </p>

        <a href="${reviewLink}" style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 10px 22px; border-radius: 8px; margin-right: 8px;">
          Confirm & Close
        </a>
        <a href="${reviewLink}" style="display: inline-block; background-color: #e11d48; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 10px 22px; border-radius: 8px;">
          Reopen with Remarks
        </a>
      </div>
    </div>
  `;

  console.log(`\n⚠️ [RESOLUTION VERIFICATION EMAIL SENT] To: ${toEmail} | Ticket: ${complaintId}`);

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: `"CCMS Quality Assurance" <${process.env.EMAIL_USER || 'no-reply@campus.edu'}>`,
        to: toEmail,
        subject,
        html
      });
    } catch (err) {
      console.error('Failed to send resolution email via SMTP:', err.message);
    }
  }
};
