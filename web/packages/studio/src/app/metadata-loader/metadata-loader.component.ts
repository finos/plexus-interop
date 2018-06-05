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
import { SubscriptionsRegistry } from '../services/ui/SubscriptionsRegistry';
import { AppActions } from '../services/ui/AppActions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../services/ui/RootReducers';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import 'rxjs/add/operator/first';
import { TransportType } from '../services/ui/AppModel';

@Component({
  selector: 'app-metadata-loader',
  templateUrl: './metadata-loader.component.html',
  styleUrls: ['./metadata-loader.component.css'],
  providers: [SubscriptionsRegistry]
})
export class MetadataLoaderComponent implements OnInit, OnDestroy {

  metadataUrl: FormControl = new FormControl('', [Validators.required]);
  appsUrl: FormControl = new FormControl('', [this.requiredWebConfig.bind(this)]);
  proxyHostUrl: FormControl = new FormControl('', [this.requiredCrossWebConfig.bind(this)]);
  transportType: FormControl = new FormControl(TransportType.NATIVE_WS, [Validators.required]);
  wsUrl: FormControl = new FormControl('', [this.requiredWsConfig.bind(this)]);

  connectioFormGroup: FormGroup = this.builder.group({
    metadataUrl: this.metadataUrl,
    appsUrl: this.appsUrl,
    proxyHostUrl: this.proxyHostUrl,
    transportType: this.transportType,
    wsUrl: this.wsUrl
  });

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router,
    private subscriptions: SubscriptionsRegistry,
    private builder: FormBuilder) {
  }

  ngOnInit() {
    const connectionDetailsObs = this.store.select(state => state.plexus.connectioDetails);
    this.subscriptions.add(connectionDetailsObs.subscribe(connectioDetails => {
      this.metadataUrl.setValue(connectioDetails.generalConfig.metadataUrl);
      this.appsUrl.setValue(connectioDetails.webConfig ? connectioDetails.webConfig.appsMetadataUrl : '');
      this.proxyHostUrl.setValue(connectioDetails.webConfig ? connectioDetails.webConfig.proxyHostUrl : '');
      this.transportType.setValue(connectioDetails.generalConfig.transportType);
      this.wsUrl.setValue(connectioDetails.wsConfig ? connectioDetails.wsConfig.wsUrl : '');
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribeAll();
  }

  requiredCrossWebConfig(formControl: FormControl) {
    const value = formControl.value as string;
    const valid = this.transportType.value !== TransportType.WEB_CROSS || (!!value && value.length > 0);
    return valid ? null : { required: true };
  }

  requiredWsConfig(formControl: FormControl) {
    const value = formControl.value as string;
    const valid = this.transportType.value !== TransportType.NATIVE_WS || (!!value && value.length > 0);
    return valid ? null : { required: true };
  }

  requiredWebConfig(formControl: FormControl) {
    const value = formControl.value as string;
    const valid = this.transportType.value === TransportType.NATIVE_WS || (!!value && value.length > 0);
    return valid ? null : { required: true };
  }

  connect(metadataUrl: string) {
    const checkAbsPath = /^https?:\/\//i
    this.store.dispatch({
      type: AppActions.CONNECTION_SETUP_START,
      payload: {
        baseUrl: checkAbsPath.test(metadataUrl) ? metadataUrl : window.location.origin + metadataUrl,
        silentOnFailure: false
      }
    });
  }
}
