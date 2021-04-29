import {
  RtpCodecCapability,
  TransportListenIp,
  WorkerLogTag,
} from "mediasoup/lib/types";

export const config = {
  worker: {
    rtcMinPort: 40000,
    rtcMaxPort: 49999,
    logLevel: "debug",
    logTags: ["rtp", "srtp", "rtcp"] as WorkerLogTag[],
  },
  router: {
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/VP9",
        clockRate: 90000,
        parameters: {
          "profile-id": 2,
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/H264",
        clockRate: 90000,
        parameters: {
          "packetization-mode": 1,
          "profile-level-id": "4d0032",
          "level-asymmetry-allowed": 1,
          "x-google-start-bitrate": 1000,
        },
      },
    ] as RtpCodecCapability[],
  },

  webRtcTransport: {
    listenIps: [
      {
        ip: process.env.WEBRTC_LISTEN_IP || "127.0.0.1",
        announcedIp: process.env.A_IP || null,
      },
    ] as TransportListenIp[],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    maxIncomingBitrate: 1500000,
  },
  plainRtpTransport: {
    listenIp: {
      ip: process.env.WEBRTC_LISTEN_IP || "127.0.0.1",
      announcedIp: process.env.A_IP || null,
    },
    rtcpMux: true,
    comedia: false,
  },
} as const;
