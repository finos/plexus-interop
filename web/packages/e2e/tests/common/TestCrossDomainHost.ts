/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
import { Logger, LoggerFactory, LogLevel } from '@plexus-interop/common';
import { CrossDomainHostBuilder } from '@plexus-interop/broker';
import 'core-js/es6/promise';
import 'core-js/fn/array/find';
import 'core-js/es6/symbol';
import 'core-js/es6/object';
import 'core-js/es6/function';
import 'core-js/es6/parse-int';
import 'core-js/es6/parse-float';
import 'core-js/es6/number';
import 'core-js/es6/math';
import 'core-js/es6/string';
import 'core-js/es6/date';
import 'core-js/es6/array';
import 'core-js/es6/regexp';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/reflect';

LoggerFactory.setLogLevel(LogLevel.TRACE);

export class TestCrossDomainHost {

    public start(): void {
        const logger: Logger = LoggerFactory.getLogger('CrossDomainHostPage');
        new CrossDomainHostBuilder()
            .withCrossDomainConfig({ whiteListedUrls: ['*'] })
            .build()
            .then(() => logger.info('Created'))
            .catch(e => logger.error('Failed', e));
    }

}
const globalObject: any = window || global;
// tslint:disable-next-line:no-string-literal
const host = globalObject['proxyHostVar'] = new TestCrossDomainHost();

host.start();
