import http from "http";
import { v4 as uuid } from "uuid";
import WebSocket from "ws";
import { handleSocketResponse } from "./controllers/socket";
import logger from "./logging/Logger";
import { Oper, WsParam } from "./types";

export interface SocketUser extends WebSocket {
  sessionId: string;
  isAlive: boolean;
  isAuth: boolean;
}

export const connectedUsers = new Map<string, SocketUser>();

const heartbeat = (socket: SocketUser) => {
  socket.isAlive = true;
};

const ping = (socket: SocketUser) => {
  socket.send("ping");
};

const webSocketApp = (httpServer: http.Server) => {
  logger.info(`WEBSOCKET | Websocket starting...`);
  const wss = new WebSocket.Server({ server: httpServer, path: "/socket" });

  wss.on(
    "connection",
    async (socket: SocketUser, req: http.IncomingMessage) => {
      socket.sessionId = uuid();
      socket.isAlive = true;
      socket.isAuth = false;
      connectedUsers.set(socket.sessionId, socket);

      logger.info(
        `WEBSOCKET | NEW CONNECTION | USER_SESSION_ID | ${socket.sessionId} | IP | ${req.headers["x-forwared-for"]} | ${req.headers.origin} | ${req.socket.remoteAddress}`,
      );

      logger.info(`WEBSOCKET | TOTAL USERS | ${connectedUsers.size}`);

      socket.addEventListener("pong", () => {
        heartbeat(socket);
      });

      const session_id: WsParam = {
        op: Oper.session_id,
        d: { session_id: socket.sessionId, isAuth: socket.isAuth },
      };

      socket.send(JSON.stringify(session_id));

      socket.addEventListener("message", async (event) => {
        if (event.data === "ping") {
          return;
        }

        try {
          const json: WsParam = JSON.parse(event.data);
          logger.info(`WEBSOCKET | MESSAGE | ${JSON.stringify(json)}`);

          const res: WsParam = await handleSocketResponse(json);

          if (res) {
            logger.info(`WEBSOCKET | RESPONSE | ${JSON.stringify(res)}`);
            socket.send(JSON.stringify(res));
          }
        } catch (err) {
          logger.error(
            `WEBSOCKET | FAILED | Failed to handle socket message | ${err}`,
          );
          console.error(err);
        }
      });

      socket.addEventListener("error", (event) => {
        logger.info(
          `WEBSOCKET | SOCKET ERROR |USER_SESSION_ID | ${
            socket.sessionId
          } | ${JSON.stringify(event, null, 2)}`,
        );
      });

      socket.addEventListener("close", () => {
        logger.info(
          `WEBSOCKET | SOCKET CLOSED |USER_SESSION_ID | ${socket.sessionId} `,
        );
        connectedUsers.delete(socket.sessionId);
        logger.info(`WEBSOCKET | TOTAL USERS | ${connectedUsers.size}`);
      });
    },
  );

  const interval = setInterval(() => {
    wss.clients.forEach((socket: SocketUser) => {
      if (socket.isAlive === false) {
        return socket.terminate();
      }
      socket.isAlive = false;
      socket.ping(() => {
        ping(socket);
      });
    });
  }, 2000);
};

export default webSocketApp;
