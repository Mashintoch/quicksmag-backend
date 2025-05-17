/* eslint-disable func-names */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const bcryptSalt = process.env.BCRYPT_SALT;

const { Schema } = mongoose;

const codeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
    expires: 300, // 5 minutes
  },
});

// eslint-disable-next-line consistent-return
codeSchema.pre("save", async function (next) {
  if (!this.isModified("code")) {
    return next();
  }
  const hashedCode = await bcrypt.hash(this.code, Number(bcryptSalt));
  this.code = hashedCode;
  next();
});

export default mongoose.model("Code", codeSchema);
