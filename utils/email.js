// const { text } = require("express");
const nodemailer = require("nodemailer");

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASS || "your-app-password",
    },
    tls: { rejectUnauthorized: false },
  });
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (user) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@jobmatchhub.com",
    to: user.email,
    subject: "Welcome to JobMatchHub!",
    text: `
      Welcome to JobMatchHub, ${user.name}!
      Thank you for joining our platform. You're now ready to ${
        user.role === "recruiter"
          ? "post jobs and find great candidates"
          : "explore job opportunities"
      }. Get started by completing your profile and ${
      user.role === "recruiter"
        ? "posting your first job"
        : "applying to jobs that match your skills"
    }`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent to:", user.email);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

/**
 * Send application notification to recruiter
 */
const sendApplicationNotification = async (recruiter, job, applicant) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@jobmatchhub.com",
    to: recruiter.email,
    subject: `New Application for ${job.title}`,
    text: `
      You have received a new application for the position: ${job.title}
      Applicant: ${applicant.name}
      Email: ${applicant.email}
      Please log in to your dashboard to review the application.
      Best regards,
      The JobMatchHub Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Application notification sent to:", recruiter.email);
  } catch (error) {
    console.error("Error sending application notification:", error);
  }
};

/**
 * Send application status update to applicant
 */
const sendApplicationStatusUpdate = async (applicant, job, status) => {
  const transporter = createTransporter();

  const statusMessages = {
    reviewed: "Your application has been reviewed",
    shortlisted: "Congratulations! You have been shortlisted",
    interviewed: "You have been scheduled for an interview",
    offered: "Congratulations! You have been offered the position",
    rejected: "Your application was not selected this time",
  };

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@jobmatchhub.com",
    to: applicant.email,
    subject: `Application Update: ${job.title}`,
    text: `Hello ${applicant.name},\n\n${statusMessages[status]} for the position: ${job.title} at ${job.company}\n\nPlease log in to your dashboard for more details.\n\nBest regards,\nThe JobMatchHub Team`,
    
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Status update email sent to:", applicant.email);
  } catch (error) {
    console.error("Error sending status update email:", error);
  }
};

const resetPasswordEmail = async (user, url) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@jobmatchhub.com",
    to: user.email,
    subject: "Reset your password",
    text: `Hello ${user.name},\n\n  Use this link to reset your password:\n\n${url}\n\nBest regards,\nThe JobMatchHub Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reset password email sent to:", user.email);
  } catch (error) {
    console.error("Error sending reset password email:", error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendApplicationNotification,
  sendApplicationStatusUpdate,
  resetPasswordEmail,
};
