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
import { LogLevel } from "./LoggerFactory";
import { Logger } from "./Logger";

export class DelegatingLogger implements Logger {

    constructor(
        private mainLogger: Logger,
        private additionalRecipients: Logger[]
    ) { }

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