
import { GenericClientApi, StreamingInvocationClient, ValueHandler, InvocationClient, MethodDiscoveryResponse, MethodDiscoveryRequest } from "@plexus-interop/client";
import { InvocationRequestInfo, Completion } from "@plexus-interop/protocol";

export interface InteropClient {

    discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse>;

    sendUnaryRequest(invocationInfo: InvocationRequestInfo, requestJson: string, responseHandler: ValueHandler<string>): Promise<InvocationClient>;

    setUnaryActionHandler(serviceId: string, methodId: string, handler: (requestJson: string) => Promise<string>): void;

    disconnect(): Promise<void>;

}