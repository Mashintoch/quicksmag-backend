import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/user";
import { STRONG_PASSWORD } from "../configs/constants";
import EmailService from "../utils/emails/sendEmail";
import Code from "../models/code";


const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select(
      "firstname lastname email phoneNumber personalInformation"
    );
    if (!user) {
      throw new Error("Admin user not found!");
    }
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

const updateProfile = async (userId, payload) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Admin user not found!");
    }
    const { password } = payload;
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) throw new Error("Incorrect password");
    // update the profile
    user.phoneNumber = payload.phoneNumber;
    user.personalInformation = {
      ...user.personalInformation.toObject(),
      gender: payload.gender,
      street: payload.address,
      state: payload.state,
      city: payload.city,
    };

    await user.save();

    await EmailService.sendEmail({
      to: user.email,
      subject: "Profile Updated",
      text: `${user.firstname}, your profile has been updated`,
      html: `<p>${user.firstname}, your profile has been updated</p>`,
    });
  } catch (err) {
    throw new Error(err);
  }
};

const changePassword = async (
  { currentPassword, newPassword, confirmPassword },
  userId
) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found!");
    const isCorrectPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCorrectPassword) throw new Error("Current password is incorrect!");
    if (newPassword !== confirmPassword)
      throw new Error("Passwords do not match!");
    if (!STRONG_PASSWORD.test(newPassword))
      throw new Error("Please choose a strong password!");

    user.password = newPassword;

    await EmailService.sendEmail({
      to: user.email,
      subject: "Password Changed",
      text: `${user.firstname}, your password has been changed`,
      html: `<p>${user.firstname}, your password has been changed</p>`,
    });
    await user.save();
  } catch (err) {
    throw new Error(err);
  }
};

const sendVerificationCode = async (user) => {
  try {
    let currentUser;
    if (typeof user === "string") {
      currentUser = await User.findById(user);
      if (!currentUser) throw new Error("User not found!");
    } else {
      currentUser = user;
    }
    // eslint-disable-next-line no-underscore-dangle
    const code = await Code.findOne({ userId: currentUser._id });

    const newCode = `SR-${Math.floor(100000 + Math.random() * 900000)}`;
    if (code) {
      await code.deleteOne();
    }
    await Code.create({
      // eslint-disable-next-line no-underscore-dangle
      userId: new mongoose.Types.ObjectId(currentUser._id),
      code: newCode,
    });
    await EmailService.sendEmail({
      to: currentUser.email,
      subject: "Verification Code",
      text: `${currentUser.firstname}, your verification code is ${newCode}`,
      html: `<p>${currentUser.firstname}, your verification code is ${newCode}</p>`,
    });
  } catch (err) {
    throw new Error(err);
  }
};

const verifyVerificationCode = async (userId, code) => {
  try {
    const storedCode = await Code.findOne({ userId });
    if (!storedCode) throw new Error("Code expired. Request for a new one!");
    const isCodeValid = await bcrypt.compare(code, storedCode.code);
    if (!isCodeValid) throw new Error("Invalid code. Try again!");
    await storedCode.deleteOne();
    return true;
  } catch (err) {
    throw new Error(err);
  }
};

// eslint-disable-next-line consistent-return
const toggle2FA = async (userId, code) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found!");
    await verifyVerificationCode(userId, code);

    const changed = !user.is2FA;
    user.is2FA = changed;
    await user.save();

    const status = changed ? "enabled" : "disabled";
    await EmailService.sendEmail({
      to: user.email,
      subject: "2FA Toggled",
      text: `${user.firstname}, 2FA has been ${status}`,
      html: `<p>${user.firstname}, 2FA has been ${status}</p>`,
    });

    return changed;
  } catch (err) {
    throw new Error(err);
  }
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  sendVerificationCode,
  verifyVerificationCode,
  toggle2FA,
};
