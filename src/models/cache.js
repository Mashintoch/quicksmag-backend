import mongoose from "mongoose";

const CacheSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: "1s" },
    },
  },
  {
    timestamps: true,
  }
);

const Cache = mongoose.model("Cache", CacheSchema);

export default Cache;
