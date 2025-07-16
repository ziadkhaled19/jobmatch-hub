const nodemailer = require('nodemailer');

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (user) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@jobmatchhub.com',
    to: user.email,
    subject: 'Welcome to JobMatchHub!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to JobMatchHub, ${user.name}!</h2>
        <p>Thank you for joining our platform. You're now ready to ${user.role === 'recruiter' ? 'post jobs and find great candidates' : 'explore job opportunities'}.</p>
        <p>Get started by completing your profile and ${user.role === 'recruiter' ? 'posting your first job' : 'applying to jobs that match your skills'}.</p>
        <p>Best regards,<br>The JobMatchHub Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', user.email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

/**
 * Send application notification to recruiter
 */
const sendApplicationNotification = async (recruiter, job, applicant) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@jobmatchhub.com',
    to: recruiter.email,
    subject: `New Application for ${job.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Job Application</h2>
        <p>You have received a new application for the position: <strong>${job.title}</strong></p>
        <p><strong>Applicant:</strong> ${applicant.name}</p>
        <p><strong>Email:</strong> ${applicant.email}</p>
        <p>Please log in to your dashboard to review the application.</p>
        <p>Best regards,<br>The JobMatchHub Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Application notification sent to:', recruiter.email);
  } catch (error) {
    console.error('Error sending application notification:', error);
  }
};

/**
 * Send application status update to applicant
 */
const sendApplicationStatusUpdate = async (applicant, job, status) => {
  const transporter = createTransporter();
  
  const statusMessages = {
    reviewed: 'Your application has been reviewed',
    shortlisted: 'Congratulations! You have been shortlisted',
    interviewed: 'You have been scheduled for an interview',
    offered: 'Congratulations! You have been offered the position',
    rejected: 'Your application was not selected this time'
  };

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@jobmatchhub.com',
    to: applicant.email,
    subject: `Application Update: ${job.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Application Status Update</h2>
        <p>Hello ${applicant.name},</p>
        <p><strong>${statusMessages[status]}</strong> for the position: <strong>${job.title}</strong> at ${job.company}</p>
        <p>Please log in to your dashboard for more details.</p>
        <p>Best regards,<br>The JobMatchHub Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Status update email sent to:', applicant.email);
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendApplicationNotification,
  sendApplicationStatusUpdate
};
