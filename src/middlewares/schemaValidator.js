/* eslint-disable no-else-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable default-param-last */

import Schemas from "../validators/schemas";

const validationFactory = (useJoiError = true, path) => {
  const supportedMethods = ["post", "put", "patch", "get"];

  const validationOptions = {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: false,
  };

  return (req, res, next) => {
    const method = req.method.toLowerCase();

    if (supportedMethods.includes(method)) {
      const schema = Schemas[path];

      if (schema) {
        const { error, value } = schema.validate(req.body, validationOptions);

        if (error) {
          const JoiError = {
            status: "failed",
            error: {
              original: error.details[0]._object,
              details: error.details.map(({ message, type }) => ({
                message: message.replace(/['"]/g, ""),
                type,
              })),
            },
          };

          const CustomError = {
            status: "failed",
            error: "Invalid request. Please review request and try again.",
          };

          return res.status(422).json(useJoiError ? JoiError : CustomError);
        } else {
          req.body = value;
          return next();
        }
      } else {
        return next();
      }
    } else {
      return next();
    }
  };
};
export default validationFactory;
