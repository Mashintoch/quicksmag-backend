/* eslint-disable import/prefer-default-export */
class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

export { HttpError };
