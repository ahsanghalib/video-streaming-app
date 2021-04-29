import { getCodecInfoFromRtpParameters } from "./utils";

export const createSdpText = (rtpParameters: any) => {
  const { video, audio, fileName } = rtpParameters;

  console.log("------------SDP TEXT------------");
  console.log(rtpParameters);

  // Video codec info
  const videoCodecInfo = getCodecInfoFromRtpParameters(
    "video",
    video.rtpParameters,
  );

  // Audio codec info
  const audioCodecInfo = getCodecInfoFromRtpParameters(
    "audio",
    audio.rtpParameters,
  );

  return `v=0
    o=- 0 0 IN IP4 127.0.0.1
    s=${fileName}
    c=IN IP4 127.0.0.1
    t=0 0
    m=video ${video.remoteRtpPort} RTP/AVP ${videoCodecInfo.payloadType} 
    a=rtpmap:${videoCodecInfo.payloadType} ${videoCodecInfo.codecName}/${videoCodecInfo.clockRate}
    a=sendonly
    m=audio ${audio.remoteRtpPort} RTP/AVP ${audioCodecInfo.payloadType} 
    a=rtpmap:${audioCodecInfo.payloadType} ${audioCodecInfo.codecName}/${audioCodecInfo.clockRate}/${audioCodecInfo.channels}
    a=sendonly
    `;
};
