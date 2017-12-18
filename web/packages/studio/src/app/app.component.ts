import { LoggerFactory, LogLevel, Logger } from '@plexus-interop/common';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Plexus Studio';
  plexusLogs = "";

  private loggerDelegateRegistration: { unregister: () => void };
  private logger: Logger;

  public ngOnInit(): void {
    LoggerFactory.setLogLevel(LogLevel.DEBUG);
    this.loggerDelegateRegistration = LoggerFactory.registerDelegate({
      log: (logLevel: LogLevel, msg: string, args: any[]) => {
        if (!!this.plexusLogs) {
          this.plexusLogs += `\n`;
        }

        this.plexusLogs += `${LogLevel[logLevel]} ${msg}`;
        if (args && args.length > 0) {
          this.plexusLogs += '| args: ' + args;
        }
      }
    });

    this.logger = LoggerFactory.getLogger();
    this.logger.info('Welcome to Plexus Studio!');
  }

  public ngOnDestroy(): void {
    this.loggerDelegateRegistration.unregister();
  }

  public clearLogs(): void {
    this.plexusLogs = "";
  }
}
