import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import config from "../configs/env";

const { Schema } = mongoose;
const { bcryptSalt } = config.auth;

const tokenSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["verification", "password-reset"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// eslint-disable-next-line consistent-return, func-names
tokenSchema.pre("save", async function (next) {
  if (!this.isModified("token")) {
    return next();
  }
  const hashedToken = await bcrypt.hash(this.token, Number(bcryptSalt));
  this.token = hashedToken;
  next();
});

export default mongoose.model("Token", tokenSchema);
