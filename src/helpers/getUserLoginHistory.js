function getClientInfo(req) {
  const ip =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    "unknown";

  const userAgent = req.headers["user-agent"] || "unknown";

  return { ip, userAgent };
}

export default getClientInfo;
