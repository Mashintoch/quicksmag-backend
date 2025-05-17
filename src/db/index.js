/* eslint-disable no-console */
import { connect, set } from "mongoose";

const DB_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const connection = async () => {
  try {
    set("strictQuery", true);
    await connect(DB_URL, {
    });
    console.log("App connected to database ✔✔");
  } catch (err) {
    console.log(err);
  }
};

export default connection;
