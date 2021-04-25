import { Logger, QueryRunner } from "typeorm"
import logger from "./Logger"

export class TypeOrmLogger implements Logger {
  log(level: "log" | "info" | "warn", message: any, queryRunner?: QueryRunner): any {
    logger.info(`TYPEORM_LOG | ${message}`)
  }

  logMigration(message: string, queryRunner?: QueryRunner): any {
    logger.info(`TYPEORM_LOG | MIGRATION |${message}`)
  }

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    logger.info(`TYPEORM_LOG | QUERY | ${query.replace(/\s+/g, " ").trim()} | ${parameters}`)
  }

  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    logger.error(`TYPEORM_LOG | ERROR | ${error} | ${query.replace(/\s+/g, " ").trim()} | ${parameters}`)
  }

  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    logger.error(`TYPEORM_LOG | QUERY_TIME | ${time} | ${query.replace(/\s+/g, " ").trim()} | ${parameters}`)
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner): any {
    logger.info(`TYPEORM_LOG | SCHEMA_BUILD |${message}`)
  }
}
