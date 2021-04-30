import { Router, Worker } from "mediasoup/lib/types";
import WebSocket from "ws";
import logger from "../../logging/Logger";
import { Oper, WsParam } from "../../types";
import FFmpeg from "../../webrtc/FFmpeg";
import { createRoom, createTransportWebRTC } from "../../webrtc/mediaSoupStart";
import Peer from "../../webrtc/Peer";
import {
  deleteMediaFile,
  publishProducerRtpStream,
  releasePort,
} from "../../webrtc/utils";
import events from "events";

export const emitter = new events.EventEmitter();

export const rooms = new Map<
  string,
  { worker: Worker; router: Router; state: Map<string, Peer> }
>();

export const streamingSessions = new Map<
  string,
  { userId: string; userName: string; fileName: string }
>();

export const handleSocketResponse = async (
  json: WsParam,
  wss: WebSocket.Server,
) => {
  const { op, d } = json;

  switch (op) {
    case Oper.router_rtp_capabilities:
      return await routerRtpCapabilitiesHanlde(d);
    case Oper.create_transport:
      return await createTransportHandle(d);
    case Oper.connect_transport:
      return await connectTransportHandle(d);
    case Oper.produce:
      return await produceRequestHandle(d);
    case Oper.start_stream:
      return await handleStartStreaming(d, wss);
    case Oper.stop_stream:
      return await hanldeStopStreaming(d, wss);
    case Oper.close_webrtc:
      return await closeWebRTCConnection(d, wss);
    case Oper.get_streaming_sessions:
      broadCastSessions(wss);
      break;
    default:
      logger.error(`WEBSOCKET | UNKOWN MESSAGE | ${JSON.stringify(json)}`);
      return {
        op: Oper.error,
        d: {
          message: "Unknown Socket Message",
        },
      };
  }
};

const routerRtpCapabilitiesHanlde = async (msg: any) => {
  const { sessionId } = msg;
  if (!rooms.has(sessionId)) {
    rooms.set(sessionId, createRoom());
  }
  const { state, router } = rooms.get(sessionId);
  state.set(sessionId, new Peer(sessionId));

  console.log("router.rtpCapabilities:", router.rtpCapabilities);

  return {
    op: Oper.router_rtp_capabilities,
    d: {
      routerRtpCapabilities: router.rtpCapabilities,
    },
  };
};

const createTransportHandle = async (msg: any) => {
  const { sessionId } = msg;
  const { state, router } = rooms.get(sessionId);
  const peer = state.get(sessionId);

  const transport = await createTransportWebRTC(router);

  peer.addTransport(transport);

  return {
    op: Oper.create_transport,
    d: {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
      sctpParameters: transport.sctpParameters,
    },
  };
};

const connectTransportHandle = async (msg: any) => {
  const { sessionId, dtlsParameters, transportId } = msg;

  const { state } = rooms.get(sessionId);
  const peer = state.get(sessionId);

  const transport = peer.getTransport(transportId);
  if (!transport) {
    throw new Error(`Transport with id ${transportId} was not found`);
  }

  await transport.connect({ dtlsParameters });

  return {
    op: Oper.connect_transport,
    d: {},
  };
};

const produceRequestHandle = async (msg: any) => {
  console.log("handleProduceRequest [data:%o]", msg);
  const { sessionId, kind, transportId, rtpParameters } = msg;

  const { state } = rooms.get(sessionId);
  const peer = state.get(sessionId);

  if (!peer) {
    throw new Error(`Peer with id ${sessionId} was not found`);
  }

  const transport = peer.getTransport(transportId);
  if (!transport) {
    throw new Error(`Transport with id ${transportId} was not found`);
  }

  const producer = await transport.produce({
    kind,
    rtpParameters,
  });

  peer.addProducer(producer);

  return {
    op: Oper.produce,
    d: {
      id: producer.id,
      kind: producer.kind,
    },
  };
};

const handleStartStreaming = async (msg: any, wss: WebSocket.Server) => {
  const { sessionId, userId, userName } = msg;
  let recordInfo: any = {};

  if (!rooms.has(sessionId)) {
    throw new Error(`room with not found for session id: ${sessionId}`);
  }
  const { state, router } = rooms.get(sessionId);
  const peer = state.get(sessionId);

  if (!peer) {
    throw new Error(`peer with not found for session id: ${sessionId}`);
  }

  for (const producer of peer.producers) {
    recordInfo[producer.kind] = await publishProducerRtpStream(
      peer,
      router,
      producer,
    );
  }

  recordInfo.fileName = `${userId}__${Date.now().toString()}`;

  peer.process = new FFmpeg(recordInfo);

  logger.info(`WEBSOCKET | STREAMING SESSIONS | ${streamingSessions.size}`);
  console.log(streamingSessions);

  setTimeout(async () => {
    for (const consumer of peer.consumers) {
      await consumer.resume();
    }
  }, 1000);

  setTimeout(() => {
    emitter.emit("ffmpeg", recordInfo.fileName);

    if (peer.process) {
      streamingSessions.set(sessionId, {
        userId,
        userName,
        fileName: recordInfo.fileName,
      });

      broadCastSessions(wss);
    }
  }, 10000);

  return {
    op: Oper.start_stream,
    d: {
      fileName: recordInfo.fileName,
    },
  };
};

const hanldeStopStreaming = async (msg: any, wss: WebSocket.Server) => {
  const { sessionId, userId, fileName } = msg;

  if (!rooms.has(sessionId)) {
    throw new Error(`room with not found for session id: ${sessionId}`);
  }
  const { state, router } = rooms.get(sessionId);
  const peer = state.get(sessionId);

  if (!peer) {
    throw new Error(`peer with not found for session id: ${sessionId}`);
  }
  peer.process.kill();
  peer.process = undefined;

  for (const remotePort of peer.remotePorts) {
    releasePort(remotePort);
  }

  peer.remotePorts = [];

  await deleteMediaFile(sessionId, fileName, wss);

  return {
    op: Oper.stop_stream,
    d: {},
  };
};

const closeWebRTCConnection = async (msg: any, wss: WebSocket.Server) => {
  const { sessionId, fileName } = msg;
  if (rooms.has(sessionId)) {
    const { state } = rooms.get(sessionId);

    if (state.has(sessionId)) {
      const {
        transports,
        producers,
        consumers,
        remotePorts,
        process,
      } = state.get(sessionId);
      transports.forEach((t) => t.close());
      producers.forEach((p) => p.close());
      consumers.forEach((c) => c.close());

      if (process) {
        process.kill();
      }

      for (const remotePort of remotePorts) {
        releasePort(remotePort);
      }

      rooms.delete(sessionId);

      await deleteMediaFile(sessionId, fileName, wss);

      return {
        op: Oper.close_webrtc,
        d: {},
      };
    }
  }
};

emitter.on(
  "file-deleted",
  async ({ sessionId, wss }: { sessionId: string; wss: WebSocket.Server }) => {
    logger.info(
      `WEBSOCKET | STREAMING SESSIONS | BEFORE DELETE | ${streamingSessions.size}`,
    );
    console.log(streamingSessions);

    if (streamingSessions.has(sessionId)) {
      streamingSessions.delete(sessionId);
      broadCastSessions(wss);
    }

    logger.info(
      `WEBSOCKET | STREAMING SESSIONS | AFTER DELETE | ${streamingSessions.size}`,
    );
    console.log(streamingSessions);
  },
);

const broadCastSessions = (wss: WebSocket.Server) => {
  wss.clients.forEach((c) => {
    c.send(
      JSON.stringify({
        op: Oper.streaming_sessions,
        d: Object.fromEntries(streamingSessions),
      }),
    );
  });
};
