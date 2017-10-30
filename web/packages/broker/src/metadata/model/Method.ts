import { MethodType } from "./MethodType";
import { Message } from "./Message";
import { Service } from "./Service";

export interface Method {
    name: string;
    type: MethodType;
    inputMessage: Message;
    outputMessage: Message;
    service: Service;
}