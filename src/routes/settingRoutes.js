import express from "express";

import { Auth } from "../middlewares/auth";
import SettingsController from "../controllers/settingControllers";
import SchemaValidator from "../middlewares/schemaValidator";

const router = express.Router();

router.post(
  "/send-verification-code/:userId",
  SettingsController.noAuthSendVerificationCode
);

router.use(Auth());

router.get("/user-profile", SettingsController.getProfile);

router.post(
  "/update-profile",
  SchemaValidator(true, "/settings/update-profile"),
  SettingsController.updateProfile
);

router.post(
  "/change-password",
  SchemaValidator(true, "/settings/change-password"),
  SettingsController.changePassword
);

router.post("/send-verification-code", SettingsController.sendVerificationCode);

router.post("/toggle-2fa/:code", SettingsController.toggle2FA);

export default router;
