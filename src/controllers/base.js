/* eslint-disable no-console */
import fs from "fs";
import HttpError from "../helpers/http-error";

const accessControl = (req, res, next) => {
  if (process.env.PLATFORM === "AZURE") {
    res.setHeader("Access-Control-Allow-Origin", "");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, PUT"
  );
  next();
};

const route404 = () => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
};

const defaultErrorHandler = (error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }

  return res
    .status(error.code || 500)
    .json({ error: error.message || "An unknown error occurred!" });
};

export default {
  accessControl,
  route404,
  defaultErrorHandler,
};
