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
import { AppActions } from './services/app.actions';
import { Store } from '@ngrx/store';
import { LoggerFactory, LogLevel, Logger, TimeUtils } from '@plexus-interop/common';
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { ElementRef, Renderer2 } from '@angular/core';
import { State } from './services/reducers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  
  title = 'Plexus Studio';
  plexusLogs = '';
  
  constructor(private store: Store<State>) {}

  private loggerDelegateRegistration: { unregister: () => void };
  
  private logger: Logger;

  public ngOnInit(): void {
    
    this.loggerDelegateRegistration = LoggerFactory.registerDelegate({

      log: (logLevel: LogLevel, msg: string, args: any[]) => {

        let message = `[${TimeUtils.format(new Date())}] ${LogLevel[logLevel]} ${msg}`;
        if (args && args.length > 0) {
          message += '| args: ' + args;
        }

        if (this.plexusLogs) {
          this.plexusLogs = `${message}\n${this.plexusLogs}`;
        } else {
          this.plexusLogs = message;
        }

      }
    });

    this.logger = LoggerFactory.getLogger();
    this.logger.info('Welcome to Plexus Studio!');
    this.store.dispatch({
      type: AppActions.AUTO_CONNECT
    });
  }

  public ngOnDestroy(): void {
    this.loggerDelegateRegistration.unregister();
  }

  public clearLogs(): void {
    this.plexusLogs = "";
  }
}
