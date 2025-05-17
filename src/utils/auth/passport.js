import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import generalData from "../../data/generalData";

// const { domain } = generalData;

// Function to generate callback URLs
const callBackUrl = (strategy) => {
  const value = `https://pozse-server-production-ae41.up.railway.app/api/v1/auth/${strategy}/callback`;
  return value;
};

const providers = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    options: {
      scope: ["profile", "email"],
    },
  },
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    options: {},
  },
};

// Get available providers
const getAvailableProviders = () => {
  const availableProviders = Object.entries(providers)
    .filter(([, config]) => config.clientID && config.clientSecret) // Ignore the first element
    .map(([provider]) => provider); // Extract provider names
  return availableProviders;
};

// Passport configuration function
const usePassport = () => {
  // Google strategy
  if (providers.google.clientID && providers.google.clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: providers.google.clientID,
          clientSecret: providers.google.clientSecret,
          callbackURL: callBackUrl("google"),
        },
        (accessToken, refreshToken, profile, cb) => {
          const user = {
            email: profile.emails[0].value,
            phoneNumber: "",
            password: "",
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            username: profile.emails[0].value.split("@")[0].toLowerCase(),
          };
          return cb(null, user);
        }
      )
    );
  } else {
    console.warn("Google credentials are missing.");
  }

  // Facebook strategy
  if (providers.facebook.clientID && providers.facebook.clientSecret) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: providers.facebook.clientID,
          clientSecret: providers.facebook.clientSecret,
          callbackURL: callBackUrl("facebook"),
          profileFields: ["id", "displayName", "photos", "email"],
        },
        (accessToken, refreshToken, profile, cb) => {
          console.log("Facebook Profile:", profile);

          const user = {
            email: profile.emails[0].value,
            phoneNumber: "",
            password: "",
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            username: profile.emails[0].value.split("@")[0].toLowerCase(),
          };

          return cb(null, user);
        }
      )
    );
  } else {
    console.warn("Facebook credentials are missing.");
  }

  return passport;
};

// Export functions and providers
export { getAvailableProviders, usePassport, providers };
