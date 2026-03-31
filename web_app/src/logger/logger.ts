import { Prisma } from '@/generated/prisma/client';
import winston from 'winston';

const { combine, timestamp, json, colorize, align, errors } = winston.format;

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'user-service' },
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [
    new winston.transports.Console({
      format: combine(
        errors({ stack: true }),
        colorize({ all: true }),
        timestamp(),
        align(),
      ),
    }),
  ],
});

const prisma_error_instance = [
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientRustPanicError,
  Prisma.PrismaClientValidationError,
];

export function logError(err: unknown, context: Record<string, unknown> = {}) {
  if (err instanceof Error) {
    if (prisma_error_instance.some((cls) => err instanceof cls)) {
      const maxLength = Number(process.env.MAX_LOG_ERROR_MESSAGE_LENGTH) || 200;
      const truncatedMessage = err.message.slice(0, maxLength);

      logger.error(`Prisma Error Occurred: ${truncatedMessage}...`, {
        name: err.name,
        clientVersion: (err as { clientVersion?: string }).clientVersion,
        ...context,
      });
    } else {
      logger.error(err.message, {
        name: err.name,
        ...context,
      });
    }
  } else {
    logger.error('Unknown error', { error: String(err), ...context });
  }
}
