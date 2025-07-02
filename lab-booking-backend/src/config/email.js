import nodemailer from 'nodemailer';
import { logger } from './logger.js';

// Email configuration
export const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

// Create reusable transporter
let transporter = null;

export const createEmailTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransporter(emailConfig);
    
    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        logger.error('Email transporter verification failed:', error);
      } else {
        logger.info('Email transporter is ready to send messages');
      }
    });
  }
  
  return transporter;
};

// Email templates
export const emailTemplates = {
  // Welcome email for new users
  welcome: {
    subject: 'Welcome to Lab Booking System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to Lab Booking System!</h1>
          <p style="color: #64748b; font-size: 16px;">Your account has been successfully created</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0;">Hello {{firstName}}!</h2>
          <p style="margin: 0; font-size: 18px;">You can now access all laboratory booking features</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1e293b; margin-top: 0;">Your Account Details:</h3>
          <ul style="color: #475569; line-height: 1.6;">
            <li><strong>Email:</strong> {{email}}</li>
            <li><strong>Role:</strong> {{role}}</li>
            <li><strong>Department:</strong> {{department}}</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="{{loginUrl}}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Login to Your Account</a>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `,
  },

  // Email verification
  emailVerification: {
    subject: 'Verify Your Email - Lab Booking System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb;">Email Verification Required</h1>
        </div>
        
        <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin-bottom: 25px;">
          <p style="margin: 0; color: #1e40af;">
            <strong>Hello {{firstName}},</strong><br>
            Please verify your email address to complete your account setup.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{verificationUrl}}" style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify Email Address</a>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>Important:</strong> This verification link will expire in 24 hours.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    `,
  },

  // Password reset
  passwordReset: {
    subject: 'Reset Your Password - Lab Booking System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626;">Password Reset Request</h1>
        </div>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin-bottom: 25px;">
          <p style="margin: 0; color: #991b1b;">
            <strong>Hello {{firstName}},</strong><br>
            We received a request to reset your password for your Lab Booking System account.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetUrl}}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>Security Notice:</strong> This reset link will expire in 10 minutes for your security.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
      </div>
    `,
  },

  // Booking confirmation
  bookingConfirmation: {
    subject: 'Booking Confirmation - {{laboratoryName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #16a34a;">Booking Confirmed!</h1>
        </div>
        
        <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin-bottom: 25px;">
          <p style="margin: 0; color: #15803d;">
            <strong>Hello {{firstName}},</strong><br>
            Your laboratory booking has been confirmed.
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1e293b; margin-top: 0;">Booking Details:</h3>
          <table style="width: 100%; color: #475569;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Laboratory:</td>
              <td style="padding: 8px 0;">{{laboratoryName}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Location:</td>
              <td style="padding: 8px 0;">{{location}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Date & Time:</td>
              <td style="padding: 8px 0;">{{startTime}} - {{endTime}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Booking ID:</td>
              <td style="padding: 8px 0;">{{bookingId}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Purpose:</td>
              <td style="padding: 8px 0;">{{purpose}}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{bookingUrl}}" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Booking Details</a>
        </div>
        
        <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>Reminder:</strong> Please arrive on time and bring any required materials.
          </p>
        </div>
      </div>
    `,
  },

  // Booking reminder
  bookingReminder: {
    subject: 'Booking Reminder - {{laboratoryName}} ({{timeUntil}})',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f59e0b;">Booking Reminder</h1>
        </div>
        
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 25px;">
          <p style="margin: 0; color: #92400e;">
            <strong>Hello {{firstName}},</strong><br>
            Your laboratory booking is coming up {{timeUntil}}.
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1e293b; margin-top: 0;">Booking Details:</h3>
          <table style="width: 100%; color: #475569;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Laboratory:</td>
              <td style="padding: 8px 0;">{{laboratoryName}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Location:</td>
              <td style="padding: 8px 0;">{{location}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Start Time:</td>
              <td style="padding: 8px 0;">{{startTime}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Duration:</td>
              <td style="padding: 8px 0;">{{duration}}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{bookingUrl}}" style="background: #f59e0b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Booking</a>
        </div>
      </div>
    `,
  },

  // Generic notification
  notification: {
    subject: '{{title}} - Lab Booking System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb;">{{title}}</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <p style="margin: 0; color: #475569; line-height: 1.6;">
            <strong>Hello {{firstName}},</strong><br><br>
            {{message}}
          </p>
        </div>
        
        {{#if actionUrl}}
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{actionUrl}}" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">{{actionText}}</a>
        </div>
        {{/if}}
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This is an automated message from Lab Booking System.
          </p>
        </div>
      </div>
    `,
  },
};

// Template rendering function
export const renderEmailTemplate = (templateName, data) => {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }

  let { subject, html } = template;

  // Simple template replacement
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, data[key] || '');
    html = html.replace(regex, data[key] || '');
  });

  // Handle conditional blocks
  html = html.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
    return data[condition] ? content : '';
  });

  return { subject, html };
};

// Send email function
export const sendEmail = async (options) => {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: `"Lab Booking System" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response,
    };

  } catch (error) {
    logger.error(`Failed to send email to ${options.to}:`, error);
    throw error;
  }
};

// Send templated email
export const sendTemplatedEmail = async (templateName, to, data) => {
  try {
    const { subject, html } = renderEmailTemplate(templateName, data);
    
    return await sendEmail({
      to,
      subject,
      html,
    });

  } catch (error) {
    logger.error(`Failed to send templated email '${templateName}' to ${to}:`, error);
    throw error;
  }
};

// Bulk email sending
export const sendBulkEmails = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({ ...result, to: email.to, success: true });
    } catch (error) {
      logger.error(`Bulk email failed for ${email.to}:`, error);
      results.push({ 
        to: email.to, 
        success: false, 
        error: error.message 
      });
    }
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  logger.info(`Bulk email completed: ${successful} successful, ${failed} failed`);
  
  return {
    total: emails.length,
    successful,
    failed,
    results,
  };
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Test email connection
export const testEmailConnection = async () => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    return { success: true, message: 'Email connection successful' };
  } catch (error) {
    logger.error('Email connection test failed:', error);
    return { success: false, error: error.message };
  }
};
