
import { GenericClientApi, StreamingInvocationClient, ValueHandler, InvocationClient, MethodDiscoveryResponse, MethodDiscoveryRequest, DiscoveredMethod } from "@plexus-interop/client";
import { InvocationRequestInfo, Completion } from "@plexus-interop/protocol";
import { ConsumedMethod, ProvidedMethod } from "@plexus-interop/broker";
import { ProvidedMethodReference } from "@plexus-interop/client-api";

export interface InteropClient {

    discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse>;

    sendUnaryRequest(methodToInvoke: DiscoveredMethod | ConsumedMethod, requestJson: string, responseHandler: ValueHandler<string>): Promise<InvocationClient>;

    setUnaryActionHandler(serviceId: string, methodId: string, handler: (requestJson: string) => Promise<string>): void;

    disconnect(): Promise<void>;

    createDefaultPayload(messageId: string): string;

}