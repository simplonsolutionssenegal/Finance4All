import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV === 'development';

// Format personnalisé pour les logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Format pour la console en développement
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

// Configuration des transports
const transports: winston.transport[] = [];

// Console transport (toujours actif)
transports.push(
  new winston.transports.Console({
    format: isDevelopment ? consoleFormat : logFormat,
    level: logLevel
  })
);

// File transports (uniquement en production)
if (!isDevelopment) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Créer le logger
export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  // Ne pas quitter le processus sur une erreur de log
  exitOnError: false
});

// Ajouter des méthodes utilitaires
export const logRequest = (req: any, res: any, responseTime: number) => {
  logger.info('Request processed', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
};

export const logError = (error: Error, req?: any) => {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    url: req?.url,
    method: req?.method,
    body: req?.body,
    params: req?.params,
    query: req?.query
  });
};

// Stream pour morgan (si utilisé)
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};
