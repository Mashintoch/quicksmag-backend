import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const ReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "spam",
        "harassment",
        "hate_speech",
        "inappropriate_content",
        "violence",
        "copyright",
        "other"
      ],
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewNote: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ReportSchema.plugin(mongoosePaginate);

export default mongoose.model("Report", ReportSchema);