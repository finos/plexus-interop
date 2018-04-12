/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
import { AppRegistryProvider } from '../AppRegistryProvider';
import { Observable } from 'rxjs/Observable';
import { AppRegistry } from '../model/AppRegistry';
import { Application } from '../model/Application';
import { toMap } from '@plexus-interop/common';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

export class JsonAppRegistryProvider implements AppRegistryProvider {

    private readonly $registry: Observable<AppRegistry>;
    private current: AppRegistry;

    public constructor(jsonMetadata: string, $jsonMetadata?: Observable<string>) {
        this.current = this.parseRegistry(jsonMetadata);
        this.$registry = ($jsonMetadata || Observable.of(jsonMetadata))
            .map(this.parseRegistry.bind(this));
        this.$registry.subscribe({
            next: update => this.current = update
        });
    }

    public getAppRegistry(): Observable<AppRegistry> {
        return this.$registry;
    }

    public getCurrent(): AppRegistry {
        return this.current;
    }

    private parseRegistry(json: string): AppRegistry {
        const appsDto: { apps: Application[] } = JSON.parse(json);
        return {
            apps: toMap(appsDto.apps, app => app.id, app => app)
        };
    }

}