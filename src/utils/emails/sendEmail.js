/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import sgMail from "@sendgrid/mail";
import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";
import HttpError from "../../helpers/httpError";

dotenv.config();

class EmailService {
  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      console.error("SENDGRID_API_KEY is not set in environment variables");
    } else {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async sendEmail({ to, subject, text, html }) {
    try {
      if (!to || !subject || (!text && !html)) {
        throw new HttpError(
          "Email, subject, and content are required",
          StatusCodes.BAD_REQUEST
        );
      }

      if (!process.env.SENDGRID_VERIFIED_SENDER) {
        throw new HttpError(
          "SENDGRID_VERIFIED_SENDER is not set in environment variables",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      const msg = {
        to,
        from: process.env.SENDGRID_VERIFIED_SENDER,
        subject,
        text,
        html,
      };

      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      console.error("Email sending error:", error);

      if (error.response) {
        const { message, code, response } = error;
        const { headers, body } = response;
        console.error(body);
        throw new HttpError(
          `Failed to send email: ${message || "Unknown error"}`,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      throw error;
    }
  }

  async sendVerificationEmail(email, code) {
    const subject = "Verify Your Email Address";
    const text = `
      Welcome to QuickSmag!
      
      Please use the following code to verify your email address: ${code}
      
      This code will expire in 15 minutes.
      
      If you did not request this verification, please ignore this email.
    `;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Welcome to QuickSmag!</h2>
        <p>Please use the following code to verify your email address:</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; text-align: center; border-radius: 5px;">
          <strong style="font-size: 24px; color: #333;">${code}</strong>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p style="color: #777; font-size: 14px;">If you did not request this verification, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, text, html });
  }

  async sendPasswordResetEmail(email, code) {
    const subject = "Password Reset Request";
    const text = `
      You have requested to reset your password.
      
      Please use the following code to reset your password: ${code}
      
      This code will expire in 15 minutes.
      
      If you did not request this password reset, please ignore this email and ensure your account is secure.
    `;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You have requested to reset your password. Please use the following code:</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; text-align: center; border-radius: 5px;">
          <strong style="font-size: 24px; color: #333;">${code}</strong>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p style="color: #777; font-size: 14px;">If you did not request this password reset, please ignore this email and ensure your account is secure.</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, text, html });
  }

  async sendWelcomeEmail(email, firstName) {
    const subject = "Welcome to QuickSmag!";
    const text = `
      Hello ${firstName},
      
      Thank you for joining our platform! We're excited to have you as a member.
      
      Your account has been successfully created and activated.
      
      If you have any questions or need assistance, please don't hesitate to contact our support team.
      
      Best regards,
      The Team
    `;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Welcome to Our QuickSmag!</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for joining our QuickSmag! We're excited to have you as a member.</p>
        <p>Your account has been successfully created and activated.</p>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, text, html });
  }
}

export default new EmailService();
