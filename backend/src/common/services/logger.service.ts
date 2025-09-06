import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private logLevel: LogLevel;

  constructor() {
    const envLogLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    this.logLevel =
      LogLevel[envLogLevel as keyof typeof LogLevel] ?? LogLevel.INFO;
  }

  private formatMessage(
    level: string,
    message: string,
    context?: string,
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    return `${timestamp} [${level}]${contextStr} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  log(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', message, context));
    }
  }

  error(message: string, trace?: string, context?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message, context));
      if (trace) {
        console.error(trace);
      }
    }
  }

  warn(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  debug(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  verbose(message: string, context?: string): void {
    this.debug(message, context);
  }
}
