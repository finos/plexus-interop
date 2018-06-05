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
import { InteropServiceFactory } from '../services/core/InteropServiceFactory';
import { Application } from '@plexus-interop/broker';
import { Subscription } from 'rxjs/Subscription';
import { AppActions } from '../services/ui/AppActions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/filter';
import { Router } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '../services/ui/RootReducers';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ConnectionDetails, transportTypes as types, transportTypes } from '../services/ui/AppModel';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [SubscriptionsRegistry]
})
export class HeaderComponent implements OnInit, OnDestroy {
  metadataUrl$: Observable<string>;
  connected$: Observable<boolean>;
  application$: Observable<Application>;
  connectionId$: Observable<string>;
  connectionDetails$: Observable<ConnectionDetails>;
  transportLabel$: Observable<string>;

  public currentApp: Application;

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router,
    private interopServiceFactory: InteropServiceFactory,
    private subscriptions: SubscriptionsRegistry,
    private modalService: NgbModal) {
  }

  ngOnInit() {
    this.metadataUrl$ = this.store.select(state => state.plexus.connectionDetails.generalConfig.metadataUrl);
    this.application$ = this.store.select(state => state.plexus.connectedApp);
    this.connected$ = this.store.select(state => state.plexus.connectionDetails.connected);
    this.connectionDetails$ = this.store.select(state => state.plexus.connectionDetails);
    this.transportLabel$ = this.connectionDetails$.map(details => this.findLabel(details.generalConfig.transportType));
    this.connectionId$ = this.store.select(state => state.plexus.services.interopClient).map(client => client ? client.getConnectionStrId() : 'NOT CONNECTED');
    this.subscriptions.add(this.application$.subscribe(app => this.currentApp = app));
  }

  findLabel(typeKey) {
    const type = transportTypes.find(v => v.key == typeKey);
    return type ? type.label : 'NOT_FOUND';
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribeAll();
  }

  disconnectFromPlexus() {
    this.store.dispatch({ type: AppActions.DISCONNECT_FROM_PLEXUS });
  }

  disconnectFromApp() {
    this.store.dispatch({ type: AppActions.DISCONNECT_FROM_APP });
  }

  openCurrentApp() {
    if (this.currentApp) {
      this.store.dispatch({ type: AppActions.NAVIGATE_TO_APP });
    }
  }

  openModal(content) {
    this.modalService.open(content, { size: 'lg' });
  }
}
