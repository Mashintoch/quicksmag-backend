/* eslint-disable no-dupe-keys */
import Joi from "joi";

const createAdminUser = Joi.object().keys({
  firstname: Joi.string().min(3).trim().max(255).required(),
  lastname: Joi.string().min(3).trim().max(255).required(),
  email: Joi.string().min(10).trim().max(255).required().email(),
  phoneNumber: Joi.string().max(14).required(),
  // role: Joi.string().min(10).required(),
});

const emailConfirmation = Joi.object().keys({
  confirmationToken: Joi.string().required(),
}); 

const resendEmailVerificationLink = Joi.object().keys({
  identifier: Joi.string().required(),
});

const activateAdminAccount = Joi.object().keys({
  token: Joi.string().required(),
  user: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

const requestResetPassword = Joi.object().keys({
  email: Joi.string().email().required(),
});

const resetPassword = Joi.object().keys({
  token: Joi.string().min(10).trim().required(),
  user: Joi.string().min(40).trim().required(),
  password: Joi.string().min(8).trim().required(),
});

const role = Joi.object().keys({
  name: Joi.string().min(2).trim().max(255).required(),
  permissions: Joi.object()
    .keys({
      resources: Joi.array()
        .items(
          Joi.object().keys({
            name: Joi.string()
              .valid("reports", "adminUsers", "forms", "subscriber")
              .required(),
            operations: Joi.array()
              .items(
                Joi.when("name", {
                  otherwise: Joi.string().valid(
                    "create",
                    "view",
                    "update",
                    "deactivate",
                    "delete",
                    "archive",
                    "print",
                    "approve",
                    "decline",
                    "process"
                  ),
                }),
                Joi.when("name", {
                  then: Joi.string().valid("export", "view"),
                  otherwise: Joi.string().valid(
                    "create",
                    "view",
                    "update",
                    "deactivate",
                    "delete",
                    "archive",
                    "print",
                    "approve",
                    "decline"
                  ),
                }),
                Joi.when("name", {
                  otherwise: Joi.string().valid(
                    "create",
                    "view",
                    "update",
                    "deactivate",
                    "delete",
                    "archive",
                    "print",
                    "approve",
                    "decline",
                    "process"
                  ),
                }),
                Joi.when("name", {
                  otherwise: Joi.string().valid(
                    "create",
                    "view",
                    "update",
                    "deactivate",
                    "delete",
                    "archive",
                    "print",
                    "approve",
                    "decline",
                    "process"
                  ),
                })
              )
              .min(1)
              .required(),
          })
        )
        .min(1)
        .required(),
    })
    .required(),
});

const signIn = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(255).trim().required(),
});

const signUp = Joi.object().keys({
  firstname: Joi.string().min(3).max(255).trim().required(),
  lastname: Joi.string().min(3).max(255).trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(255).trim(),
  role: Joi.string(),
  isVolunteer: Joi.boolean(),
  isVendor: Joi.boolean(),
});

const updateAdminUser = Joi.object().keys({
  firstname: Joi.string().min(3).trim().max(255),
  lastname: Joi.string().min(3).trim().max(255),
  phoneNumber: Joi.string().max(14),
  role: Joi.string().min(10),
});

const updateProfile = Joi.object().keys({
  title: Joi.string().min(2).trim().max(10).valid("Mr", "Mrs.", "Miss", "Dr."),
  gender: Joi.string().min(4).max(8).valid("male", "female"),
  dateOfBirth: Joi.date(),
  countryOfResidence: Joi.string().min(5).max(50),
  nationality: Joi.string().min(5).max(50),
  street: Joi.string().min(2).max(255),
  city: Joi.string().min(2).max(50),
  state: Joi.string().min(3).max(50),
  mobiles: Joi.object().keys({
    mobileOne: Joi.string().min(14).max(16), // phone number with country code
    mobileTwo: Joi.string().min(14).max(16),
  }),
  emails: Joi.object().keys({
    secondEmail: Joi.string().min(10).max(255).email(),
  }),
  disability: Joi.string().valid("Yes", "None"),
  disabilityType: Joi.string().min(5).max(255),
  socials: Joi.object().keys({
    twitter: Joi.string().max(200),
    linkedin: Joi.string().min(15).max(200),
    facebook: Joi.string().max(200),
    instagram: Joi.string().max(200),
  }),
});

const userPasswordReset = Joi.object().keys({
  currentPassword: Joi.string().min(8).max(255).trim().required(),
  newPassword: Joi.string().min(8).max(255).trim().required(),
});

const verify2FACode = Joi.object().keys({
  code: Joi.string().required(),
  userId: Joi.string().required(),
});

const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(5000).trim().required().messages({
    "string.empty": "Content cannot be empty",
    "string.min": "Content must be at least 1 character",
    "string.max": "Content must be less than 5000 characters",
    "any.required": "Content is required",
  }),

  location: Joi.string().min(1).max(255).trim().required().messages({
    "string.empty": "Location cannot be empty",
    "string.min": "Location must be at least 1 character",
    "string.max": "Location must be less than 255 characters",
    "any.required": "Location is required",
  }),

  tags: Joi.string()
    .allow("")
    .optional()
    .pattern(/^[a-zA-Z0-9,\s]+$/)
    .messages({
      "string.pattern.base":
        "Tags can only contain alphanumeric characters and commas",
    }),

  status: Joi.string().valid("published", "draft").default("published"),
});

const updatePostSchema = Joi.object({
  content: Joi.string().min(1).max(5000).trim().optional().messages({
    "string.min": "Content must be at least 1 character",
    "string.max": "Content must be less than 5000 characters",
  }),

  location: Joi.string().min(1).max(255).trim().optional().messages({
    "string.min": "Location must be at least 1 character",
    "string.max": "Location must be less than 255 characters",
  }),

  tags: Joi.string()
    .allow("")
    .optional()
    .pattern(/^[a-zA-Z0-9,\s]+$/)
    .messages({
      "string.pattern.base":
        "Tags can only contain alphanumeric characters and commas",
    }),

  status: Joi.string().valid("published", "draft").optional(),

  medias: Joi.object({
    images: Joi.array().optional(),
    videos: Joi.array().optional(),
  }).optional(),
});

const tagSchema = Joi.object({
  tag: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .pattern(/^[a-zA-Z0-9]+$/)
    .messages({
      "string.empty": "Tag is required",
      "string.min": "Tag must be at least 1 character",
      "string.max": "Tag must be less than 50 characters",
      "string.pattern.base": "Tag can only contain alphanumeric characters",
      "any.required": "Tag is required",
    }),
});

const toggleLikeSchema = Joi.object({
  postId: Joi.string().trim().required().messages({
    "string.empty": "Post ID is required",
    "any.required": "Post ID is required",
  }),
});

const followUser = Joi.object().keys({
  targetUserId: Joi.string().required().messages({
    "string.empty": "Target UserID is required",
    "any.required": " Target UserID is required"
  })
});

const unfollowUser = Joi.object().keys({
  targetUserId: Joi.string().required().messages({
    "string.empty": "Target UserID is required",
    "any.required": " Target UserID is required"
  })
});

const toggle2FA = Joi.object().keys({
  enabled: Joi.boolean().required().messages({
    "boolean.base": "Enabled must be a boolean value",
    "any.required": "Enabled status is required"
  }),
  phoneNumber: Joi.string().when('enabled', {
    is: true,
    then: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
    otherwise: Joi.optional()
  }).messages({
    "string.pattern.base": "Phone number must be in E.164 format (e.g., +1234567890)",
    "any.required": "Phone number is required when enabling 2FA"
  })
});

export default {
  "/admin/user/new": createAdminUser,
  "/admin/user/update": updateAdminUser,
  "/auth/login": signIn,
  "/auth/signup": signUp,
  "/auth/resend-email-verification-link": resendEmailVerificationLink,
  "/auth/email/confirmation": emailConfirmation,
  "/auth/activate-admin": activateAdminAccount,
  "/auth/request/new/password": requestResetPassword,
  "/auth/reset/password": resetPassword,
  "/auth/verify-2fa-code": verify2FACode,
  "/role/new": role,
  "/role/update": role,
  "/user/profile/update": updateProfile,
  "/user/password/reset": userPasswordReset,

  "/posts/create": createPostSchema,
  "/posts/update": updatePostSchema,
  "/posts/tag": tagSchema,
  "/posts/toggleLike": toggleLikeSchema,
  "/user/follow": followUser,
  "/user/unfollow": unfollowUser,
  "/user/security/2fa": toggle2FA,
};
