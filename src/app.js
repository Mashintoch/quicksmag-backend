/* eslint-disable no-console */
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import passport from "passport";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import connection from "./db";
import INIT from "./init";
import routes from "./routes/main";
import baseController from "./controllers/base";

const app = express();

app.use(helmet());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15mins
  max: 100,
});
app.use(limiter);

let corsOptions = {
  exposedHeaders: "Authorization",
};

if (process.env.PLATFORM === "AZURE") {
  corsOptions = {
    origin: "",
    exposedHeaders: "Authorization",
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
  };
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

(async function db() {
  await connection();
  await INIT();
})();

app.use(baseController.accessControl);

app.use("/api/v1", routes);

app.use(baseController.route404);

app.use(baseController.defaultErrorHandler);

export default app;
