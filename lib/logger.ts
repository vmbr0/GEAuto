/**
 * Structured logging for the scraping backend.
 * Use for: query received, job created/started/completed, failures, block detection, timing.
 */
import winston from "winston";

const { combine, timestamp, json } = winston.format;

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    json()
  ),
  defaultMeta: { service: "vehicle-search" },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === "development"
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
              return `${timestamp} [${level}] ${message}${metaStr}`;
            })
          )
        : undefined,
    }),
  ],
});

export type SearchLogMeta = {
  jobId?: string;
  queryHash?: string;
  query?: Record<string, unknown>;
  durationMs?: number;
  resultCount?: number;
  status?: string;
  failureReason?: string;
  blocked?: boolean;
};

export function logSearchEvent(event: string, message: string, meta?: SearchLogMeta): void {
  logger.info(message, { event, ...meta });
}

export function logSearchError(event: string, message: string, meta?: SearchLogMeta & { error?: string; stack?: string }): void {
  logger.error(message, { event, ...meta });
}

export function logSearchWarn(event: string, message: string, meta?: SearchLogMeta): void {
  logger.warn(message, { event, ...meta });
}
