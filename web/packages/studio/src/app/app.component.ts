import { LoggerFactory } from '@plexus-interop/common';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Plexus Studio';
  plexusLogs = 'Welcome to Plexus!';

  private loggerDelegateRegistration: { unregister: () => void };

  public ngOnInit(): void {
    this.loggerDelegateRegistration = LoggerFactory.registerDelegate({
      log: (logLevel, msg, args) => { this.plexusLogs += '\n' + msg; }
    });
  }

  public ngOnDestroy(): void {
    this.loggerDelegateRegistration.unregister();
  }
}
