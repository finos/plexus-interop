import { Service } from "./Service";
import { Application } from "./Application";
import { Method } from "./Method";

export interface ConsumedService {
    service: Service;
    application: Application;
    methods: Map<string, Method>;
}