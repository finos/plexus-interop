import { LogLevel } from "./LoggerFactory";
import { Logger } from "./Logger";

export class DelegatingLogger implements Logger {
    constructor(
        private mainLogger: Logger,
        private additionalRecipients: Logger[]
    ) {

    }

    public debug(msg: string, ...args: any[]): void {
        this.recipients.forEach(logger => logger.debug(msg, args));
    }

    public info(msg: string, ...args: any[]): void {
        this.recipients.forEach(logger => logger.debug(msg, args));
    }

    public error(msg: string, ...args: any[]): void {
        this.recipients.forEach(logger => logger.error(msg, args));
    }

    public warn(msg: string, ...args: any[]): void {
        this.recipients.forEach(logger => logger.warn(msg, args));
    }

    public trace(msg: string, ...args: any[]): void {
        this.recipients.forEach(logger => logger.trace(msg, args));
    }

    public getLogLevel(): LogLevel {
        return this.mainLogger.getLogLevel();
    }

    public isDebugEnabled(): boolean {
        return this.mainLogger.isDebugEnabled();
    }

    public isTraceEnabled(): boolean {
        return this.mainLogger.isTraceEnabled();
    }

    private get recipients(): Logger[] {
        return [this.mainLogger, ...this.additionalRecipients];
    }
}