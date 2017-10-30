import { Service } from "./Service";
import { Application } from "./Application";
import { ProvidedMethod } from "./ProvidedMethod";


export interface ProvidedService {
    service: Service;
    application: Application;
    methods: Map<string, ProvidedMethod>;
}