/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-extraneous-dependencies */

import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user";
import Referral from "../models/referral";
import HttpError from "../helpers/httpError";

class ReferralService {
  async generateReferralCode(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new HttpError("User not found", StatusCodes.NOT_FOUND);
      }

      if (user.referralCode) {
        return {
          referralCode: user.referralCode,
          referralLink: user.referralLink,
        };
      }

      const baseCode = user.username.substring(0, 5).toUpperCase();
      const uniquePart = uuidv4().substring(0, 6).toUpperCase();
      const referralCode = `${baseCode}${uniquePart}`;

      const baseUrl = process.env.FRONTEND_URL || "https://pozse.com";
      const referralLink = `${baseUrl}/register?ref=${referralCode}`;

      user.referralCode = referralCode;
      user.referralLink = referralLink;
      await user.save();

      return { referralCode, referralLink };
    } catch (error) {
      if (error instanceof HttpError) throw error;
      console.error("Generate referral code error:", error);
      throw new HttpError(
        "Failed to generate referral code",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async processReferral(referralCode, newUserId) {
    try {
      const referrer = await User.findOne({ referralCode });

      if (!referrer) {
        throw new HttpError("Invalid referral code", StatusCodes.BAD_REQUEST);
      }

      const existingReferral = await Referral.findOne({
        referee: newUserId,
      });

      if (existingReferral) {
        throw new HttpError(
          "User already has a referrer",
          StatusCodes.CONFLICT
        );
      }

      const referral = new Referral({
        referrer: referrer._id,
        referee: newUserId,
        referralCode,
        status: "PENDING",
      });

      await referral.save();

      referrer.referralCount = (referrer.referralCount || 0) + 1;
      await referrer.save();

      return { success: true };
    } catch (error) {
      if (error instanceof HttpError) throw error;
      console.error("Process referral error:", error);
      throw new HttpError(
        "Failed to process referral",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async completeReferral(refereeId, rewardAmount = 25) {
    try {
      const referral = await Referral.findOne({
        referee: refereeId,
        status: "PENDING",
      });

      if (!referral) {
        return { success: false, message: "No pending referral found" };
      }

      referral.status = "COMPLETED";
      referral.completedAt = new Date();
      referral.rewardAmount = rewardAmount;
      await referral.save();

      const referrer = await User.findById(referral.referrer);
      if (referrer) {
        referrer.totalReferralRewards =
          (referrer.totalReferralRewards || 0) + rewardAmount;
        await referrer.save();
      }

      return { success: true };
    } catch (error) {
      console.error("Complete referral error:", error);
      throw new HttpError(
        "Failed to complete referral",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUserReferrals(userId) {
    try {
      const referrals = await Referral.find({ referrer: userId })
        .populate("referee", "firstname lastname username email")
        .sort({ createdAt: -1 });

      return referrals;
    } catch (error) {
      console.error("Get user referrals error:", error);
      throw new HttpError(
        "Failed to get user referrals",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default new ReferralService();
