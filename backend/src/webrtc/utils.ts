import appRoot from "app-root-path";
import fs from "fs-extra";
import {
  Producer,
  Router,
  RtpCapabilities,
  RtpCodecCapability,
} from "mediasoup/lib/types";
import net from "net";
import { Readable } from "stream";
import logger from "../logging/Logger";
import { config } from "./mediaSoupConfig";
import { createTransportPlain } from "./mediaSoupStart";
import Peer from "./Peer";
import WebSocket from "ws";
import { emitter } from "../controllers/socket";

const Socket = net.Socket;

export const convertStringToStream = (stringToConvert: any) => {
  const stream = new Readable();
  stream._read = () => {};
  stream.push(stringToConvert);
  stream.push(null);
  return stream;
};

export const getCodecInfoFromRtpParameters = (
  kind: any,
  rtpParameters: any,
) => {
  return {
    payloadType: rtpParameters.codecs[0].payloadType,
    codecName: rtpParameters.codecs[0].mimeType.replace(`${kind}/`, ""),
    clockRate: rtpParameters.codecs[0].clockRate,
    channels: kind === "audio" ? rtpParameters.codecs[0].channels : undefined,
  };
};

const MIN_PORT = 20000;
const MAX_PORT = 40000;
const TIMEOUT = 400;
const takenPortSet = new Set<number>();

export const getPort = async () => {
  let port = getRandomPort();
  while (takenPortSet.has(port)) {
    port = getRandomPort();
    try {
      await isPortOpen(port);
    } catch (error) {
      console.error("getPort() port is taken [port:%d]", port);
      takenPortSet.add(port);
    }
  }
  takenPortSet.add(port);
  return port;
};

export const releasePort = (port: number) => {
  console.log(`${port} released`);
  takenPortSet.delete(port);
};

const getRandomPort = () =>
  Math.floor(Math.random() * (MAX_PORT - MIN_PORT + 1) + MIN_PORT);

const isPortOpen = (port: number) => {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    socket.once("connect", () => resolve);
    socket.setTimeout(TIMEOUT);
    socket.once("timeout", () => reject);
    socket.once("error", (error) => reject());
    socket.connect(port, "127.0.0.1");
  });
};

export const publishProducerRtpStream = async (
  peer: Peer,
  router: Router,
  producer: Producer,
) => {
  const rtpTransportConfig = config.plainRtpTransport;

  const rtpTransport = await createTransportPlain(router);
  const remoteRtpPort = await getPort();

  peer.remotePorts.push(remoteRtpPort);

  let remoteRtcpPort;

  if (!rtpTransportConfig.rtcpMux) {
    remoteRtcpPort = await getPort();
    peer.remotePorts.push(remoteRtcpPort);
  }

  await rtpTransport.connect({
    ip: "127.0.0.1",
    port: remoteRtpPort,
    rtcpPort: remoteRtcpPort,
  });

  peer.addTransport(rtpTransport);

  const codecs: RtpCodecCapability[] = [];

  const routerCodec: RtpCodecCapability = router.rtpCapabilities.codecs.find(
    (codec) => codec.kind === producer.kind,
  );

  codecs.push(routerCodec);

  const rtpCapabilities: RtpCapabilities = {
    codecs,
  };

  const rtpConsumer = await rtpTransport.consume({
    producerId: producer.id,
    rtpCapabilities,
    paused: true,
  });

  peer.consumers.push(rtpConsumer);

  return {
    remoteRtpPort,
    localRtcpPort: rtpTransport.rtcpTuple
      ? rtpTransport.rtcpTuple.localPort
      : undefined,
    rtpCapabilities,
    rtpParameters: rtpConsumer.rtpParameters,
  };
};

export const getFilesPath = () => {
  let appPath = appRoot.path.split("/");
  appPath[appPath.length - 1] = "files";
  return appPath.join("/");
};

export const deleteMediaFile = async (
  sessionId: string,
  fileName: string,
  wss: WebSocket.Server,
) => {
  const filesPath = getFilesPath();

  const timeout = setTimeout(() => {
    fs.remove(`${filesPath}/${fileName}.webm`, (err) => {
      if (err) {
        logger.error(`FILE DELETED | ERROR! | ${filesPath}/${fileName}.webm`);
        return console.log(err);
      }
      logger.info(`FILE DELETED | SUCCESS! | ${filesPath}/${fileName}.webm`);

      emitter.emit("file-deleted", { sessionId, wss });
      emitter.emit("deleted", fileName);

      clearTimeout(timeout);
    });
  }, 1 * 60 * 1000);
};
