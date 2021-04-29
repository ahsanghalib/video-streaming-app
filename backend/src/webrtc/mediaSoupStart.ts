import * as mediasoup from "mediasoup";
import { Router, WebRtcTransport, Worker } from "mediasoup/lib/types";
import os from "os";
import logger from "../logging/Logger";
import { config } from "./mediaSoupConfig";
import Peer from "./Peer";

const workers: Array<{
  worker: Worker;
  router: Router;
}> = [];

let workerIdx = 0;

export const initializeWorkers = async () => {
  const { logLevel, logTags, rtcMinPort, rtcMaxPort } = config.worker;

  logger.info(
    `MEDIASOUP | initializeWorkers() creating ${
      Object.keys(os.cpus()).length
    } mediasoup workers `,
  );

  for (let i = 0; i < Object.keys(os.cpus()).length; i++) {
    const worker: Worker = await mediasoup.createWorker({
      logLevel,
      logTags,
      rtcMinPort,
      rtcMaxPort,
    });

    worker.on("died", () => {
      console.error(
        "worker::died worker has died exiting in 2 seconds... [pid:%d]",
        worker.pid,
      );
      console.error("mediasoup worker died (this should never happen)");
      setTimeout(() => process.exit(1), 2000);
    });

    logger.info(
      `MEDIASOUP | createRouter() creating new router [worker.pid: ${worker.pid}] `,
    );

    const router = await worker.createRouter({
      mediaCodecs: config.router.mediaCodecs,
    });

    workers.push({ worker, router });
  }
};

// export const createRouter = async () => {
//   const worker = getNextWorker();
//   logger.info(
//     `MEDIASOUP | createRouter() creating new router [worker.pid: ${worker.pid}] `,
//   );
//   return await worker.createRouter({ mediaCodecs: config.router.mediaCodecs });
// };

export const createTransportWebRTC = async (router: Router, options?: any) => {
  logger.info(`MEDIASOUP | createTransportWebRTC() [options: ${options}]`);
  return await router.createWebRtcTransport(config.webRtcTransport);
};

export const createTransportPlain = async (router: Router, options?: any) => {
  logger.info(`MEDIASOUP | createTransportPlain() [options: ${options}]`);
  return await router.createPlainRtpTransport(config.plainRtpTransport);
};

const getNextWorker = () => {
  const w = workers[workerIdx];
  workerIdx++;
  workerIdx %= workers.length;
  return w;
};

export const createRoom = () => {
  const { worker, router } = getNextWorker();
  return { worker, router, state: new Map<string, Peer>() };
};
