import { Application } from "./model/Application";
import { ConsumedService } from "./model/ConsumedService";
import { ConsumedMethodReference } from "./model/ConsumedMethodReference";
import { ConsumedMethod } from "./model/ConsumedMethod";
import { ProvidedMethod } from "./model/ProvidedMethod";
import { ProvidedServiceReference } from "./model/ProvidedServiceReference";

export interface RegistryService {

    getApplication(appId: string): Application;

    getConsumedService(appId: string): ConsumedService;

    getConsumedMethod(appId: string, reference: ConsumedMethodReference): ConsumedMethod;

    getProvidedService(reference: ProvidedServiceReference): ProvidedMethod;

    getMatchingProvidedMethods(appId: string, consumedMethodReference: ConsumedMethodReference): ProvidedMethod[];    

}