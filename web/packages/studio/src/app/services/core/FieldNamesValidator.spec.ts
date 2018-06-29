import { InteropRegistryService, Message, InteropRegistry, Service, Application, Enum } from '@plexus-interop/broker';
import { ExtendedMap } from '@plexus-interop/common';
import { FieldNamesValidator } from './FieldNamesValidator';

describe('Field names validator', () => {

    const fieldMessageId = "field.message.id";
    const fieldMessage: Message = {
        id: fieldMessageId,
        fields: {
            stringField: {
                type: "string",
                id: 1
            }
        }
    };
    const id = 'test';
    const message: Message = {
        id,
        fields: {
            int32Field: {
                type: 'int32',
                id: 1
            },
            stringField: {
                type: 'string',
                id: 2
            },
            stringArrayField: {
                type: 'string',
                rule: 'repeated',
                id: 2
            },
            boolField: {
                type: 'bool',
                id: 3
            },
            messageField: {
                type: fieldMessageId,
                id: 4
            }
        }
    };

    it('Should pass object with correct fields', () => {
        new FieldNamesValidator(setupRegistry([fieldMessage, message])).validate(id, {
            int32Field: 0,
            stringField: "123"
        })
    });

});

function setupRegistry(messages: Message[]): { getRegistry: () => InteropRegistry } {

    const messagesMap = ExtendedMap.create<string, Message>();
    messages.forEach(m => messagesMap.set(m.id, m));

    const registry = {
        messages: messagesMap,
        applications: ExtendedMap.create<string, Application>(),
        services: ExtendedMap.create<string, Service>(),
        rawMessages: {}
    };

    return {
        getRegistry: () => registry
    };
}