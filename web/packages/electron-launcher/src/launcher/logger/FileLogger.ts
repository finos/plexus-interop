/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
import { Logger, LogLevel } from '@plexus-interop/common';
import * as fs from 'fs';
import * as util from 'util';

export class FileLogger implements Logger {

    private logFile: any;

    constructor(private baseLogger: Logger, fileName: string = 'plexus-electron-launcher.log') {
        fileName = `${process.cwd()}/${fileName}`;
        this.logFile = fs.createWriteStream(fileName, { flags: 'w' });
        this.baseLogger.info(`Writing log to ${fileName}`);
    }

    public debug(msg: string, ...args: any[]): void {
        this.baseLogger.debug(msg, args);
        this.log(`[DEBUG] | ${msg}`);
    }

    public info(msg: string, ...args: any[]): void {
        this.baseLogger.info(msg, args);
        this.log(msg);
    }

    public error(msg: string, ...args: any[]): void {
        this.baseLogger.error(msg, args);
        this.log('[ERROR] | ' + msg);
    }

    public warn(msg: string, ...args: any[]): void {
        this.baseLogger.warn('[WARN] |' + msg, args);
        this.log(msg);
    }

    public trace(msg: string, ...args: any[]): void {
        this.baseLogger.trace(msg, args);
        this.log('[TRACE] | ' + msg);
    }

    public getLogLevel(): LogLevel {
        return this.baseLogger.getLogLevel();
    }

    public isDebugEnabled(): boolean {
        return this.getLogLevel() <= LogLevel.DEBUG;
    }

    public isTraceEnabled(): boolean {
        return this.getLogLevel() <= LogLevel.TRACE;
    }

    private log(msg: string): void {
        this.logFile.write(util.format(`${new Date().toISOString()} ${msg}${'\n'}`));
    }

}