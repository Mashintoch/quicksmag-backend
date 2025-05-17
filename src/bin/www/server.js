/* eslint-disable no-console */
import "../../configs/envConfig";
import http from "http";

// eslint-disable-next-line import/first
import App from "../../app";

const Server = http.createServer(App);

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};

const port = normalizePort(process.env.PORT || "5000");
App.set("port", port);

Server.listen(port, () => {
  console.log(`Server listening on port ${port} ✔`);
});
