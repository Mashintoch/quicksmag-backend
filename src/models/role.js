import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const { Schema } = mongoose;

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    permissions: {
      resources: [
        {
          name: {
            type: String,
            required: true,
            enum: [
              "adminUsers",
              "subscriber"
            ],
          },
          operations: [
            {
              type: String,
              enum: [
                "create",
                "view",
                "update",
                "deactivate",
                "delete",
                "archive",
                "print",
                "decline",
                "export",
                "approve",
                "shortlist",
                "score",
                "review",
                "process"
              ],
            },
          ],
        },
      ],
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

roleSchema.plugin(mongoosePaginate);

export default mongoose.model("Role", roleSchema);
