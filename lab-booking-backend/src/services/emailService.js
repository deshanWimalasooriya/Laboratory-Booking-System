import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  emailVerification: {
    subject: 'Verify Your Email - Lab Booking System',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Lab Booking System!</h2>
        <p>Hello {{firstName}},</p>
        <p>Thank you for registering with our Laboratory Booking System. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{verificationUrl}}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">{{verificationUrl}}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  },
  passwordReset: {
    subject: 'Password Reset - Lab Booking System',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hello {{firstName}},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetUrl}}" style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">{{resetUrl}}</p>
        <p>This link will expire in 10 minutes.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  },
  bookingApproved: {
    subject: 'Booking Approved - Lab Booking System',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Booking Approved!</h2>
        <p>Hello {{firstName}},</p>
        <p>Great news! Your booking has been approved.</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Booking Details:</h3>
          <p><strong>Laboratory:</strong> {{laboratoryName}}</p>
          <p><strong>Date & Time:</strong> {{startTime}} - {{endTime}}</p>
          <p><strong>Booking ID:</strong> {{bookingId}}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{actionUrl}}" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Booking</a>
        </div>
      </div>
    `,
  },
  bookingRejected: {
    subject: 'Booking Rejected - Lab Booking System',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Booking Rejected</h2>
        <p>Hello {{firstName}},</p>
        <p>Unfortunately, your booking has been rejected.</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Booking Details:</h3>
          <p><strong>Laboratory:</strong> {{laboratoryName}}</p>
          <p><strong>Date & Time:</strong> {{startTime}} - {{endTime}}</p>
          <p><strong>Reason:</strong> {{reason}}</p>
        </div>
        <p>You can submit a new booking request or contact the technical officer for more information.</p>
      </div>
    `,
  },
  notification: {
    subject: '{{title}} - Lab Booking System',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">{{title}}</h2>
        <p>Hello {{firstName}},</p>
        <p>{{message}}</p>
        {{#if actionUrl}}
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{actionUrl}}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Details</a>
        </div>
        {{/if}}
      </div>
    `,
  },
};

// Template rendering function
const renderTemplate = (template, data) => {
  let rendered = template;
  
  // Simple template replacement
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, data[key] || '');
  });

  // Handle conditional blocks (simplified)
  rendered = rendered.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
    return data[condition] ? content : '';
  });

  return rendered;
};

// Send email function
export const sendEmail = async ({ to, subject, template, data = {} }) => {
  try {
    const transporter = createTransporter();
    
    let emailSubject = subject;
    let emailHtml = '';

    if (template && emailTemplates[template]) {
      emailSubject = renderTemplate(emailTemplates[template].subject, data);
      emailHtml = renderTemplate(emailTemplates[template].template, data);
    } else {
      emailHtml = data.html || data.message || '';
    }

    const mailOptions = {
      from: `"Lab Booking System" <${process.env.SMTP_USER}>`,
      to,
      subject: emailSubject,
      html: emailHtml,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;

  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Send bulk emails
export const sendBulkEmails = async (emails) => {
  try {
    const results = await Promise.allSettled(
      emails.map(email => sendEmail(email))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Bulk email results: ${successful} successful, ${failed} failed`);
    return { successful, failed, results };

  } catch (error) {
    console.error('Bulk email error:', error);
    throw error;
  }
};
