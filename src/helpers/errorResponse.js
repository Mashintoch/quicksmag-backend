import { HttpError } from "../classes";
import getErrorMessage from "./getErrorMessage";

const response = (res, statusCode, message, data = {}) =>
  res.status(statusCode).json({
    status: !!(statusCode === 200 || statusCode === 201 || statusCode === 204),
    message: message.replaceAll("Error: ", "") ?? "",
    data: data ?? "",
  });

//* Funny name
const errorResponse = (res, err, customCode = undefined) => {
  const statusCode = err instanceof HttpError ? err.statusCode : customCode ?? 500;
  return response(res, statusCode, getErrorMessage(err));
};

export { response, errorResponse };
