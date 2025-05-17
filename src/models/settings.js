import mongoose from "mongoose";

const { Schema } = mongoose;

const settingsSchema = new Schema(
  {
    globalRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
