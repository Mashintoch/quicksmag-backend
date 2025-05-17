import express from "express";
import UserController from "../controllers/userController";
import { Auth } from "../middlewares/auth";
import SchemaValidator from "../middlewares/schemaValidator";
import Paginate from "../middlewares/paginate";
import fileUpload from "../middlewares/fileUpload";

const router = express.Router();

router.use(Auth());

router.get("/profile", UserController.getProfile);
router.get(
  "/profile/:username/posts",
  Paginate(),
  UserController.getUserPostsByUsername
);
router.get("/profile/:username", UserController.getProfileByUsername);

router.post(
  "/follow",
  SchemaValidator(true, "/user/follow"),
  UserController.followUser
);
router.post(
  "/unfollow",
  SchemaValidator(true, "/user/unfollow"),
  UserController.unfollowUser
);

router.get("/followers", Paginate(), UserController.getUserFollowers);
router.get("/following", Paginate(), UserController.getUserFollowing);

router.get("/search", Paginate(), UserController.searchUsers);
router.get("/suggested", Paginate(), UserController.getSuggestedUsers);

// user settings

router.put(
  "/profile/update",
  fileUpload.single("profilePicture"),
  UserController.updateUserProfile
);
router.put(
  "/password/reset",
  SchemaValidator(true, "/user/password/reset"),
  UserController.resetPassword
);

router.put(
  "/security/2fa",
  SchemaValidator(true, "/user/security/2fa"),
  UserController.toggle2FA
);

router.post(
  "/help/request",
  SchemaValidator(true, "/user/help/request"),
  UserController.submitHelpRequest
);

router.get("/help/requests", Paginate(), UserController.getUserHelpRequests);

router.post(
  "/support/chat",
  SchemaValidator(true, "/user/support/chat"),
  UserController.initializeSupportChat
);

router.delete("/delete", UserController.deleteUserAccount);


export default router;
