/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import { StatusCodes } from "http-status-codes";
import authService from "../services/authService";
import getUserId from "../helpers/getUserId";

class AuthController {
  async register(req, res, next) {
    try {
      const { referralCode } = req.query;
      const result = await authService.register(req.body, referralCode);
      return res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, phoneNumber, password } = req.body;
      const result = await authService.login(email, phoneNumber, password);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshAccessToken(refreshToken);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const result = await authService.resetPassword(token, password);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;
      const result = await authService.verifyEmail(token);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async sendEmailVerification(req, res, next) {
    try {
      const userId = getUserId(req);
      const result = await authService.sendEmailVerification(userId);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const userId = getUserId(req);
      const { refreshToken } = req.body;
      const result = await authService.logout(userId, refreshToken);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
