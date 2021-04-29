import { createConnection } from "typeorm";
import logger from "./logging/Logger";
import { TypeOrmLogger } from "./logging/TypeOrmLogger";

const connectToDB = async () => {
  logger.info(`DB_CONNECTION | Connecting to ${process.env.DATABASE_URL}`);
  await createConnection({
    name: "default",
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
    dropSchema: false,
    // ssl: process.env.NODE_ENV === "development" ? false : true,
    // extra: {
    //   ssl: {
    //     rejectUnauthorized: false,
    //   },
    // },
    entities: [
      process.env.NODE_ENV === "development"
        ? "src/entity/**/*.ts"
        : "dist/entity/**/*.js",
    ],
    migrations: [
      process.env.NODE_ENV === "development"
        ? "src/migration/**/*.ts"
        : "dist/migration/**/*.js",
    ],
    subscribers: [
      process.env.NODE_ENV === "development"
        ? "src/subscriber/**/*.ts"
        : "dist/subscriber/**/*.js",
    ],
    cli: {
      entitiesDir:
        process.env.NODE_ENV === "development" ? "src/entity" : "dist/entity",
      migrationsDir:
        process.env.NODE_ENV === "development"
          ? "src/migration"
          : "dist/migration",
      subscribersDir:
        process.env.NODE_ENV === "development"
          ? "src/subscriber"
          : "dist/subscriber",
    },
    logger: new TypeOrmLogger(),
  });
  logger.info("DB_CONNECTION | DB Connected");
};

export default connectToDB;
