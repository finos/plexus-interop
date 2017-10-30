import { Application } from "./Application";
import { ConsumedService } from "./ConsumedService";
import { ConsumedMethodReference } from "./ConsumedMethodReference";
import { ConsumedMethod } from "./ConsumedMethod";
import { ProvidedMethod } from "./ProvidedMethod";
import { ProvidedServiceReference } from "./ProvidedServiceReference";

export interface RegistryService {

    getApplication(appId: string): Application;

    getConsumedService(appId: string): ConsumedService;

    getConsumedMethod(appId: string, reference: ConsumedMethodReference): ConsumedMethod;

    getProvidedService(reference: ProvidedServiceReference): ProvidedMethod;

    getMatchingProvidedMethods(appId: string, consumedMethodReference: ConsumedMethodReference): ProvidedMethod[];    

}