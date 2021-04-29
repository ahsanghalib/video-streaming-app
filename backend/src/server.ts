require("dotenv").config();

import http from "http";
import morgan from "morgan";
import connectToDB from "./db";
import expressApp from "./expressApp";
import logger from "./logging/Logger";
import { initializeWorkers } from "./webrtc/mediaSoupStart";
import { RequestWithUserID } from "./types";
import webSocketApp from "./webSocketApp";
import { startRabbitMQ } from "./startRabbirMQ";

morgan.token("user_id", (req: RequestWithUserID) => {
  return req.userId + " | " + req.userType;
});

morgan.token("req_origin", (req: RequestWithUserID) => {
  return req.get("origin");
});

morgan.token("agent_info", (req: RequestWithUserID) => {
  return (
    req.useragent.platform +
    " | " +
    req.useragent.os +
    " | " +
    req.useragent.browser +
    " " +
    req.useragent.version +
    " | " +
    req.useragent.source
  );
});

logger.info(`NODE_ENV | ${process.env.NODE_ENV}`);

const httpServer = http.createServer();
const port = process.env.PORT || 4242;

(async () => {
  try {
    logger.info("Starting server ...");

    await connectToDB();
    await initializeWorkers();
    await startRabbitMQ();

    expressApp(httpServer);
    webSocketApp(httpServer);

    httpServer.listen(port, () => {
      logger.info(`App started on port ${port}`);
    });
  } catch (err) {
    logger.error(
      "ERROR | Failed to initialize application destroying in 2 seconds...",
    );
    logger.error(`ERROR | ${err}`);
    console.log(err);
    setTimeout(() => process.exit(1), 2000);
  }
})();
