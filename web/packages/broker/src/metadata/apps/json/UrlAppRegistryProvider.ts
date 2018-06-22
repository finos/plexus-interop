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
import { Observable } from 'rxjs/Observable';
import { Logger, LoggerFactory } from '@plexus-interop/common';
import { UrlDataLoader } from '../../../http/UrlDataLoader';
import { JsonAppRegistryProvider } from './JsonAppRegistryProvider';
import { AppRegistryProvider } from '../AppRegistryProvider';
import { AppRegistry } from '../model/AppRegistry';

export class UrlAppRegistryProvider implements AppRegistryProvider {

    private readonly log: Logger = LoggerFactory.getLogger('UrlAppRegistryProvider');

    protected urlDataLoader: UrlDataLoader = new UrlDataLoader();

    protected started: boolean = false;    

    protected jsonAppRegistryProvider: JsonAppRegistryProvider;

    public constructor(
        private readonly url: string,
        private readonly interval: number = -1) { }

    public getAppRegistry(): Observable<AppRegistry> {
        return this.started ? this.jsonAppRegistryProvider.getAppRegistry() : Observable.throw(new Error('Not started'));
    }

    public getCurrent(): AppRegistry {
        if (!this.started) {
            throw new Error('Not started');
        }
        return this.jsonAppRegistryProvider.getCurrent();
    }

    public async start(): Promise<void> {
        if (this.started) {
            return Promise.reject('Already started');
        }
        this.log.debug(`Starting to load metadata from [${this.url}] with ${this.interval} interval`);
        const response = await this.urlDataLoader.fetchData(this.url);
        if (this.interval > 0) {
            this.jsonAppRegistryProvider = new JsonAppRegistryProvider(response, this.urlDataLoader.fetchWithInterval(this.url, this.interval));
        } else {
            this.jsonAppRegistryProvider = new JsonAppRegistryProvider(response);
        }
        this.started = true;
    }

}