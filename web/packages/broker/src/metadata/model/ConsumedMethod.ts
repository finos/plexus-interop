import { Method } from "./Method";
import { ConsumedService } from "./ConsumedService";


export interface ConsumedMethod {
    method: Method;
    consumedService: ConsumedService;
}