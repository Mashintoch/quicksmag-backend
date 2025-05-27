/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import User from "../models/user";
import Role from "../models/role";
import RefreshToken from "../models/refreshToken";
import tokenService from "./tokenService";
import emailService from "../utils/emails/sendEmail";
import referralService from "./referralServices";
import HttpError from "../helpers/httpError";
import config from "../configs/env";
import getClientInfo from "../helpers/getUserLoginHistory";

class AuthService {
  async register(userData, referralCode) {
    try {
      const existingEmail = await User.findOne({ email: userData.email });
      if (existingEmail) {
        throw new HttpError(
          "Email is already registered",
          StatusCodes.CONFLICT
        );
      }

      const existingUsername = await User.findOne({
        username: userData.username,
      });
      if (existingUsername) {
        throw new HttpError("Username is already taken", StatusCodes.CONFLICT);
      }

      const subscriberRole = await Role.findOne({ name: "subscribers" });
      if (!subscriberRole) {
        throw new HttpError(
          "Subscriber role not found",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      const user = new User({
        ...userData,
        role: subscriberRole._id,
        status: "PENDING",
      });

      await user.save();

      const verificationCode = await tokenService.generateToken(
        user._id,
        "verification"
      );

      await emailService.sendVerificationEmail(user.email, verificationCode);

      if (referralCode) {
        await referralService.processReferral(referralCode, user._id);
      }

      if (!config.auth.jwtSecret) {
        throw new HttpError(
          "JWT Secret not configured",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      const accessToken = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          accountType: user.accountType,
        },
        config.auth.jwtSecret,
        { expiresIn: "2h" }
      );

      const refreshToken = jwt.sign(
        {
          id: user._id.toString(),
          type: "refresh",
        },
        config.auth.jwtSecret,
        { expiresIn: "30d" }
      );

      await new RefreshToken({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }).save();

      const userResponse = this.sanitizeUser(user);

      return { user: userResponse, accessToken, refreshToken };
    } catch (error) {
      if (error instanceof HttpError) throw error;
      console.error("Registration error:", error);
      throw new HttpError(
        "Failed to register user. Please try again later.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async login(email, phone, password, request) {
    try {
      const user = await User.findOne({
        $or: [{ email }, { phoneNumber: phone }],
      });

      if (!user) {
        throw new HttpError(
          "Invalid credentials. Please check your email and password.",
          StatusCodes.UNAUTHORIZED
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new HttpError(
          "Invalid credentials. Please check your email and password.",
          StatusCodes.UNAUTHORIZED
        );
      }

      if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
        throw new HttpError(
          `Your account has been ${user.status.toLowerCase()}. Please contact support.`,
          StatusCodes.FORBIDDEN
        );
      }

      if (!config.auth.jwtSecret) {
        throw new HttpError(
          "JWT Secret not configured",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      const { ip, userAgent } = getClientInfo(request);

      user.loginHistory.push({
        ip,
        userAgent,
        loginTime: new Date(),
      });

      const accessToken = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          accountType: user.accountType,
        },
        config.auth.jwtSecret,
        { expiresIn: "2h" }
      );

      const refreshToken = jwt.sign(
        {
          id: user._id.toString(),
          type: "refresh",
        },
        config.auth.jwtSecret,
        { expiresIn: "30d" }
      );

      await new RefreshToken({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }).save();

      const userResponse = this.sanitizeUser(user);

      return {
        user: userResponse,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof HttpError) throw error;
      console.error("Login error:", error);
      throw new HttpError(
        "Failed to login. Please try again later.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new HttpError(
          "Refresh token is required",
          StatusCodes.BAD_REQUEST
        );
      }

      let decoded;
      try {
        decoded = jwt.verify(refreshToken, config.auth.jwtSecret);
      } catch (err) {
        throw new HttpError(
          "Invalid or expired refresh token",
          StatusCodes.UNAUTHORIZED
        );
      }

      const storedToken = await RefreshToken.findOne({
        token: refreshToken,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });

      if (!storedToken) {
        throw new HttpError(
          "Invalid or expired refresh token",
          StatusCodes.UNAUTHORIZED
        );
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        throw new HttpError("User not found", StatusCodes.NOT_FOUND);
      }

      if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
        throw new HttpError(
          `Your account has been ${user.status.toLowerCase()}. Please contact support.`,
          StatusCodes.FORBIDDEN
        );
      }

      const accessToken = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          accountType: user.accountType,
        },
        config.auth.jwtSecret,
        { expiresIn: "2h" }
      );

      return { accessToken };
    } catch (error) {
      if (error instanceof HttpError) throw error;
      console.error("Token refresh error:", error);
      throw new HttpError(
        "Failed to refresh token. Please login again.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async logout(userId, refreshToken) {
    try {
      if (refreshToken) {
        await RefreshToken.updateOne(
          { userId, token: refreshToken },
          { isRevoked: true }
        );
      } else {
        await RefreshToken.updateMany({ userId }, { isRevoked: true });
      }

      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout error:", error);
      throw new HttpError(
        "Failed to logout. Please try again.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyEmail(email, code) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new HttpError("User not found", StatusCodes.NOT_FOUND);
      }

      const isValid = await tokenService.verifyToken(
        user._id,
        code,
        "verification"
      );

      if (!isValid) {
        throw new HttpError(
          "Invalid or expired verification code",
          StatusCodes.BAD_REQUEST
        );
      }

      user.status = "ACTIVE";
      user.isVerified = true;
      await user.save();

      await tokenService.deleteUserTokens(user._id, "verification");

      await emailService.sendWelcomeEmail(user.email, user.firstname);

      const token = jwt.sign(
        { id: user.id, email: user.email, accountType: user.accountType },
        config.auth.jwtSecret,
        { expiresIn: "1d" }
      );

      const userResponse = this.sanitizeUser(user);

      return { user: userResponse, token };
    } catch (error) {
      if (error instanceof HttpError) throw error;
      console.error("Email verification error:", error);
      throw new HttpError(
        "Failed to verify email. Please try again later.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return {
          success: true,
          message: "If the email exists, a password reset code has been sent",
        };
      }

      const resetCode = await tokenService.generateToken(
        user._id,
        "password-reset"
      );

      await emailService.sendPasswordResetEmail(user.email, resetCode);

      return {
        success: true,
        message: "Password reset code has been sent to your email",
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      throw new HttpError(
        "Failed to process forgot password request. Please try again later.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async resetPassword(email, code, newPassword) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new HttpError("User not found", StatusCodes.NOT_FOUND);
      }

      const isValid = await tokenService.verifyToken(
        user._id,
        code,
        "password-reset"
      );

      if (!isValid) {
        throw new HttpError(
          "Invalid or expired reset code",
          StatusCodes.BAD_REQUEST
        );
      }

      user.password = newPassword;
      await user.save();

      await tokenService.deleteUserTokens(user._id, "password-reset");

      return { success: true, message: "Password has been reset successfully" };
    } catch (error) {
      if (error instanceof HttpError) throw error;
      console.error("Password reset error:", error);
      throw new HttpError(
        "Failed to reset password. Please try again later.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  generateToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      accountType: user.accountType,
      isVerified: user.isVerified,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION || "1d",
    });
  }

  sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : user;

    delete userObj.password;

    return userObj;
  }
}

export default new AuthService();
