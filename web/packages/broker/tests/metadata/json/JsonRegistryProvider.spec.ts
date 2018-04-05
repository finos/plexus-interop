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
import { JsonInteropRegistryProvider } from "../../../src/metadata/interop/json/JsonInteropRegistryProvider";
import { Message } from "../../../src/metadata/interop/model/Message";
import { Service } from "../../../src/metadata/interop/model/Service";
import { Method } from "../../../src/metadata/interop/model/Method";
import { MethodType } from "../../../src/metadata/interop/model/MethodType";
import { Application } from "../../../src/metadata/interop/model/Application";
import { ConsumedMethod } from "../../../src/metadata/interop/model/ConsumedMethod";
import { ProvidedMethod } from "../../../src/metadata/interop/model/ProvidedMethod";

const fs = require("fs");

describe("JsonRegistryProvider", () => {

    const metadataJson = fs.readFileSync("tests/metadata/json/test-interop.json", "utf8");    

    it("Can parse metadata JSON", () => {

        const sut = new JsonInteropRegistryProvider(metadataJson);
        const registry = sut.getCurrent();
        expect(registry).toBeTruthy();
        expect(registry.applications.size).toBe(3);
        expect(registry.services.size).toBe(2);
        expect(registry.messages.size).toBeGreaterThan(1);

        const message = registry.messages.get("plexus.interop.testing.EchoRequest") as Message;
        expect(message.id).toBe("plexus.interop.testing.EchoRequest");

        const service = registry.services.get("plexus.interop.testing.EchoService") as Service;
        expect(service.id).toBe("plexus.interop.testing.EchoService");
        expect(service.methods.size).toBe(4);

        const unaryMethod = service.methods.get("Unary") as Method;
        expect(unaryMethod.service).toBe(service);
        expect(unaryMethod.requestMessage).toBe(message);
        expect(unaryMethod.responseMessage).toBe(message);
        expect(unaryMethod.type).toBe(MethodType.Unary);

        const consumerApp = registry.applications.get("plexus.interop.testing.EchoClient") as Application;
        expect(consumerApp.consumedServices.length).toBe(1);

        const consumedService = consumerApp.consumedServices[0];
        expect(consumedService.alias).toBeUndefined();
        expect(consumedService.application).toBe(consumerApp);
        expect(consumedService.from.isMatch("plexus.interop.testing.EchoServer")).toBeTruthy();
        expect(consumedService.from.isMatch("do.not.exist.EchoServer")).toBeFalsy();
        expect(consumedService.methods.size).toBe(4);
        expect((consumedService.methods.get("Unary") as ConsumedMethod).method).toBe(unaryMethod);

        const providedApp = registry.applications.get("plexus.interop.testing.EchoServer") as Application;
        expect(providedApp.consumedServices.length).toBe(0);
        expect(providedApp.providedServices.length).toBe(1);

        const providedService = providedApp.providedServices[0];
        expect(providedService.methods.size).toBe(4);
        expect(providedService.to.isMatch("plexus.interop.testing.EchoClient")).toBeTruthy();
        expect(providedService.to.isMatch("plexus.interop.testing.EchoClient2")).toBeTruthy();
        expect(providedService.to.isMatch("plexus.interop.do.not.exist.Client")).toBeFalsy();
        expect(providedService.to.isMatch("plexus.interop.do.not.exist.Client")).toBeFalsy();
        expect((providedService.methods.get("Unary") as ProvidedMethod).method).toBe(unaryMethod);
        
    });

});