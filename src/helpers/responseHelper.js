const response = (res, statusCode, message, data) =>
  res.status(statusCode).json({
    status: !!(statusCode === 200 || statusCode === 201),
    message: message.replaceAll("Error: ", "") ?? "",
    data: data ?? null,
  });

export default response;
