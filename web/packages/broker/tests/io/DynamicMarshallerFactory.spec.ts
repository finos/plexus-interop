
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

    const validMessage = {
        stringField: "stringData",
        boolField: true
    };   

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

    it("It creates Marshaller with primitive types support", () => {
        debugger;
        const marshaller = sut.getMarshaller(messageId);  
        const encoded = marshaller.encode(validMessage);
        expect(encoded).toBeDefined();
        const decoded = marshaller.decode(encoded);
        console.log(JSON.stringify(decoded));
        expect(decoded).toEqual(validMessage);
    });

});