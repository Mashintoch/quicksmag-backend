import Joi from "joi";

const customJoi = Joi.extend((joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "password.requirements":
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  },
  rules: {
    passwordComplexity: {
      validate(value, helpers) {
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(value)) {
          return helpers.error("password.requirements");
        }
        return value;
      },
    },
  },
}));

export const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),

  password: customJoi.string().passwordComplexity().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),

  firstname: Joi.string().min(2).max(50).required().trim().messages({
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name cannot exceed 50 characters",
    "string.empty": "First name is required",
    "any.required": "First name is required",
  }),

  lastname: Joi.string().min(2).max(50).required().trim().messages({
    "string.min": "Last name must be at least 2 characters long",
    "string.max": "Last name cannot exceed 50 characters",
    "string.empty": "Last name is required",
    "any.required": "Last name is required",
  }),

  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .lowercase()
    .trim()
    .messages({
      "string.alphanum": "Username must only contain alphanumeric characters",
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username cannot exceed 30 characters",
      "string.empty": "Username is required",
      "any.required": "Username is required",
    }),

  referralCode: Joi.string().optional().trim().allow("").messages({
    "string.base": "Referral code must be a string",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email is required",
    }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
      "string.empty": "Phone number is required",
    }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
})
  .xor("email", "phone")
  .messages({
    "object.xor": "Either email or phone number is required",
  });

export const emailVerificationSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
});

export const verifyCodeSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),

  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "Verification code must be 6 digits",
      "string.pattern.base": "Verification code must contain only numbers",
      "string.empty": "Verification code is required",
      "any.required": "Verification code is required",
    }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
});

export const resetPasswordSchema = Joi.object({
  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "Reset code must be 6 digits",
      "string.pattern.base": "Reset code must contain only numbers",
      "string.empty": "Reset code is required",
      "any.required": "Reset code is required",
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),

  newPassword: customJoi.string().passwordComplexity().required().messages({
    "string.empty": "New password is required",
    "any.required": "New password is required",
  }),
});
