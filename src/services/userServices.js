/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
import bcrypt from "bcryptjs";

import User from "../models/user";
import ChatSession from "../models/support";
import HelpRequest from "../models/help";
import EmailService from "../utils/emails/sendEmail";
import { STRONG_PASSWORD } from "../configs/constants";
import SIB_TEMPLATES from "../configs/templates";
import HttpError from "../helpers/http-error";
import { invalidateUserCache } from "../cache";
import paginationResults from "../helpers/paginationResults";

import {
  cloudinaryUploader,
  cloudinaryRemover,
} from "../helpers/cloudinaryUploader";

const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId)
      .populate("followers", "username personalInformation.avatar")
      .populate("following", "username personalInformation.avatar");

    if (!user) {
      throw new HttpError("User not found!", 404);
    }

    const profileData = user.toObject();
    profileData.followersCount = user.followers.length;
    profileData.followingCount = user.following.length;

    return profileData;
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      throw error;
    }
    throw new HttpError(
      error.message || "Failed to fetch profile, Try Again!",
      500
    );
  }
};

const getProfileByUsername = async (username) => {
  try {
    const user = await User.findOne({ username })
      .populate("followers", "username personalInformation.avatar")
      .populate("following", "username personalInformation.avatar");

    if (!user) {
      throw new HttpError("User not found!", 404);
    }

    const profileData = user.toObject();
    profileData.followersCount = user.followers.length;
    profileData.followingCount = user.following.length;

    return profileData;
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      throw error;
    }
    throw new HttpError(
      error.message || "Failed to fetch profile, Try Again!",
      500
    );
  }
};


const updateUserProfile = async (userId, payload, profilePicture = null) => {
  try {
    const user = await User.findById(userId, "-password");
    if (!user) {
      throw new HttpError("User not found!", 404);
    }

    const { personalInformation } = payload;

    if (personalInformation?.emails?.secondEmail) {
      const userSecondEmail = personalInformation.emails.secondEmail;
      const runEmailCheck = await User.findOne({
        $or: [
          { email: userSecondEmail },
          { "personalInformation.emails.secondEmail": userSecondEmail },
        ],
      });

      if (runEmailCheck && runEmailCheck._id.toString() !== userId) {
        return new HttpError(
          `This email: ${userSecondEmail} is already in use.`,
          400
        );
      }
    }

    if (payload.category) {
      const validCategories = [
        "fashion-enthusiast",
        "models",
        "influencers",
        "beauty-pageants",
        "modelling-agency",
        "luxury-brands",
        "fashion-brands",
        "boutique",
      ];

      const categories = Array.isArray(payload.category)
        ? payload.category
        : [payload.category];

      const invalidCategories = categories.filter(
        (cat) => !validCategories.includes(cat)
      );

      if (invalidCategories.length > 0) {
        return new HttpError(
          `Invalid categories: ${invalidCategories.join(", ")}`,
          400
        );
      }

      user.category = categories;
    }

    let profilePictureUrl = null;
    if (profilePicture) {
      try {
        const oldPublicId = user.personalInformation?.avatar?.includes(
          "/profile/"
        )
          ? user.personalInformation.avatar.split("/").pop().split(".")[0]
          : null;

        const uploadResult = await cloudinaryUploader(profilePicture, {
          folder: `profile/avatars`,
          publicId: `user_${userId}_${Date.now()}`,
          maxSize: 10 * 1024 * 1024, // 10MB max
          transformation: [
            { width: 500, height: 500, crop: "fill" },
            { quality: "auto" },
          ],
        });

        profilePictureUrl = uploadResult.secure_url;

        if (
          oldPublicId &&
          !user.personalInformation.avatar.includes("PROFILE_ICONS")
        ) {
          try {
            await cloudinaryRemover(`profile/avatars/${oldPublicId}`);
          } catch (deleteErr) {
            console.error("Error deleting old profile picture:", deleteErr);
          }
        }
      } catch (uploadError) {
        console.error("Profile picture upload failed:", uploadError);
        throw new HttpError(
          "Failed to upload profile picture. Please try again.",
          500
        );
      }
    }

    if (personalInformation) {
      if (!user.personalInformation) {
        user.personalInformation = {};
      }

      ["mobiles", "emails", "socials"].forEach((field) => {
        if (personalInformation[field]) {
          if (!user.personalInformation[field]) {
            user.personalInformation[field] = {};
          }

          user.personalInformation[field] = {
            ...user.personalInformation[field],
            ...personalInformation[field],
          };

          delete personalInformation[field];
        }
      });
      Object.keys(personalInformation).forEach((key) => {
        user.personalInformation[key] = personalInformation[key];
      });
    }

    if (profilePictureUrl) {
      user.personalInformation.avatar = profilePictureUrl;
    }

    Object.keys(payload).forEach((key) => {
      if (key !== "personalInformation" && key !== "category") {
        user[key] = payload[key];
      }
    });

    await user.save();

    await invalidateUserCache(userId);

    await EmailService.sendEmail({
      to: user.email,
      subject: `${user.firstname}, your profile has been updated`,
      text: `Hello ${user.firstname},\n\nYour profile has been successfully updated on Pozse. If you have any questions or need assistance, feel free to reach out.\n\nBest regards,\nThe Pozse Team`,
      html: `<p>Hello ${user.firstname},</p><p>Your profile has been successfully updated on Pozse. If you have any questions or need assistance, feel free to reach out.</p><p>Best regards,<br>The Pozse Team</p>`,
    });

    return user;
  } catch (err) {
    console.error("Profile update error:", err);
    throw new HttpError(
      err.message || "Failed to update profile. Please try again.",
      500
    );
  }
};
/**
 * Reset user password
 * @param {string} userId - User ID
 * @param {Object} payload - Password reset data
 * @returns {Promise<Object>} Success message
 */
const resetPassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new HttpError("User not found!", 404);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return new HttpError(
        "The current password you entered is incorrect!",
        403
      );
    }

    if (!STRONG_PASSWORD.test(newPassword)) {
      return new HttpError(
        "Please choose a strong password for security reasons.",
        400
      );
    }

    user.password = newPassword; // hash before saving it to the db

    await user.save();

    await invalidateUserCache(userId);

    await EmailService.sendEmail({
      to: user.email,
      subject: `${user.firstname}, your password has been updated`,
      text: `Hello ${user.firstname},\n\nYour password has been successfully updated on Pozse. If you have any questions or need assistance, feel free to reach out.\n\nBest regards,\nThe Pozse Team`,
      html: `<p>Hello ${user.firstname},</p><p>Your password has been successfully updated on Pozse. If you have any questions or need assistance, feel free to reach out.</p><p>Best regards,<br>The Pozse Team</p>`,
    });

    return {
      message: "Password reset successful!",
    };
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      throw error;
    }
    throw new HttpError(
      error.message || "Failed to create Post, Try Again!",
      500
    );
  }
};


/**
 * Search for users by username, firstname, or lastname
 * @param {string} query - Search query
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Paginated search results
 */
const searchUsers = async (query, pagination) => {
  try {
    const searchRegex = new RegExp(query, "i");

    const users = await User.paginate(
      {
        $or: [
          { username: searchRegex },
          { firstname: searchRegex },
          { lastname: searchRegex },
        ],
        status: "ACTIVE",
      },
      {
        ...pagination,
        select:
          "username firstname lastname personalInformation.avatar accountType followers following category",
        customLabels: {
          docs: "users",
          totalDocs: "totalUsers",
        },
      }
    );

    return users;
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      throw error;
    }
    throw new HttpError(
      error.message || "Failed to create Post, Try Again!",
      500
    );
  }
};

/**
 * Get suggested users based on categories and popularity
 * @param {string} userId - Current user ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Paginated suggested users
 */
const getSuggestedUsers = async (userId, pagination) => {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new HttpError("User not found", 404);
    }

    const alreadyFollowing = [
      ...currentUser.following.map((id) => id.toString()),
      userId,
    ];

    const userCategories = currentUser.category || [];

    const query = {
      _id: { $nin: alreadyFollowing },
      status: "ACTIVE",
    };

    const aggregation = [
      { $match: query },
      {
        $addFields: {
          followerCount: { $size: "$followers" },
          relevanceScore: {
            $add: [
              1,
              {
                $cond: {
                  if: { $isArray: "$category" },
                  then: {
                    $size: {
                      $filter: {
                        input: "$category",
                        as: "cat",
                        cond: { $in: ["$$cat", userCategories] },
                      },
                    },
                  },
                  else: 0,
                },
              },
              {
                $min: [{ $divide: [{ $size: "$followers" }, 100] }, 5],
              },
            ],
          },
        },
      },
      { $sort: { relevanceScore: -1, followerCount: -1 } },
      { $skip: (pagination.page - 1) * pagination.limit },
      { $limit: pagination.limit },
      {
        $project: {
          username: 1,
          firstname: 1,
          lastname: 1,
          "personalInformation.avatar": 1,
          accountType: 1,
          category: 1,
          followers: { $size: "$followers" },
          following: { $size: "$following" },
        },
      },
    ];

    const [suggestedUsers, totalCount] = await Promise.all([
      User.aggregate(aggregation),
      User.countDocuments(query),
    ]);

    return {
      users: suggestedUsers,
      totalUsers: totalCount,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalCount / pagination.limit),
    };
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      throw error;
    }
    throw new HttpError(
      error.message || "Failed to create Post, Try Again!",
      500
    );
  }
};


const toggle2FA = async (userId, enabled) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    user.is2FA = enabled;
    await user.save();

    const action = enabled ? "enabled" : "disabled";

    await invalidateUserCache(userId);

    await EmailService.sendEmail({
      to: user.email,
      subject: `${user.firstname}, two-factor authentication has been ${action}`,
      text: `Hello ${user.firstname},\n\nTwo-factor authentication has been ${action} on Pozse. If you have any questions or need assistance, feel free to reach out.\n\nBest regards,\nThe Pozse Team`,
      html: `<p>Hello ${user.firstname},</p><p>Two-factor authentication has been ${action} on Pozse. If you have any questions or need assistance, feel free to reach out.</p><p>Best regards,<br>The Pozse Team</p>`,
    });

    return {
      message: `Two-factor authentication has been ${action}`,
      is2FAEnabled: user.is2FA,
    };
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      throw error;
    }
    throw new HttpError(
      error.message || "Failed to create Post, Try Again!",
      500
    );
  }
};

const submitHelpRequest = async (userId, payload) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    const { firstname, lastname, email, subject, message, category } = payload;

    if (email !== user.email) {
      throw new HttpError(
        "Invalid user Email, Please User your default Credientals.",
        400
      );
    }

    if (!subject || !message) {
      throw new HttpError("Subject and message are required", 400);
    }
    const helpRequest = await HelpRequest.create({
      userId,
      subject,
      firstname,
      lastname,
      email,
      message,
      category: category || "general",
      status: "pending",
      createdAt: new Date(),
    });

    await EmailService.sendEmail({
      to: user.email,
      subject: `Help Request Received - ${subject}`,
      text: `Hello ${firstname},\n\nWe have received your help request with the subject "${subject}". Our support team will get back to you shortly.\n\nBest regards,\nThe Pozse Team`,
      html: `<p>Hello ${firstname},</p><p>We have received your help request with the subject "${subject}". Our support team will get back to you shortly.</p><p>Best regards,<br>The Pozse Team</p>`,
    });
    return {
      message: "Help request submitted successfully",
      requestId: helpRequest._id,
      status: helpRequest.status,
    };
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      throw error;
    }
    throw new HttpError(
      error.message || "Failed to submit help request. Try again.",
      500
    );
  }
};

const initializeSupportChat = async (userId, payload = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    const activeAgentsCount = await User.countDocuments({
      status: "active",
      accountType: { $in: ["support", "admin"] },
      lastActivity: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
    });

    const activeSessionsCount = await ChatSession.countDocuments({
      status: "waiting",
      startedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    });

    const estimatedMinutes =
      activeAgentsCount > 0
        ? Math.ceil(activeSessionsCount / activeAgentsCount) * 5
        : 15;

    const metadata = {
      browser: payload.browser || "unknown",
      device: payload.device || "unknown",
      platform: payload.platform || "unknown",
      ipAddress: payload.ipAddress || "unknown",
      location: payload.location || "unknown",
    };

    const avatar = user.personalInformation?.avatar || null;

    const chatSession = await ChatSession.create({
      userId,
      status: "waiting",
      startedAt: new Date(),
      userInfo: {
        username: user.username,
        email: user.email,
        accountType: user.accountType,
        avatar,
      },
      issue: {
        category: payload.category || "general",
        summary: payload.summary || "",
      },
      metadata,
      messages: [
        {
          sender: "system",
          content:
            "Chat session initialized. A support agent will join shortly.",
          seen: true,
        },
      ],
    });

    if (global.io) {
      global.io.to("support-agents").emit("new-support-request", {
        sessionId: chatSession._id,
        username: user.username,
        category: chatSession.issue.category,
        time: chatSession.startedAt,
      });
    }

    console.log(
      `Support chat initiated - User: ${user.username}, ID: ${userId}, Category: ${chatSession.issue.category}`
    );

    return {
      sessionId: chatSession._id,
      status: chatSession.status,
      estimatedWaitTime: `${estimatedMinutes} minutes`,
      category: chatSession.issue.category,
      message: "Support chat initialized. Please wait for an agent to join.",
      positionInQueue: activeSessionsCount,
    };
  } catch (error) {
    console.error("Chat initialization error:", error);
    if (error.code && typeof error.code === "number") {
      throw error;
    }
    throw new HttpError(
      error.message || "Failed to initialize support chat. Try again.",
      500
    );
  }
};

const getUserHelpRequests = async (userId, pagination) => {
  try {
    const requests = await HelpRequest.paginate(
      { userId },
      {
        ...pagination,
        sort: { createdAt: -1 },
        customLabels: {
          docs: "requests",
          totalDocs: "totalRequests",
        },
      }
    );

    return requests;
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      throw error;
    }
    throw new HttpError(
      error.message || "Failed to fetch help request history. Try again.",
      500
    );
  }
};

const deleteUserAccount = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    if (
      user.personalInformation?.avatar &&
      !user.personalInformation.avatar.includes("PROFILE_ICONS")
    ) {
      const publicId = user.personalInformation.avatar
        .split("/")
        .pop()
        .split(".")[0];
      try {
        await cloudinaryRemover(`profile/avatars/${publicId}`);
      } catch (error) {
        console.error("Error deleting profile picture:", error);
      }
    }

    await Promise.all([
      User.updateMany(
        { $or: [{ followers: userId }, { following: userId }] },
        {
          $pull: {
            followers: userId,
            following: userId,
          },
        }
      ),
      ChatSession.deleteMany({ userId }),
      HelpRequest.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    await invalidateUserCache(userId);

    await EmailService.sendEmail({
      to: user.email,
      subject: "Account Deletion Confirmation",
      templateId: SIB_TEMPLATES.ACCOUNT_DELETED,
      params: {
        firstname: user.firstname,
      },
    });

    return {
      message: "Account and all associated data successfully deleted",
      status: "success",
    };
  } catch (error) {
    console.error("Account deletion error:", error);
    if (error.code && typeof error.code === "number") {
      throw error;
    }
    throw new HttpError(
      error.message || "Failed to delete account. Please try again.",
      500
    );
  }
};

export default {
  getProfile,
  getProfileByUsername,
  updateUserProfile,
  resetPassword,
  searchUsers,
  getSuggestedUsers,
  toggle2FA,
  submitHelpRequest,
  initializeSupportChat,
  getUserHelpRequests,
  deleteUserAccount,
};
