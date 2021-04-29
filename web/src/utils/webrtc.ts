import { detectDevice, Device } from "mediasoup-client";
import { ShowToast } from "../components/ShowToast";
import {
  ConnectionState,
  useMediaSoupConnectionState,
  useMediaStore,
  useTokenStore,
  useUserInfoStore
} from "../stores";
import { wsend } from "./createWebSocket";
import { Oper } from "./types";

const queue = new Map<string, (json: any) => Promise<void>>();

export const defaultConstraints = {
  audio: true,
  video: true,
  // video: { width: 640, height: 480 },
  // video: {
  //   width: {
  //     min: 640,
  //     ideal: 1920,
  //     max: 2560,
  //   },
  //   height: {
  //     min: 480,
  //     ideal: 1080,
  //     max: 1440,
  //   },
  //   facingMode: useMediaStore.getState().facingMode,
  // },
};

const hasGetUserMedia = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

export const getUserMedia = async () => {
  if (hasGetUserMedia()) {
    return await navigator.mediaDevices.getUserMedia(defaultConstraints);
  } else {
    ShowToast("Browser not supported.", "error");
    throw new Error("Browser not supported");
  }
};

export const handleRouterRtpCapabilitiesRequest = async (msg: any) => {
  const { routerRtpCapabilities } = msg;
  try {
    console.log(detectDevice());
    const device = new Device();
    await device.load({ routerRtpCapabilities });
    useMediaStore.getState().set({ device });

    if (!device.loaded) {
      throw new Error("Peer or device is not initialized");
    }

    wsend({
      op: Oper.create_transport,
      d: {
        sessionId: useTokenStore.getState().sessionId,
        userId: useUserInfoStore.getState().user.id,
      },
    });
  } catch (error) {
    console.error(
      "handleRouterRtpCapabilities() failed to init device [error:%o]",
      error
    );
    ShowToast("Error in WebRTC....", "error");
  }
};

export const handleCreateTransportRequest = async (msg: any) => {
  const { id, dtlsParameters, iceCandidates, iceParameters } = msg;
  try {
    const device = useMediaStore.getState().device;

    const sendTransport: any = await device?.createSendTransport({
      id,
      dtlsParameters,
      iceCandidates,
      iceParameters,
    });

    useMediaStore.getState().set({
      sendTransport,
    });

    handleSendTransportListeners();
    getMediaStream();
  } catch (error) {
    console.error(
      "handleCreateTransportRequest() failed to create transport [error:%o]",
      error
    );
    ShowToast("Error in WebRTC....", "error");
  }
};

export const handleConnectTransportRequest = async (msg: any) => {
  console.log("handleTransportConnectRequest()");
  try {
    const action = queue.get("connect_transport");
    if (!action) {
      throw new Error("transport-connect action was not found");
    }
    await action(msg);
  } catch (error) {
    console.error("handleTransportConnectRequest() failed [error:%o]", error);
  }
};

export const handleProduceRequest = async (msg: any) => {
  console.log("handleProduceRequest()");
  try {
    const action = queue.get("produce");
    if (!action) {
      throw new Error("produce action was not found");
    }
    await action(msg);
  } catch (error) {
    console.error("handleProduceRequest() failed [error:%o]", error);
  }
};

const handleSendTransportListeners = () => {
  const sendTransport = useMediaStore.getState().sendTransport;

  sendTransport?.on(
    "connect",
    async ({ dtlsParameters }, callback, errback) => {
      console.log("handleTransportConnectEvent()");
      try {
        const action = async (json: any) => {
          console.log("connect_transport action");
          callback();
          queue.delete("connect_transport");
        };

        queue.set("connect_transport", action);

        wsend({
          op: Oper.connect_transport,
          d: {
            sessionId: useTokenStore.getState().sessionId,
            transportId: useMediaStore.getState().sendTransport?.id,
            dtlsParameters,
          },
        });
      } catch (error) {
        console.error("handleTransportConnectEvent() failed [error:%o]", error);
        errback(error);
      }
    }
  );

  sendTransport?.on(
    "produce",
    async ({ kind, rtpParameters }, callback, errback) => {
      console.log("handleTransportProduceEvent()");
      try {
        const action = async (json: any) => {
          console.log("handleTransportProduceEvent callback [data:%o]", json);
          callback({ id: json.id });
          queue.delete("produce");
        };

        queue.set("produce", action);

        wsend({
          op: Oper.produce,
          d: {
            sessionId: useTokenStore.getState().sessionId,
            transportId: useMediaStore.getState().sendTransport?.id,
            kind,
            rtpParameters,
          },
        });
      } catch (error) {
        console.error("handleTransportProduceEvent() failed [error:%o]", error);
        errback(error);
      }
    }
  );

  sendTransport?.on(
    "connectionstatechange",
    (connectionState: ConnectionState) => {
      console.log(
        "send transport connection state change [state:%s]",
        connectionState
      );
      useMediaSoupConnectionState.getState().setStatus(connectionState);

      switch (connectionState) {
        case "connected":
          ShowToast("WebRTC is connected", "info");
          break;
        case "connecting":
          ShowToast("WebRTC is connecting...", "warning");
          break;
        case "disconnected":
          ShowToast("WebRTC is disconnected", "error");
          break;
        case "failed":
          ShowToast("WebRTC is connection failed", "error");
          break;
        default:
          break;
      }
    }
  );
};

export const handleCloseWebRTCConnection = (msg: any) => {
  console.log("closing webrtc...");
  useMediaStore
    .getState()
    .mediaStream?.getTracks()
    .forEach((t) => t.stop());
  useMediaStore.getState().sendTransport?.close();
  useMediaStore.getState().producers.forEach((p) => p.close());
  useMediaStore.getState().nullify();
};

const getMediaStream = async () => {
  try {
    const mediaStream = await getUserMedia();
    useMediaStore.getState().set({ mediaStream });

    const device = useMediaStore.getState().device;

    const videoTrack = mediaStream.getVideoTracks()[0];
    const audioTrack = mediaStream.getAudioTracks()[0];

    const sendTransport = useMediaStore.getState().sendTransport;
    const producers = useMediaStore.getState().producers;

    if (videoTrack) {
      const videoProducer: any = await sendTransport?.produce({
        track: videoTrack,
        codec: device?.rtpCapabilities.codecs?.find(
          (codec) => codec.mimeType.toLowerCase() === "video/vp8"
        ),
      });
      producers.push(videoProducer);
    }
    if (audioTrack) {
      const audioProducer: any = await sendTransport?.produce({
        track: audioTrack,
      });
      producers.push(audioProducer);
    }
  } catch (err) {
    ShowToast(err.toString(), "error");
    console.log(err);
  }
};
