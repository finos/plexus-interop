import { MessageEncoder } from "./MessageEncoder";


export class EncoderProvider {

    public getMessageEncoder(messageId: string): MessageEncoder {
        throw new Error("Not implemented");
    }    

}