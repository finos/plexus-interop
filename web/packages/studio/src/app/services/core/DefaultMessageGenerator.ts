import { InteropRegistryService } from "@plexus-interop/broker";


export class DefaultMessageGenerator {

    public constructor(private readonly interopRegistryService: InteropRegistryService) { }

    public generate(messageId: string): string {
        const message = this.interopRegistryService.getRegistry().messages.get(messageId);
        if (!message) {
            throw new Error(`${messageId} is not found`);
        }
        const defaultPayload: any = {};
        message.fields.forEach(field => {
            if (!field.primitive) {
                defaultPayload[field.name] = {};
            } else {
                switch (field.type) {
                    case "string":
                        defaultPayload[field.name] = "stringValue";
                        break;
                    case "bool":
                        defaultPayload[field.name] = false;
                        break;
                    default:
                        defaultPayload[field.name] = 0;
                }
            }
        });
        return JSON.stringify(defaultPayload);
    }

}