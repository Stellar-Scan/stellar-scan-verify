import pino from 'pino';
export const log = (level: string) => pino({ level });
