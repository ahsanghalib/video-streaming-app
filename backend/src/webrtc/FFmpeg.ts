import { createSdpText } from "./createSdpText";
import { convertStringToStream } from "./utils";
import { EventEmitter } from "events";
import child_process from "child_process";
import logger from "../logging/Logger";

const FILE_LOCATION_PATH = process.env.FILE_LOCATION_PATH || "../files";

class FFmpeg {
  _rtpParameters: any;
  _process: any;
  _observer: any;

  constructor(rtpParameters: any) {
    this._rtpParameters = rtpParameters;
    this._process = undefined;
    this._observer = new EventEmitter();
    this._createProcess();
  }

  _createProcess() {
    const sdpString = createSdpText(this._rtpParameters);
    const sdpStream = convertStringToStream(sdpString);

    logger.info(`FFMPEG | createProcess() STREAMING [sdpString:%${sdpString}]`);

    this._process = child_process.spawn("ffmpeg", this._commandArgs);

    if (this._process.stderr) {
      this._process.stderr.setEncoding("utf-8");
      this._process.stderr.on(
        "data",
        (data: any) => {},
        // console.log("ffmpeg::process::data [data:%o]", data),
      );
    }

    if (this._process.stdout) {
      this._process.stdout.setEncoding("utf-8");
      this._process.stdout.on(
        "data",
        (data: any) => {},
        // console.log("ffmpeg::process::data [data:%o]", data),
      );
    }

    this._process.on("message", (message: any) =>
      console.log("ffmpeg::process::message [message:%o]", message),
    );

    this._process.on("error", (error: any) =>
      logger.error(`FFMPEG | ffmpeg::process::error [error:%${error}]`),
    );

    this._process.once("close", () => {
      logger.info("FFMPEG | ffmpeg::process::close");
      this._observer.emit("process-close");
    });

    sdpStream.on("error", (error) =>
      logger.error(`FFMPEG | sdpStream::error [error:%${error}]`),
    );

    sdpStream.resume();
    sdpStream.pipe(this._process.stdin);
  }

  kill() {
    logger.info(`FFMPEG | kill() [pid:%${this._process.pid}]`);
    this._process.kill("SIGINT");
  }

  get _commandArgs() {
    let commandArgs = [
      "-loglevel",
      "debug",
      "-protocol_whitelist",
      "pipe,udp,rtp",
      "-fflags",
      "+genpts",
      "-f",
      "sdp",
      "-i",
      "pipe:0",
    ];

    commandArgs = commandArgs.concat(this._videoArgs);
    commandArgs = commandArgs.concat(this._audioArgs);

    commandArgs = commandArgs.concat([
      "-flags",
      "+global_header",
      `${FILE_LOCATION_PATH}/${this._rtpParameters.fileName}.webm`,
    ]);

    return commandArgs;
  }

  get _videoArgs() {
    return ["-map", "0:v:0", "-c:v", "copy"];
  }

  get _audioArgs() {
    return [
      "-map",
      "0:a:0",
      "-strict", // libvorbis is experimental
      "-2",
      "-c:a",
      "copy",
    ];
  }
}

export default FFmpeg;
