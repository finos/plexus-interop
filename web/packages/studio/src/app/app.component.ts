/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
import { AppActions } from './services/ui/AppActions';
import { Store } from '@ngrx/store';
import { LoggerFactory, LogLevel, Logger, TimeUtils } from '@plexus-interop/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ElementRef, Renderer2 } from '@angular/core';
import { State } from './services/ui/RootReducers';
import { AfterViewChecked } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('plexusLogsArea') logsTextArea: ElementRef;

  title = 'Plexus Studio';
  plexusLogs = '';
  autoScrollEnabled: boolean = true;
  logsEnabled: boolean = true;

  constructor(private store: Store<State>) { }

  private loggerDelegateRegistration: { unregister: () => void };

  private logger: Logger;

  public ngOnInit(): void {
    LoggerFactory.setLogLevel(LogLevel.INFO);
    this.loggerDelegateRegistration = this.createUiLoggerDelegate();
    this.logger = LoggerFactory.getLogger();
    this.logger.info('Welcome to Plexus Studio!');
    this.logger.info('Trying to detect connection to Plexus ...');
    this.store.dispatch({ type: AppActions.AUTO_CONNECT });
  }

  public ngAfterViewChecked(): void {
    if (this.autoScrollEnabled) {
      this.scrollLogsBottom();
    }
  }

  public ngOnDestroy(): void {
    this.loggerDelegateRegistration.unregister();
  }

  public scrollLogsBottom(): void {
    try {
      this.logsTextArea.nativeElement.scrollTop = this.logsTextArea.nativeElement.scrollHeight;
    } catch (e) {
      console.log('Unable to scroll', e);
    }
  }

  public clearLogs(): void {
    this.plexusLogs = '';
  }

  private filterEmptyArgs(arr: any[]): any[] {
    arr = arr || [];
    return arr.filter(el => !!el && !(Array.isArray(el) && el.length === 0));
  }

  private createUiLoggerDelegate(): { unregister: () => void } {
    return LoggerFactory.registerDelegate({
      log: (logLevel: LogLevel, msg: string, args: any[]) => {
        if (!this.logsEnabled) {
          return;
        }
        if (logLevel <= LogLevel.DEBUG) {
          // Too many logs in output
          return;
        }
        let message = `[${TimeUtils.format(new Date())}] ${LogLevel[logLevel]} ${msg}`;
        args = this.filterEmptyArgs(args);
        if (args.length > 0) {
          message += '\nArguments: ' + JSON.stringify(args);
        }
        if (this.plexusLogs) {
          this.plexusLogs = `${this.plexusLogs}\n${message}`;
        } else {
          this.plexusLogs = message;
        }
      }
    });
  }
}
