
import { InteropRegistry } from "../../src/metadata/interop/model/InteropRegistry";
import { ExtendedMap } from "@plexus-interop/common";
import { Application } from "../../src/metadata/interop/model/Application";
import { Message } from "../../src/metadata/interop/model/Message";
import { Service } from "../../src/metadata/interop/model/Service";
import { DynamicMarshallerFactory } from "../../src/io/DynamicMarshallerFactory";


describe("DynamicMarshallerFactory", () => {

    const messages = new ExtendedMap<string, Message>();
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

    const registry: InteropRegistry = {
        messages,
        applications: new ExtendedMap<string, Application>(),
        services: new ExtendedMap<string, Service>()
    };

    const sut = new DynamicMarshallerFactory(registry);

    it("Creates Marshaller for existing Message", () => {
        const marshaller = sut.getMarshaller(messageId);
        expect(marshaller).toBeDefined();
    });

    it("Raises an Error for Marshaller request on not existing Message", () => {
        try {
            sut.getMarshaller("Do not exist");
            fail("Should fail");
        } catch (error) {  
        }
    });

});