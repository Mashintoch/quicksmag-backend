import express from "express";

import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import roleRoutes from "./roleRoutes";
import settingsRoutes from "./settingRoutes";
import waitlistRoutes from "./waitlistRoute";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "WELCOME TO QUICKSMAG API!!!",
  });
});

router.get("/health", (req, res) => {
  res.status(200).json({
    message: "GOOD HEALTH!",
  });
});

/** ------------------------- MAIN ROUTES BEGINS HERE  ------------------------------ */

router.use("/auth", authRoutes);
router.use("/settings", settingsRoutes);
router.use("/role", roleRoutes);
router.use("/user", userRoutes);
router.use("/waitlist", waitlistRoutes);

/** ------------------------- MAIN ROUTES ENDS HERE  ------------------------------ */

export default router;
