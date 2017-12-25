

import { StreamingInvocationClient } from "@plexus-interop/client";
import { Observer } from "@plexus-interop/common";

export type UnaryStringHandler = (requestJson: string) => Promise<string>;
export type ServerStreamingStringHandler = (request: string, invocationHostClient: StreamingInvocationClient<string>) => void;
export type BidiStreamingStringHandler = (invocationHostClient: StreamingInvocationClient<string>) => Observer<string>;