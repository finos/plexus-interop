import { Application } from "./Application";
import { Message } from "./Message";
import { Service } from "./Service";

export interface Registry {
    applications: Application[];
    messages: Message[];
    services: Service[];
}