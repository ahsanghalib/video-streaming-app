import dayjs from "dayjs";
import uniqid from "uniqid";
import { createLogger, format, transports } from "winston";

const options = {
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const myFormat = format.printf(
  (info: any) =>
    `${info.level} | ${uniqid("LOG_ID ")} | ${dayjs(new Date()).format(
      "YYYY-MM-DD HH:mm:ss.mss",
    )} | ${info.message}`,
);

const logger = createLogger({
  format: format.combine(myFormat),
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.align(),
        myFormat,
      ),
    }),
  ],
  exitOnError: false,
});

export class LoggerStream {
  write(message: string) {
    logger.info(message.substring(0, message.lastIndexOf("\n")));
  }
}

export default logger;
