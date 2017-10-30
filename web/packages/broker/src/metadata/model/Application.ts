import { ConsumedService } from "./ConsumedService";
import { ProvidedService } from "./ProvidedService";


export interface Application {

    id: string;
    
    consumedServices: ConsumedService[];

    providedServices: ProvidedService[];

}