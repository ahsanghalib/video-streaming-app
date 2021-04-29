import ReconnectingWebSocket from "reconnecting-websocket";
import { ShowToast } from "../components/ShowToast";
import {
  useMediaStore,
  useSocketStatus,
  useStreamingUsers,
  useTokenStore,
} from "../stores";
import { wsBaseUrl } from "./apiQueries";
import { Oper, WsParam } from "./types";
import {
  handleCloseWebRTCConnection,
  handleConnectTransportRequest,
  handleCreateTransportRequest,
  handleProduceRequest,
  handleRouterRtpCapabilitiesRequest,
} from "./webrtc";

let ws: ReconnectingWebSocket | null;
let lastMsg: any;

window.addEventListener("online", () => {
  if (ws && ws.readyState === ws.CLOSED) {
    ShowToast("Reconnecting...", "info");
    console.log("online triggered, calling ws.reconnect()");
    ws.reconnect();
  }
});

export const closeWebSocket = () => {
  ws?.close();
  ws = null;
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

    if (lastMsg) {
      ws?.send(JSON.stringify(lastMsg));
      lastMsg = "";
    }

    const json: WsParam = JSON.parse(e.data);
    handleSocketMessages(json);
  });
};

export const wsend = (d: WsParam) => {
  if (!ws || ws.readyState !== ws.OPEN) {
    console.log("ws not ready");
    lastMsg = d;
    console.log(lastMsg);
  } else {
    ws?.send(JSON.stringify(d));
  }
};

const handleSocketMessages = async (json: WsParam) => {
  switch (json.op) {
    case Oper.session_id:
      useTokenStore.getState().setSessionId(json.d.session_id);
      break;
    case Oper.router_rtp_capabilities:
      handleRouterRtpCapabilitiesRequest(json.d);
      break;
    case Oper.create_transport:
      handleCreateTransportRequest(json.d);
      break;
    case Oper.connect_transport:
      handleConnectTransportRequest(json.d);
      break;
    case Oper.produce:
      handleProduceRequest(json.d);
      break;
    case Oper.close_webrtc:
      handleCloseWebRTCConnection(json.d);
      break;
    case Oper.start_stream:
      handleStartStreaming(json.d);
      break;
    case Oper.streaming_sessions:
      handleStreamingSession(json.d);
      break;
    // case Oper.get_streaming_sessions:
    //   handleStreamingSession(json.d);
    //   break;
    case Oper.error:
      ShowToast(json.d.message, "error");
      break;
    default:
      console.log(json);
      break;
  }
};

const handleStartStreaming = (msg: any) => {
  const { fileName } = msg;
  useMediaStore.getState().set({ fileName });
};

const handleStreamingSession = (msg: any) => {
  let result: any = {};
  let key;

  for (key in msg) {
    if (key !== useTokenStore.getState().sessionId) {
      result[key] = msg[key];
    }
  }

  let arr = Object.entries(result);
  let streamUsers = arr.map((v: any) => {
    return {
      userId: v[1].userId,
      fileName: v[1].fileName,
      userName: v[1].userName,
    };
  });

  useStreamingUsers.getState().setStreamUsers(streamUsers);
};
