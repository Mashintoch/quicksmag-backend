/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import Token from "../models/token";
import generateDigitCode from "../helpers/generateDigitCode";
import HttpError from "../helpers/httpError";

class TokenService {
  async generateToken(userId, type) {
    try {
      await Token.deleteMany({ userId, type });

      const plainCode = generateDigitCode(6);

      const bcryptSalt = Number(process.env.BCRYPT_SALT || 10);
      const salt = await bcrypt.genSalt(bcryptSalt);
      const hashedCode = await bcrypt.hash(plainCode, salt);

      const token = new Token({
        userId,
        token: hashedCode,
        type,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      });

      await token.save();

      return plainCode;
    } catch (error) {
      console.error(`Error generating ${type} token:`, error);
      throw new HttpError(
        `Failed to generate ${type} token`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyToken(userId, code, type) {
    try {
      const tokens = await Token.find({
        userId,
        type,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!tokens || tokens.length === 0) {
        throw new HttpError(
          "Invalid or expired code. Please request a new one.",
          StatusCodes.BAD_REQUEST
        );
      }

      for (const token of tokens) {
        const isMatch = await bcrypt.compare(code, token.token);
        if (isMatch) {
          token.isUsed = true;
          await token.save();
          return true;
        }
      }

      throw new HttpError(
        "Invalid code. Please try again.",
        StatusCodes.BAD_REQUEST
      );
    } catch (error) {
      if (error instanceof HttpError) throw error;
      console.error(`Error verifying ${type} token:`, error);
      throw new HttpError(
        "Failed to verify code",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteUserTokens(userId, type) {
    try {
      await Token.deleteMany({ userId, type });
      return true;
    } catch (error) {
      console.error(`Error deleting ${type} tokens:`, error);
      throw new HttpError(
        "Failed to delete tokens",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default new TokenService();
