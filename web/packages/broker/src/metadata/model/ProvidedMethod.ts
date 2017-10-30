import { Method } from "./Method";
import { ProvidedService } from "./ProvidedService";

export interface ProvidedMethod {
    method: Method;
    providedService: ProvidedService;
    title: string;
}