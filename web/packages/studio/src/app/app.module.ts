/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
import { CustomRouterStateSerializer } from './services/AppUtils';
import { TransportConnectionFactory } from './services/core/TransportConnectionFactory';
import { InteropClientFactory } from './services/core/InteropClientFactory';
import { InteropServiceFactory } from './services/core/InteropServiceFactory';
import { metaReducers } from './services/ui/RootReducers';
import { AppActions } from './services/ui/AppActions';
import { AppRoutes } from './app.routing';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MetadataLoaderComponent } from './metadata-loader/metadata-loader.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { AppListComponent } from './app-list/app-list.component';
import { HeaderComponent } from './header/header.component';

import { reducers } from './services/ui/RootReducers';
import { AppServicesComponent } from './app-services/app-services.component';
import { ConsumedServiceComponent } from './consumed-service/consumed-service.component';
import { ProvidedServiceComponent } from './provided-service/provided-service.component';

import { StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { Effects } from './services/ui/AppEffects';
import { HttpModule } from '@angular/http';

import {
  StoreRouterConnectingModule,
  RouterStateSerializer,
} from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    MetadataLoaderComponent,
    AppListComponent,
    HeaderComponent,
    AppServicesComponent,
    ConsumedServiceComponent,
    ProvidedServiceComponent
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(AppRoutes),
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([Effects]),
    HttpModule
  ],
  providers: [
    AppActions,
    InteropServiceFactory,
    InteropClientFactory,
    TransportConnectionFactory,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
