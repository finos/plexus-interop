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
import { JsonInteropRegistryProvider } from '../../src/interop/json/JsonInteropRegistryProvider';
import { Message } from '../../src/interop/model/Message';
import { Service } from '../../src/interop/model/Service';
import { Method } from '../../src/interop/model/Method';
import { MethodType } from '../../src/interop/model/MethodType';
import { Application } from '../../src/interop/model/Application';
import { ConsumedMethod } from '../../src/interop/model/ConsumedMethod';
import { ProvidedMethod } from '../../src/interop/model/ProvidedMethod';
import { Enum } from '../../src/interop/model/Enum';
import { ExtendedMap } from '@plexus-interop/common';

const fs = require('fs');

describe('JsonRegistryProvider', () => {

    const metadataJson = fs.readFileSync('tests/json/test-interop.json', 'utf8');

    it('Can parse metadata JSON', () => {

        const sut = new JsonInteropRegistryProvider(metadataJson);
        const registry = sut.getCurrent();
        expect(registry).toBeTruthy();
        expect(registry.applications.size).toBe(3);
        expect(registry.services.size).toBe(2);
        expect(registry.messages.size).toBeGreaterThan(1);

        const message = registry.messages.get('plexus.interop.testing.EchoRequest') as Message;
        expect(message.id).toBe('plexus.interop.testing.EchoRequest');
        expect(message.fields.stringField.type).toBe('string');
        expect(message.fields.int64Field.type).toBe('int64');
        expect(message.fields.int64Field.rule).toBeFalsy();
        expect(message.fields.repeatedDoubleField.type).toBe('double');
        expect(message.fields.repeatedDoubleField.rule).toBe('repeated');

        const subMessage = registry.messages.get('plexus.interop.testing.EchoRequest.SubMessage') as Message;
        expect(subMessage.id).toBe('plexus.interop.testing.EchoRequest.SubMessage');
        expect(subMessage.fields.bytesField.type).toBe('bytes');

        const subEnum = (registry.enums as ExtendedMap<string, Enum>).get('plexus.interop.testing.EchoRequest.SubEnum') as Enum;
        expect(subEnum.id).toBe('plexus.interop.testing.EchoRequest.SubEnum');
        expect(subEnum.values.value_one).toBe(0);

        const service = registry.services.get('plexus.interop.testing.EchoService') as Service;
        expect(service.id).toBe('plexus.interop.testing.EchoService');
        expect(service.methods.size).toBe(4);

        const unaryMethod = service.methods.get('Unary') as Method;
        expect(unaryMethod.service).toBe(service);
        expect(unaryMethod.requestMessage).toBe(message);
        expect(unaryMethod.responseMessage).toBe(message);
        expect(unaryMethod.type).toBe(MethodType.Unary);

        const consumerApp = registry.applications.get('plexus.interop.testing.EchoClient') as Application;
        expect(consumerApp.consumedServices.length).toBe(1);

        const consumedService = consumerApp.consumedServices[0];
        expect(consumedService.alias).toBeUndefined();
        expect(consumedService.application).toBe(consumerApp);
        expect(consumedService.from.isMatch('plexus.interop.testing.EchoServer')).toBeTruthy();
        expect(consumedService.from.isMatch('do.not.exist.EchoServer')).toBeFalsy();
        expect(consumedService.methods.size).toBe(4);
        expect((consumedService.methods.get('Unary') as ConsumedMethod).method).toBe(unaryMethod);

        const providedApp = registry.applications.get('plexus.interop.testing.EchoServer') as Application;
        expect(providedApp.consumedServices.length).toBe(0);
        expect(providedApp.providedServices.length).toBe(1);

        const providedService = providedApp.providedServices[0];
        expect(providedService.methods.size).toBe(4);
        expect(providedService.to.isMatch('plexus.interop.testing.EchoClient')).toBeTruthy();
        expect(providedService.to.isMatch('plexus.interop.testing.EchoClient2')).toBeTruthy();
        expect(providedService.to.isMatch('plexus.interop.do.not.exist.Client')).toBeFalsy();
        expect(providedService.to.isMatch('plexus.interop.do.not.exist.Client')).toBeFalsy();
        expect((providedService.methods.get('Unary') as ProvidedMethod).method).toBe(unaryMethod);

    });

});