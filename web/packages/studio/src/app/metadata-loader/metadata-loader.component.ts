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
import { SubsctiptionsRegistry } from '../services/SubsctiptionsRegistry';
import { AppActions } from '../services/app.actions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../services/reducers';
import 'rxjs/add/operator/first';

@Component({
  selector: 'app-metadata-loader',
  templateUrl: './metadata-loader.component.html',
  styleUrls: ['./metadata-loader.component.css'],
  providers: [SubsctiptionsRegistry]
})
export class MetadataLoaderComponent implements OnInit, OnDestroy {
  public metadataUrl: string;

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router,
    private subscriptions: SubsctiptionsRegistry) {
  }

  ngOnInit() {
    let metadataUrlObs = this.store.select(state => state.plexus.metadataUrl);
    this.subscriptions.add(metadataUrlObs.first().subscribe(metadataUrl => {
      this.metadataUrl = metadataUrl;
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribeAll();
  }

  connect(metadataUrl: string) {
    const checkAbsPath = /^https?:\/\//i
    this.store.dispatch({
      type: AppActions.METADATA_LOAD_START,
      payload: {
        baseUrl: checkAbsPath.test(metadataUrl) ? metadataUrl : window.location.origin + metadataUrl,
        silentOnFailure: false
      }
    });
  }
}
