/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from "http-status-codes";

const validate = (schema) => (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));

      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        errors,
        message: "Validation failed. Please check your input.",
      });
    }

    req.body = value;
    return next();
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred during validation",
    });
  }
};

export default validate;
