import response from "../helpers/responseHelper";
import getUserId from "../helpers/getUserId";
import userServices from "../services/userServices";

const getProfile = async (req, res) => {
  try {
    const userId = getUserId(req);
    const profile = await userServices.getProfile(userId);

    return response(res, 200, "Profile retrieved!", profile);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const getProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await userServices.getProfileByUsername(username);

    return response(res, 200, "Profile retrieved!", profile);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const getUserPostsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const { type } = req.query;
    const posts = await userServices.getUserPostsByUsername(
      username,
      type,
      req.pagination
    );

    return response(res, 200, posts.message, posts);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = getUserId(req);
    const payload = req.body;
    const profilePicture = req.file;

    const user = await userServices.updateUserProfile(
      userId,
      payload,
      profilePicture
    );

    return response(res, 200, "Profile updated!", user);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = getUserId(req);
    await userServices.resetPassword(userId, currentPassword, newPassword);

    return response(res, 200, "Password reset link sent!", null);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const followUser = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { targetUserId } = req.body;

    const result = await userServices.followUser(userId, targetUserId);

    return response(res, 200, "User followed!", result);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const unfollowUser = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { targetUserId } = req.body;

    const result = await userServices.unfollowUser(userId, targetUserId);

    return response(res, 200, "User unfollowed!", result);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const getUserFollowers = async (req, res) => {
  try {
    const userId = getUserId(req);
    const followers = await userServices.getUserFollowers(
      userId,
      req.pagination
    );

    return response(res, 200, "Followers retrieved!", followers);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const getUserFollowing = async (req, res) => {
  try {
    const userId = getUserId(req);
    const following = await userServices.getUserFollowing(
      userId,
      req.pagination
    );

    return response(res, 200, "Following retrieved!", following);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await userServices.searchUsers(query, req.pagination);

    return response(res, 200, "Users retrieved!", users);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    const userId = getUserId(req);
    const users = await userServices.getSuggestedUsers(userId, req.pagination);

    return response(res, 200, "Suggested users retrieved!", users);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const toggle2FA = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { enabled } = req.body;

    await userServices.toggle2FA(userId, enabled);

    return response(res, 200, "2FA toggled!", null);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const submitHelpRequest = async (req, res) => {
  try {
    const userId = getUserId(req);
    const payload = req.body;

    const result = await userServices.submitHelpRequest(userId, payload);

    return response(res, 200, "Help request submitted!", result);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const initializeSupportChat = async (req, res) => {
  try {
    const userId = getUserId(req);
    const payload = req.body;

    const result = await userServices.initializeSupportChat(userId, payload);

    return response(res, 200, "Support chat initialized!", result);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const getUserHelpRequests = async (req, res) => {
  try {
    const userId = getUserId(req);
    const helpRequests = await userServices.getUserHelpRequests(
      userId,
      req.pagination
    );

    return response(res, 200, "Help requests retrieved!", helpRequests);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const userId = getUserId(req);
    await userServices.deleteUserAccount(userId);

    return response(res, 200, "Account deleted!", null);
  } catch (error) {
    if (error.code && typeof error.code === "number") {
      return response(res, error.code, error.message, null);
    }
    return response(res, 500, error.message || "Internal server error", null);
  }
};

export default {
  getProfile,
  getProfileByUsername,
  updateUserProfile,
  resetPassword,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
  getSuggestedUsers,
  toggle2FA,
  submitHelpRequest,
  initializeSupportChat,
  getUserHelpRequests,
  getUserPostsByUsername,
  deleteUserAccount,
};
