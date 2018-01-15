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
import { InteropRegistry } from "../../src/metadata/interop/model/InteropRegistry";
import { ExtendedMap } from "@plexus-interop/common";
import { Application } from "../../src/metadata/interop/model/Application";
import { Message } from "../../src/metadata/interop/model/Message";
import { Service } from "../../src/metadata/interop/model/Service";
import { DynamicMarshallerFactory } from "../../src/io/DynamicMarshallerFactory";

describe("DynamicMarshallerFactory", () => {

    const messages = ExtendedMap.create<string, Message>();
    const messageId = "interop.testing.EchoRequest";

    messages.set(messageId, {
        id: messageId,
        fields: [
            {
                name: "stringField",
                num: 1,
                primitive: true,
                type: "string"
            },
            {
                name: "boolField",
                num: 2,
                primitive: true,
                type: "bool"
            }
        ]
    });

    const validMessage = {
        stringField: "stringData",
        boolField: true
    };  

    const invalidTypeMessage = {
        stringField: "stringData",
        boolField: "true"
    };    

    const registry: InteropRegistry = {
        messages,
        applications: ExtendedMap.create<string, Application>(),
        services: ExtendedMap.create<string, Service>()
    };

    const sut = new DynamicMarshallerFactory(registry);

    it("Creates Marshaller for existing Message", () => {
        const marshaller = sut.getMarshaller(messageId);
        expect(marshaller).toBeDefined();
    });

    it("Reuse same Marshaller for next calls", () => {
        expect(sut.getMarshaller(messageId))
            .toBe(sut.getMarshaller(messageId));
    });

    it("It creates Marshaller with validation support", () => {
        const marshaller = sut.getMarshaller(messageId);
        marshaller.validate(validMessage);        
    });

    it("Raises an Error for Marshaller request on not existing Message", () => {
        try {
            sut.getMarshaller("Do not exist");
            fail("Should fail");
        } catch (error) {  
        }
    });

    it("Creates Marshaller which fail on messages with wrong type", () => {
        const marshaller = sut.getMarshaller(messageId);

        try {
            marshaller.validate(invalidTypeMessage);
            fail("Should fail");
        } catch (error) {  
            // tslint:disable-next-line:no-console
            console.log("Error raised", error);
        }
    });

    it("It creates Marshaller with primitive types support", () => {
        const marshaller = sut.getMarshaller(messageId);  
        const encoded = marshaller.encode(validMessage);
        expect(encoded).toBeDefined();
        const decoded = marshaller.decode(encoded);
        expect(decoded).toEqual(validMessage);
    });

});