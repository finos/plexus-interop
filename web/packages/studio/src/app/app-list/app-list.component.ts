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
import { SubscriptionsRegistry } from './../services/ui/SubscriptionsRegistry';
import { OnDestroy } from '@angular/core';
import { LoggerFactory } from '@plexus-interop/common';
import { App as Application } from '@plexus-interop/broker';
import { Observable } from 'rxjs/Observable';
import { AppActions } from '../services/ui/app.actions';
import { Component, OnInit } from '@angular/core';
import * as fromRoot from '../services/ui/root-reducers';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.css'],
  providers: [SubscriptionsRegistry]
})
export class AppListComponent implements OnInit, OnDestroy {

  apps: Observable<Application[]>;

  private logger = LoggerFactory.getLogger(AppListComponent.name);

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private subsctiptionsRegistry: SubscriptionsRegistry) { }

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
