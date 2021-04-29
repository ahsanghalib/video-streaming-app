import amqp, { Connection } from "amqplib";
import { emitter } from "./controllers/socket";
import logger from "./logging/Logger";

const retryInterval = 5000;

export const startRabbitMQ = async () => {
  logger.info(
    `RABBIT MQ | trying to connect to: | ${
      process.env.RABBITMQ_URL || "amqp://localhost"
    }`,
  );

  let conn: Connection;

  try {
    conn = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
    logger.info("RABBITMQ | CONNECTED.");
  } catch (err) {
    logger.error(`RABBITMQ | Unable to connect to RabbitMQ: ${err}`);
    console.error("Unable to connect to RabbitMQ: ", err);
    setTimeout(async () => await startRabbitMQ(), retryInterval);
    return;
  }

  conn.on("close", async function (err: Error) {
    logger.error(`RABBITMQ | Unable to connect to RabbitMQ: ${err}`);
    console.error("Rabbit connection closed with error: ", err);
    setTimeout(async () => await startRabbitMQ(), retryInterval);
  });

  const channel = await conn.createChannel();
  const sendQueue = "ffmpeg";
  await channel.assertQueue(sendQueue);

  emitter.on("ffmpeg", (fileName: string) => {
    logger.info(`RABBIT MQ | EVENT RECEIVED | START |${fileName}`);
    channel.sendToQueue(
      sendQueue,
      Buffer.from(
        JSON.stringify({ action: "start", fileName: fileName }),
        "utf8",
      ),
    );
  });

  emitter.on("deleted", (fileName: string) => {
    logger.info(`RABBIT MQ | EVENT RECEIVED | STOP | ${fileName}`);
    channel.sendToQueue(
      sendQueue,
      Buffer.from(
        JSON.stringify({ action: "stop", fileName: fileName }),
        "utf8",
      ),
    );
  });
};
