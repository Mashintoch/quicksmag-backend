/* eslint-disable no-console */
import path from "path";
import { spawn } from "child_process";

const MONGO_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const AUTO_BACKUP_MONGODB = () => {
  const child = spawn("mongodump", [
    "--uri",
    MONGO_URI,
    "--out",
    path.join(__dirname, "../../backups/db"),
  ]);

  child.stdout.on("data", (data) => {
    console.log("stdout:\n", data);
  });

  child.stderr.on("data", (data) => {
    console.log("stderr:\n", Buffer.from(data).toString());
  });

  child.on("error", (error) => {
    console.log("error:\n", error);
  });

  child.on("exit", (code, signal) => {
    if (code) {
      console.log("Process exit with code: ", code);
    } else if (signal) {
      console.log("Process killed with signal: ", signal);
    } else {
      console.log("Backup successful ✔");
    }
  });
};

const RESTORE_BACKUP = () => {
  const child = spawn("mongorestore", [
    "--host=localhost",
    "--port=27017",
    "-d=pozse_digital",
    `${path.join(__dirname, "dump", "POZSE_DB_BACKUP.gzip")}`,
    "--gzip",
  ]);

  child.stdout.on("data", (data) => {
    console.log("stdout:\n", data);
  });

  child.stderr.on("data", (data) => {
    console.log("stderr:\n", Buffer.from(data).toString());
  });

  child.on("error", (error) => {
    console.log("error:\n", error);
  });

  child.on("exit", (code, signal) => {
    if (code) {
      console.log("Process exit with code: ", code);
    } else if (signal) {
      console.log("Process killed with signal: ", signal);
    } else {
      console.log("Backup restored ✔");
    }
  });
};

export default { AUTO_BACKUP_MONGODB, RESTORE_BACKUP };
