/* eslint-disable consistent-return */
/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from "http-status-codes";
import HttpError from "../helpers/httpError";


export const notFound = (req, res, next) => {
  const error = new HttpError(
    `Not Found - ${req.originalUrl}`,
    StatusCodes.NOT_FOUND
  );
  next(error);
};

export const errorHandler = (err, req, res) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Something went wrong, please try again later";

  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    response.message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } already exists`;
    return res.status(StatusCodes.CONFLICT).json(response);
  }

  if (err.name === "ValidationError") {
    response.message = "Validation Error";
    response.errors = Object.values(err.errors).map((e) => e.message);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }

  if (err.name === "JsonWebTokenError") {
    response.message = "Invalid token. Please login again.";
    return res.status(StatusCodes.UNAUTHORIZED).json(response);
  }

  if (err.name === "TokenExpiredError") {
    response.message = "Token expired. Please login again.";
    return res.status(StatusCodes.UNAUTHORIZED).json(response);
  }

  res.status(statusCode).json(response);
};
