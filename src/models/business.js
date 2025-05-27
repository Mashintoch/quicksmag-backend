import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const businessSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/-/g, ""),
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    operations: {
      openingDays: {
        type: Date,
      },
      openingTime: {
        type: Date,
      },
      closingTime: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "INACTIVE", "DEACTIVATED", "SUSPENDED"],
      default: "PENDING",
    },
    banner: {
      type: String,
      id: {
        type: String,
        default: () => uuidv4().replace(/-/g, ""),
      },
      url: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ["vendor", "rider"],
      default: "vendor",
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedByUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    collection: "businesses",
  }
);

businessSchema.plugin(mongoosePaginate);
businessSchema.plugin(mongooseAggregatePaginate);

export default mongoose.model("Business", businessSchema);
