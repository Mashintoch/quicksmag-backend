import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const orderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/-/g, ""),
    },
    orderId: {
      type: String,
      default: () => uuidv4().replace(/-/g, ""),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    meals: [
      {
        meal: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    destination: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["RECIEVED", "ONGOING", "PICKUP", "COMPLETED", "CANCELLED"],
      default: "RECIEVED",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    serviceFee: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.plugin(mongoosePaginate);
orderSchema.plugin(mongooseAggregatePaginate);

export default mongoose.model("Order", orderSchema);
