

import { StreamingInvocationClient } from "@plexus-interop/client";
import { Observer } from "@plexus-interop/common";
import { Marshaller } from "@plexus-interop/broker";

export type UnaryStringHandler = (requestJson: string) => Promise<string>;
export type ServerStreamingStringHandler = (request: string, invocationHostClient: StreamingInvocationClient<string>) => void;
export type BidiStreamingStringHandler = (invocationHostClient: StreamingInvocationClient<string>) => Observer<string>;

export function wrapGenericHostClient(base: StreamingInvocationClient<ArrayBuffer>, marshaller: Marshaller<any, ArrayBuffer>): StreamingInvocationClient<string> {
    return {
        complete: () => base.complete(),
        next: async v => base.next(marshaller.decode(JSON.parse(v))),
        error: e => base.error(e),
        cancel: () => base.cancel()
    };
}

export function toGenericObserver(base: Observer<string>, responseEncoder: Marshaller<any, ArrayBuffer>): Observer<ArrayBuffer> {
    return {
        next: v => base.next(JSON.stringify(responseEncoder.decode(v))),
        complete: () => base.complete(),
        error: e => base.error(e)
    };
}