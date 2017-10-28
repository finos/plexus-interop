import { ApplicationDescriptor } from "../../lifecycle/ApplicationDescriptor";

export interface AppConnectionHeartBit extends ApplicationDescriptor {
    connectionId: string;
} 