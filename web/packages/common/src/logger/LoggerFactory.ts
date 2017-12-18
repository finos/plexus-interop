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
import { LoggerDelegate } from "./index";
import * as log from "loglevel";
import { Logger } from "./Logger";
import { LoggerBase } from "./LoggerBase";
import { TimeUtils } from "../util/time/TimeUtils";
const logPrefixer: any = require("loglevel-plugin-prefix");

export enum LogLevel {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
  SILENT
}

export class LoggerFactory {
  private static additionalRecipients: LoggerDelegate[] = [];

  public static registerDelegate(logger: LoggerDelegate): { unregister: () => void } {
    let newRecipientsLen = LoggerFactory.additionalRecipients.push(logger);
    let registeredRecipientIndex = newRecipientsLen - 1;

    return {
      unregister: () => LoggerFactory.additionalRecipients = LoggerFactory.additionalRecipients.splice(registeredRecipientIndex, 1)
    };
  }

  public static getLogger(name: string = "Anonymous"): Logger {
    return new LoggerBase(name, this.additionalRecipients);
  }

  public static setLogLevel(level: LogLevel): void {
    /* istanbul ignore if */
    if (level <= LogLevel.DEBUG) {
      logPrefixer.apply(log, {
        template: "%t | [%l] ",
        timestampFormatter: (date: Date) => TimeUtils.format(date)
      });
    }
    log.setLevel(level as any);
  }

}

LoggerFactory.setLogLevel(LogLevel.INFO);