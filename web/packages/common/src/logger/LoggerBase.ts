/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as log from 'loglevel';
import { Logger, LoggerDelegate } from './Logger';
import { LogLevel } from './LoggerFactory';

export class LoggerBase implements Logger, LoggerDelegate {

    constructor(
        public name: string,
        private loggerDelegates: LoggerDelegate[]
    ) { }

    public debug(msg: string, ...args: any[]): void {
        /* istanbul ignore if */
        if (log.getLevel() <= LogLevel.DEBUG) {
            this.log(LogLevel.DEBUG, msg, args);
        }
    }

    public info(msg: string, ...args: any[]): void {
        this.log(LogLevel.INFO, msg, args);
    }

    public error(msg: string, ...args: any[]): void {
        this.log(LogLevel.ERROR, msg, args);
    }

    public warn(msg: string, ...args: any[]): void {
        this.log(LogLevel.INFO, msg, args);
    }

    public trace(msg: string, ...args: any[]): void {
        /* istanbul ignore if */
        if (log.getLevel() <= LogLevel.TRACE) {
            this.log(LogLevel.TRACE, msg, args);
        }
    }

    public log(logLevel: LogLevel, msg: string, args: any[]): void {

        let actualMessage = `${this.name} ${msg}`;

        switch (logLevel) {
            case LogLevel.TRACE: 
                log.trace(actualMessage, args); 
                break;
            case LogLevel.DEBUG: 
                log.debug(actualMessage, args); 
                break;
            case LogLevel.INFO: 
                log.info(actualMessage, args); 
                break;
            case LogLevel.WARN: 
                log.warn(actualMessage, args); 
                break;
            case LogLevel.ERROR: 
                log.warn(actualMessage, args); 
                break;
            case LogLevel.SILENT: 
                /* be silent */
                break;
            default: 
                throw `Unkown LogLevel: ${logLevel}`;
        }
        try {
            this.loggerDelegates.forEach(logger => logger.log(logLevel, msg, args));
        }
        catch (error) {
            this.error(`Error in log delegates: ${error}. Swallowed.`);
        }
        
    }

    public getLogLevel(): LogLevel {
        return log.getLevel();
    }

    public isDebugEnabled(): boolean {
        return this.getLogLevel() <= LogLevel.DEBUG;
    }

    public isTraceEnabled(): boolean {
        return this.getLogLevel() <= LogLevel.TRACE;
    }
}
