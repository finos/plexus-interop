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
import 'rxjs/add/observable/throw';
import 'superagent';
import * as request from 'superagent';
import { Logger, LoggerFactory } from '@plexus-interop/common';

export class HttpDataLoader {

    private readonly log: Logger = LoggerFactory.getLogger('HttpDataLoader');

    public async fetchData(url: string): Promise<string> {
        this.log.trace(`Fetching data from [${url}]`);
        const response = await request.get(url).withCredentials();
        this.log.trace(`Received response with ${response.status} status`);
        return response.text;
    }

    public fetchWithInterval(url: string, interval: number): Observable<string> {
        if (interval <= 0) {
            return Observable.throw(new Error('Interval must be positive'));
        }
        this.log.trace(`Starting to fetch data from [${url}] using ${interval} interval`);
        return new Observable(observer => {
            const intervalId = setInterval(async () => {
                try {
                    const response = await this.fetchData(url);
                    observer.next(response);
                } catch (e) {
                    this.log.error(`Error received while fetching data from ${url}`, e);
                    observer.error(e);
                    clearInterval(intervalId);
                }
                return () => clearInterval(intervalId);
            }, interval);
        });
    }

}