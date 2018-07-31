/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
import { SubscriptionsRegistry } from './../services/ui/SubscriptionsRegistry';
import { OnDestroy } from '@angular/core';
import { LoggerFactory } from '@plexus-interop/common';
import { Application } from '@plexus-interop/broker';
import { Observable } from 'rxjs/Observable';
import { AppActions } from '../services/ui/AppActions';
import { Component, OnInit } from '@angular/core';
import * as fromRoot from '../services/ui/RootReducers';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';

interface AppUiInfo extends Application {
  label: string;
}

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.css'],
  providers: [SubscriptionsRegistry]
})
export class AppListComponent implements OnInit, OnDestroy {

  apps: Observable<AppUiInfo[]>;

  searchFilterValue: Observable<string>;

  searchFilterControl: FormControl = new FormControl("");

  private logger = LoggerFactory.getLogger(AppListComponent.name);

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private subsctiptionsRegistry: SubscriptionsRegistry) { }

  ngOnInit() {
    this.searchFilterValue = this.store
      .select(state => state.plexus.appsFilter || '');
    this.apps = this.store
      .select(state => this.applyFilter(state.plexus.apps, state.plexus.appsFilter))
      .map(this.sortApps.bind(this))
      .map(this.sortApps.bind(this))
      .map(this.toAppInfos.bind(this));
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
    this.subsctiptionsRegistry.add(this.searchFilterControl
      .valueChanges
      .debounceTime(150)
      .subscribe(newFilter => {
        this.store.dispatch({ type: AppActions.APPS_FILTER_UPDATED, payload: newFilter });
      }));
  }

  sortApps(apps: Application[]): Application[] {
    return apps.sort((a, b) => {
      return a.id.localeCompare(b.id);
    });
  }

  applyFilter(apps: Application[], filter?: string): Application[] {
    return filter && filter.trim().length > 0 ? apps.filter(a => a.id.toLowerCase().indexOf(filter.toLowerCase()) != -1) : apps;
  }

  toAppInfo(app: Application): AppUiInfo {
    return {
      ...app,
      label: app.id
    };
  }

  toAppInfos(apps: Application[]): AppUiInfo[] {
    return apps.map(this.toAppInfo);
  }

  ngOnDestroy() {
    this.subsctiptionsRegistry.unsubscribeAll();
  }

  connectToApp(app: Application) {
    this.store.dispatch({ type: AppActions.CONNECT_TO_APP_START, payload: app });
  }

}
