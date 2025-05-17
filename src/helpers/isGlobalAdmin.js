/* eslint-disable no-underscore-dangle */
import mongoose from "mongoose";
import Settings from "../models/settings";

const isGlobalAdmin = async (role) => {
  const globalAdmin = await Settings.findOne({
    globalRole: new mongoose.Types.ObjectId(role),
  });

  return !!globalAdmin;
};

export default isGlobalAdmin;
