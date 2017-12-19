import { SubsctiptionsRegistry } from './../services/SubsctiptionsRegistry';
import { OnDestroy } from '@angular/core';
import { LoggerFactory } from '@plexus-interop/common';
import { App as Application } from '@plexus-interop/broker';
import { Observable } from 'rxjs/Observable';
import { AppActions } from '../services/app.actions';
import { Component, OnInit } from '@angular/core';
import * as fromRoot from '../services/reducers';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.css'],
  providers: [SubsctiptionsRegistry]
})
export class AppListComponent implements OnInit, OnDestroy {
  apps: Observable<Application[]>;

  private logger = LoggerFactory.getLogger(AppListComponent.name);

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private subsctiptionsRegistry: SubsctiptionsRegistry) { }

  ngOnInit() {
    this.apps = this.store.select(state => state.plexus.apps);

    this.subsctiptionsRegistry.add(
      this.activatedRoute.queryParams
        .combineLatest(this.apps)
        .subscribe(([params, apps]) => {
          const appId = params['appId'];
          if (appId) {
            const expectedApp = apps.find(app => app.id === appId);
            if (!expectedApp) {
              this.logger.warn(`Params provided app with Id='${appId}' not found. Please, select from the list`);
            } else {
              this.connectToApp(expectedApp);
            }
          }
        }));
  }

  ngOnDestroy() {
    this.subsctiptionsRegistry.unsubscribeAll();
  }

  connectToApp(app: Application) {
    this.store.dispatch({ type: AppActions.CONNECT_TO_APP_START, payload: app });
  }

}
