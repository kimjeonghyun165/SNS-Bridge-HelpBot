import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class Logger implements LoggerService {
    private readonly logger;

    constructor() {
        this.logger = createLogger({
            level: 'info',
            format: format.combine(
                format.timestamp(),
                format.colorize({
                    all: true, // 모든 로그 레벨에 대해 색상을 적용합니다.
                    colors: {
                        info: 'green',   // info 레벨은 초록색
                        error: 'red',    // error 레벨은 빨간색
                        kakaoTalk: 'yellow',  // warn 레벨은 노란색
                        debug: 'blue',   // debug 레벨은 파란색
                        verbose: 'gray', // verbose 레벨은 회색
                        telegram: 'sky',
                        discord: '#7289da'
                    },
                }),
                format.printf(({ level, message, timestamp }) => {
                    return `${timestamp} [${level}] ${message}`;
                }),
            ),
            transports: [new transports.Console()],
        });
    }

    log(message: string, context?: string) {
        this.logger.log({ level: 'info', message, context });
    }

    error(message: string, trace?: string, context?: string) {
        this.logger.log({ level: 'error', message, trace, context });
    }

    warn(message: string, context?: string) {
        this.logger.log({ level: 'warn', message, context });
    }

    debug(message: string, context?: string) {
        this.logger.log({ level: 'debug', message, context });
    }

    verbose(message: string, context?: string) {
        this.logger.log({ level: 'verbose', message, context });
    }
}
