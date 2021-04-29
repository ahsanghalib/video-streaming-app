import fs from "fs-extra";
import { startRabbitMQ } from "./startRabbirMQ";
import { emitter } from "./startRabbirMQ";
import appRoot from "app-root-path";
import rtmpFFmpeg from "./rtmpFFmpeg";

const process = new Map<string, any>();

const getFilesPath = () => {
  let appPath = appRoot.path.split("/");
  appPath[appPath.length - 1] = "files";
  return appPath.join("/");
};

emitter.on("ffmpeg", async (fileName) => {
  const filePath = `${getFilesPath()}/${fileName}.webm`;

  fs.access(filePath, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("streaming....");
    const p = new rtmpFFmpeg(fileName, filePath);
    process.set(fileName, p);
  });
});

emitter.on("process-close", async (fileName) => {
  if (process.has(fileName)) {
    const filePath = `${getFilesPath()}/${fileName}.webm`;
    process.delete(fileName);

    fs.access(filePath, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log("re-streaming....");
      const p = new rtmpFFmpeg(fileName, filePath);
      process.set(fileName, p);
    });
  }
});

emitter.on("stop", async (fileName) => {
  if (process.has(fileName)) {
    const p = process.get(fileName);
    p.kill();
    process.delete(fileName);
  }
});

async function main() {
  try {
    await startRabbitMQ();
  } catch (err) {
    console.log(err);
  }
}

main();
