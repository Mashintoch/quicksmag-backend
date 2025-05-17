/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
import express from "express";
import authController from "../controllers/auth";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/verify/email", authController.sendEmailVerification);

router.post("/verify", authController.verifyEmail);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);

router.post("/refresh-token", authController.refreshToken);

router.post("/logout", authenticate, authController.logout);

export default router;
