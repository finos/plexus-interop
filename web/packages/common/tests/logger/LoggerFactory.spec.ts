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
import { LoggerFactory, LogLevel } from '../../src/logger/LoggerFactory';

describe('Logger Factory', () => {

    it('Should be able to register additional logger implementations', () => {
        let called: { msg: string, args: any, logLevel: LogLevel }[] = [];

        LoggerFactory.registerDelegate({
            log: (logLevel, msg, args) => { called.push({ msg, args, logLevel }); }
        });

        let logger = LoggerFactory.getLogger('LoggerFactory.spec');
        logger.error('test error', { arg: 'arg' });

        expect(called).toEqual([{ msg: 'test error', args: [{ arg: 'arg' }], logLevel: LogLevel.ERROR }]);
    });

    it('Should be able to removed registered logger implementations', () => {
        let called: { msg: string, args: any, logLevel: LogLevel }[] = [];

        let unregisterObj = LoggerFactory.registerDelegate({
            log: (logLevel, msg, args) => { called.push({ msg, args, logLevel }); }
        });

        let logger = LoggerFactory.getLogger('LoggerFactory.spec');
        logger.error('test error', { arg: 'arg' });

        unregisterObj.unregister();
        logger.error('test error2', { arg: 'arg2' });

        expect(called).toEqual([{ msg: 'test error', args: [{ arg: 'arg' }], logLevel: LogLevel.ERROR }]);
    });
});