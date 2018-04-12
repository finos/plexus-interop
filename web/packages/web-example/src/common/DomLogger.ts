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
import { Logger, LoggerFactory, LogLevel } from '@plexus-interop/common';

export class DomLogger implements Logger {

    constructor(
        private domElId: string,
        private baseLogger: Logger = LoggerFactory.getLogger('DomLogger')) {
    }

    public debug(msg: string, ...args: any[]): void {
        this.baseLogger.debug(msg, args);
    }

    public info(msg: string, ...args: any[]): void {
        this.appendString(`INFO: ${msg}`);
        this.baseLogger.info(msg, args);
    }

    public error(msg: string, ...args: any[]): void {
        this.baseLogger.error(msg, args);
    }

    public warn(msg: string, ...args: any[]): void {
        this.baseLogger.warn(msg, args);
    }

    public trace(msg: string, ...args: any[]): void {
        this.baseLogger.trace(msg, args);
    }

    private appendString(text: string) {
        const domEl = document.getElementById(this.domElId);
        if (domEl) {
            domEl.innerText = domEl.innerText + '\n' + text;
        }
    }

    public getLogLevel(): LogLevel {
        return this.baseLogger.getLogLevel();
    }

    public isDebugEnabled(): boolean {
        return this.baseLogger.getLogLevel() <= LogLevel.DEBUG;
    }

    public isTraceEnabled(): boolean {
        return this.baseLogger.getLogLevel() <= LogLevel.TRACE;
    }

}