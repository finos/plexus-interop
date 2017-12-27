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

export interface Logger {

    debug(msg: string, ...args: any[]): void;

    info(msg: string, ...args: any[]): void;

    error(msg: string, ...args: any[]): void;

    warn(msg: string, ...args: any[]): void;

    trace(msg: string, ...args: any[]): void;

    getLogLevel(): LogLevel;

    isDebugEnabled(): boolean;

    isTraceEnabled(): boolean;
}

export interface LoggerDelegate {
    log(logLevel: LogLevel, msg: string, ...args: any[]): void;
}