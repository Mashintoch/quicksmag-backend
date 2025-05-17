import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const helpRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "general",
        "account",
        "technical",
        "billing",
        "feature",
        "complaint",
        "other",
      ],
      default: "general",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "closed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    responses: [
      {
        message: String,
        timestamp: { type: Date, default: Date.now },
        respondent: {
          type: String,
          enum: ["user", "support"],
          required: true,
        },
        respondentId: mongoose.Schema.Types.ObjectId,
      },
    ],
    attachments: [
      {
        url: String,
        filename: String,
        mimetype: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    metadata: {
      browser: String,
      device: String,
      platform: String,
      ipAddress: String,
    },
    resolvedAt: Date,
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

helpRequestSchema.plugin(mongoosePaginate);

helpRequestSchema.index({ createdAt: -1 });
helpRequestSchema.index({ status: 1, createdAt: -1 });
helpRequestSchema.index({ userId: 1, status: 1 });

const HelpRequest = mongoose.model("HelpRequest", helpRequestSchema);

export default HelpRequest;
