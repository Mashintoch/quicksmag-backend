require("dotenv").config();

const config = {
  mongodb: {
    url: process.env.MONGODB_URI,
    testUrl: process.env.MONGODB_TEST_URI,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    senderEmail: process.env.SENDGRID_SENDER_EMAIL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    clientUrl: process.env.CLIENT_URL,
    googleAuthId: process.env.GOODLE_AUTH_CLIENT_ID,
    googleSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  audio: {
    freeSoundApiKey: process.env.FREESOUND_API_KEY,
    jamendoClientApi: process.env.JAMENDO_CLIENT_ID,
  },
  platform: {
    clientUrl: process.env.CLIENT_URL,
    SERVER_URL: process.env.SERVER_URL,
    PORT: process.env.PORT || 3000,
  },
};

module.exports = config;
