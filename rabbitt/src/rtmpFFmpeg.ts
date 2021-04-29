import child_process from "child_process";
import { emitter } from "./startRabbirMQ";

class rtmpFFmpeg {
  _fileName: string;
  _filePath: string;
  _process: any;
  _observer: any;

  constructor(fileName: string, path: string) {
    this._fileName = fileName;
    this._filePath = path;
    this._process = undefined;
    this._observer = emitter;
    this._createProcess();
  }

  _createProcess() {
    console.log(`RTMP FFMPEG | Live streaming....`);

    console.log(this._filePath);
    console.log(this._fileName);

    this._process = child_process.spawn("ffmpeg", this._commandArgs);

    if (this._process.stderr) {
      this._process.stderr.setEncoding("utf-8");
      this._process.stderr.on(
        "data",
        (data: any) => {}
        // console.log("ffmpeg::process::data [data:%o]", data)
      );
    }

    if (this._process.stdout) {
      this._process.stdout.setEncoding("utf-8");
      this._process.stdout.on(
        "data",
        (data: any) => {}
        // console.log("ffmpeg::process::data [data:%o]", data)
      );
    }

    this._process.on("message", (message: any) =>
      console.log("rtmp ffmpeg::process::message [message:%o]", message)
    );

    this._process.on("error", (error: any) =>
      console.log(`rtmp FFMPEG | ffmpeg::process::error [error:%${error}]`)
    );

    this._process.once("close", () => {
      console.log("rtmp FFMPEG | ffmpeg::process::close");
      this._observer.emit("process-close", this._fileName);
    });
  }

  kill() {
    console.log(`RTMP FFMPEG | kill() [pid:%${this._process.pid}]`);
    this._process.kill("SIGINT");
  }

  get _commandArgs() {
    let commandArgs = [
      "-re",
      "-i",
      this._filePath,
      "-vcodec",
      "libx264",
      "-vprofile",
      "baseline",
      "-g",
      "30",
      "-acodec",
      "aac",
      "-strict",
      "-2",
      "-f",
      "flv",
      "-flvflags",
      "no_duration_filesize",
      `rtmp://127.0.0.1/live/${this._fileName}`,
    ];

    return commandArgs;
  }
}

export default rtmpFFmpeg;
