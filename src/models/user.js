/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

import hash from "../helpers/hash";

import { PROFILE_ICONS } from "../configs/constants";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    uniqueId: {
      type: String,
      default: uuidv4,
      index: {
        unique: true,
        partialFilterExpression: {
          uniqueId: {
            $type: "string",
          },
        },
      },
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      minlength: 10,
      trim: true,
      unique: true,
      immutable: true,
    },
    firstname: {
      type: String,
      immutable: (doc) => doc.accountType !== "admin",
    },
    lastname: {
      type: String,
      immutable: (doc) => doc.accountType !== "admin",
    },
    username: {
      type: String,
      lowercase: true,
      minlength: 3,
      trim: true,
      unique: true,
      immutable: true,
    },
    password: {
      type: String,
    },
    phoneNumber: {
      type: String,
      maxlength: 14,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "INACTIVE", "DEACTIVATED", "SUSPENDED"],
      default: "PENDING",
    },
    accountType: {
      type: String,
      enum: ["subscriber", "admin", "vendor", "rider"],
      default: "subscriber",
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },
    category: {
      type: [String],
      enum: ["vendor", "resturant", "rider"],
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
    isVerified: { type: Boolean, default: false },
    is2FA: { type: Boolean, default: false },
    profilePicture: {
      type: String,
      default: PROFILE_ICONS,
    },
    personalInformation: {
      title: {
        type: String,
        enum: ["Mr", "Mrs", "Miss", "Dr", "Prof"],
      },
      gender: {
        type: String,
        enum: ["male", "female", "others"],
      },
      bio: {
        type: String,
      },
      dateOfBirth: {
        type: Date,
      },
      countryOfResidence: {
        type: String,
      },
      address: {
        type: String,
      },
      nationality: {
        type: String,
      },
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      mobiles: {
        mobileOne: {
          type: String,
          maxlength: 14,
        },
        mobileTwo: {
          type: String,
          maxlength: 14,
        },
      },
      emails: {
        secondEmail: {
          type: String,
          lowercase: true,
          trim: true,
          unique: true,
          sparse: true,
        },
      },
      professionalQualification: {
        type: String,
      },
      highestLevelOfQualification: {
        type: String,
        enum: [
          "PhD",
          "M.Sc",
          "M.A",
          "PG",
          "B.Sc",
          "HND",
          "OND",
          "NCE",
          "MBA",
          "B.A",
          "MBBS",
          "Others",
        ],
      },
      institutionAttended: {
        type: String,
      },
      disability: {
        type: String,
        enum: ["Yes", "None"],
      },
      disabilityType: {
        type: String,
      },
      socials: {
        twitter: {
          type: String,
        },
        linkedin: {
          type: String,
        },
        facebook: {
          type: String,
        },
        instagram: {
          type: String,
        },
        website: {
          type: String,
        },
        publication: {
          type: String,
        },
        bio: {
          type: String,
        },
      },
    },
    referralCode: {
      type: String,
      sparse: true,
      trim: true,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    referralLink: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    totalReferralRewards: {
      type: Number,
      default: 0,
    },
    loginHistory: [
      {
        ip: {
          type: String,
          required: true,
        },
        userAgent: {
          type: String,
          required: true,
        },
        loginTime: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

userSchema.plugin(mongoosePaginate);
userSchema.plugin(mongooseAggregatePaginate);

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret._id.toString();
    delete ret.password;
    return ret;
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const hashedPassword = await hash(this.password);
  this.password = hashedPassword;
  next();
});

export default mongoose.model("User", userSchema);
