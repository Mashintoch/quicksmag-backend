/* eslint-disable import/no-extraneous-dependencies */
import rateLimit from "express-rate-limit";

const trendingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests for trending content. Please try again later.",
  },
});

export default trendingLimiter;
