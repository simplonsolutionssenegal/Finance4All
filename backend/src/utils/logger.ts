import winston from 'winston';
import type { Request, Response } from 'express';

const logLevel = process.env.LOG_LEVEL ?? 'info';
const isDevelopment = process.env.NODE_ENV === 'development';

// Format JSON « propre » pour fichiers / prod
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Format console lisible en dev
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => {
    // typage sûr du payload winston
    const { timestamp, level, message, ...rest } = info as winston.Logform.TransformableInfo & {
      timestamp?: string;
      level: string;
      message: string;
    };

    let log = `${timestamp ?? ''} [${level}]: ${String(message)}`;

    const meta = rest as Record<string, unknown>;
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

// Transports
const transports: winston.transport[] = [];

// Console: toujours actif
transports.push(
  new winston.transports.Console({
    format: isDevelopment ? consoleFormat : logFormat,
    level: logLevel
  })
);

// Fichiers: uniquement en prod
if (!isDevelopment) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5
    })
  );
}

// Logger
export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  exitOnError: false
});

// --------- Helpers ---------

// Log d'une requête HTTP (Express)
export const logRequest = (req: Request, res: Response, responseTime: number): void => {
  logger.info('Request processed', {
    method: req.method,
    url: req.originalUrl ?? req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
};

// Log d'une erreur applicative
export const logError = (error: Error, req?: Request): void => {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    url: req?.originalUrl ?? req?.url,
    method: req?.method,
    body: req?.body,
    params: req?.params,
    query: req?.query
  });
};

// Stream compatible morgan
export const loggerStream = {
  write(message: string): void {
    logger.info(message.trim());
  }
};
