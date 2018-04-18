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
import { ProvidedServiceComponent } from './provided-service/provided-service.component';
import { ConsumedServiceComponent } from './consumed-service/consumed-service.component';
import { AppServicesComponent } from './app-services/app-services.component';
import { AppListComponent } from './app-list/app-list.component';
import { MetadataLoaderComponent } from './metadata-loader/metadata-loader.component';
import { Routes } from '@angular/router';

export const AppRoutes: Routes = [
  { path: '', component: MetadataLoaderComponent },
  { path: 'index.html', component: MetadataLoaderComponent },
  { path: 'apps', component: AppListComponent, resolve: [] },
  { path: 'app', component: AppServicesComponent },
  { path: 'consumed', component: ConsumedServiceComponent },
  { path: 'provided', component: ProvidedServiceComponent }
];
