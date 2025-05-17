import mongoose from "mongoose";

const { Schema } = mongoose;

const WailtListSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    message: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const WaitList = mongoose.model("WaitList", WailtListSchema);
export default WaitList;
