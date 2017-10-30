import { Registry } from "./model/Registry";
import { Observable } from "rxjs/Observable";

export interface RegistryProvider {

    getCurrent(): Registry;

    getRegistry(): Observable<Registry>;

}