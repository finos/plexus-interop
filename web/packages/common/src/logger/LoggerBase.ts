/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as log from "loglevel";
import { Logger } from "./Logger";
import { LogLevel } from "./LoggerFactory";

export class LoggerBase implements Logger {

    constructor(public name: string = "Anonymous") { }

    public debug(msg: string, ...args: any[]): void {
        /* istanbul ignore if */
        if (log.getLevel() <= LogLevel.DEBUG) {
            log.info(`${this.name} ${msg}`, args);
        }
    }

    public info(msg: string, ...args: any[]): void {
        log.info(`${this.name} ${msg}`, args);
    }

    public error(msg: string, ...args: any[]): void {
        log.error(`${this.name} ${msg}`, args);
    }

    public warn(msg: string, ...args: any[]): void {
        log.info(`${this.name} ${msg}`, args);
    }

    public trace(msg: string, ...args: any[]): void {
        /* istanbul ignore if */        
        if (log.getLevel() <= LogLevel.TRACE) {
            log.info(`${this.name} ${msg}`, args);
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
