import logger, { LoggerStream } from "./logging/Logger";
import cors from "cors";
import express, { Request, Response } from "express";
import useragent from "express-useragent";
import http from "http";
import { headers } from "./middlewares";
import routes from "./routes";
import morgan from "morgan";
import path from "path";

const expressApp = (httpServer: http.Server) => {
  logger.info(`EXPRESS_APP | Express application starting...`);
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.disable("x-powered-by");
  app.use(useragent.express());
  app.use(headers);
  app.use(cors());

  app.use(
    morgan(
      `:method | :req_origin :url | :response-time ms | :remote-addr | HTTP/:http-version | :status | :res[content-length] | :user_id | :agent_info`,
      { stream: new LoggerStream() },
    ),
  );

  httpServer.on("request", app);
  app.use("/api", routes, cors());
  app.use(express.static(path.join(__dirname, "../client")));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
  });

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      message: ["Request resource not found."],
      url: req.originalUrl,
    });
  });
};

export default expressApp;
