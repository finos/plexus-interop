import { Observable } from "rxjs/Observable";
import { ProvidedMethodReference } from "../metadata/interop/model/ProvidedMethodReference";
import { ConsumedMethodReference } from "../metadata/interop/model/ConsumedMethodReference";

export class Types {

    public static isObservable<T>(obj: any): obj is Observable<T> {
        return (obj as Observable<T>).subscribe !== undefined;
    }

    public static isConsumedMethodReference(methodReference: ConsumedMethodReference | ProvidedMethodReference): methodReference is ConsumedMethodReference {
        return (methodReference as ProvidedMethodReference).providedService !== undefined;
    }

}