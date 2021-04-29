import amqp, { Connection } from "amqplib";
import events from "events";

const retryInterval = 5000;

export const emitter = new events.EventEmitter();

export async function startRabbitMQ() {
  console.log(
    "connecting to: ",
    process.env.RABBITMQ_URL || "amqp://localhost"
  );

  let conn: Connection;

  try {
    conn = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
    console.log("connected...");
  } catch (err) {
    console.error("Unable to connect to RabbitMQ: ", err);
    setTimeout(async () => await startRabbitMQ(), retryInterval);
    return;
  }

  conn.on("close", async function (err) {
    console.error("Rabbit connection closed with error: ", err);
    setTimeout(async () => await startRabbitMQ(), retryInterval);
  });

  const channel = await conn.createChannel();
  const recvQueue = "ffmpeg";
  await channel.assertQueue(recvQueue);
  await channel.purgeQueue(recvQueue);
  await channel.consume(
    recvQueue,
    async (msg: any) => {
      if (msg) {
        const content = msg.content.toString();
        const json = JSON.parse(content);

        if (json.action === "start") {
          console.log("msg received: ", json.fileName);
          emitter.emit("ffmpeg", json.fileName);
        }

        if (json.action === "stop") {
          console.log("msg received: ", json.fileName);
          emitter.emit("stop", json.fileName);
        }
      }
    },
    { noAck: true }
  );
}
