import response from "../helpers/responseHelper";
import SettingsServices from "../services/settingServices";
import getUserId from "../helpers/getUserId";

const getProfile = async (req, res) => {
  try {
    const userId = getUserId(req);
    const profile = await SettingsServices.getProfile(userId);

    return response(res, 200, "Profile retrieved!", profile);
  } catch (err) {
    return response(res, 500, err?.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = getUserId(req);
    await SettingsServices.updateProfile(userId, req.body);

    return response(res, 200, "Profile updated!");
  } catch (err) {
    return response(res, 500, err?.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = getUserId(req);
    await SettingsServices.changePassword(req.body, userId);

    return response(res, 200, "Password changed!");
  } catch (err) {
    return response(res, 500, err?.message);
  }
};

const sendVerificationCode = async (req, res) => {
  try {
    const userId = getUserId(req);
    await SettingsServices.sendVerificationCode(userId);
    return response(res, 200, "Verification code sent!");
  } catch (err) {
    return response(res, 500, err?.message);
  }
};

const noAuthSendVerificationCode = async (req, res) => {
  try {
    const { userId } = req.params;
    await SettingsServices.sendVerificationCode(userId);
    return response(res, 200, "Verification code sent!");
  } catch (err) {
    return response(res, 500, err?.message);
  }
};

const toggle2FA = async (req, res) => {
  try {
    const userId = getUserId(req);
    const toggled = await SettingsServices.toggle2FA(userId, req.params.code);
    const status = toggled ? "activated" : "deactivated";
    return response(
      res,
      200,
      `Two-factor Authentication has been ${status}`,
      status
    );
  } catch (err) {
    return response(res, 500, err?.message);
  }
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  sendVerificationCode,
  noAuthSendVerificationCode,
  toggle2FA,
};
