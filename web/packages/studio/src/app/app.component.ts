import { AppActions } from './services/ui/app.actions';
import { Store } from '@ngrx/store';

import { LoggerFactory, LogLevel, Logger, TimeUtils } from '@plexus-interop/common';
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { ElementRef, Renderer2 } from '@angular/core';

import { State } from './services/ui/root-reducers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Plexus Studio';
  plexusLogs = "";
  constructor(private store: Store<State>) {
  }

  private loggerDelegateRegistration: { unregister: () => void };
  private logger: Logger;

  public ngOnInit(): void {
    LoggerFactory.setLogLevel(LogLevel.DEBUG);
    this.loggerDelegateRegistration = LoggerFactory.registerDelegate({
      log: (logLevel: LogLevel, msg: string, args: any[]) => {
        if (logLevel <= LogLevel.DEBUG) {
          // Too many logs in output
          return;
        }

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
