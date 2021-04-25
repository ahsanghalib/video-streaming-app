import ReconnectingWebSocket from "reconnecting-websocket";
import { ShowToast } from "../components/ShowToast";
import { useSocketStatus } from "../stores";
import { wsBaseUrl } from "./apiQueries";
import { WsParam } from "./types";

let ws: ReconnectingWebSocket | null;

window.addEventListener("online", () => {
  if (ws && ws.readyState === ws.CLOSED) {
    ShowToast("Reconnecting...", "info");
    console.log("online triggered, calling ws.reconnect()");
    ws.reconnect();
  }
});

export const closeWebSocket = () => {
  ws?.close();
};

export const createWebSocket = (force?: boolean) => {
  console.log("createWebSocket");
  if (!force && ws) {
    console.log("ws already connected");
    return;
  } else {
    console.log("new ws instance coming");
  }

  useSocketStatus.getState().setStatus("connecting");

  ws = new ReconnectingWebSocket(wsBaseUrl, undefined, {
    connectionTimeout: 15000,
  });

  ws.addEventListener("close", (event) => {
    useSocketStatus.getState().setStatus("closed");
    ShowToast("Connection closed.", "error");
    console.log("ws closed.");
  });

  ws.addEventListener("open", (event) => {
    useSocketStatus.getState().setStatus("open");
    ShowToast("Connected", "success");
    const id = setInterval(() => {
      if (ws && ws.readyState !== ws.CLOSED) {
        ws.send("ping");
      } else {
        clearInterval(id);
      }
    }, 3000);
  });

  ws.addEventListener("message", (e) => {
    if (e.data === "ping") {
      return;
    }

    console.log(JSON.parse(e.data));
  });
};

export const wsend = (d: WsParam) => {
  if (!ws || ws.readyState !== ws.OPEN) {
    console.log("ws not ready");
  } else {
    ws?.send(JSON.stringify(d));
  }
};
