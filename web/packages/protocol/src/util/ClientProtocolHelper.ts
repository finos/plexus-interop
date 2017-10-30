/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { clientProtocol as plexus, ClientProtocolUtils } from "../.";
import { InvocationMetaInfo } from "../dto/InvocationMetaInfo";
import { UniqueId } from "../dto/UniqueId";
import * as Long from "long";
import { Arrays } from "@plexus-interop/common";

const protocol = plexus.interop.protocol;

export class ClientProtocolHelper {

    public static isSuccessCompletion(completion: plexus.ICompletion): boolean {
        return ClientProtocolUtils.isSuccessCompletion(completion);
    }

    public static invocationInfoToConsumedMethodReference(invocationInfo: InvocationMetaInfo): plexus.interop.protocol.IConsumedMethodReference {
        return {
            methodId: invocationInfo.methodId,
            consumedService: {
                serviceId: invocationInfo.serviceId,
                serviceAlias: invocationInfo.serviceAlias
            }
        };
    }

    public static invocationStartRequestPayload(invocationInfo: InvocationMetaInfo): ArrayBuffer {
        return encodeClientToBrokerEnvelop({
            invocationStartRequest: {
                consumedMethod: ClientProtocolHelper.invocationInfoToConsumedMethodReference(invocationInfo)
            }
        });
    }

    public static discoveredInvocationStartRequestPayload(providerMethodReference: plexus.interop.protocol.IProvidedMethodReference): ArrayBuffer {
        return encodeClientToBrokerEnvelop({
            invocationStartRequest: {
                providedMethod: providerMethodReference
            }
        });
    }

    public static connectRequestPayload(connectRequest: plexus.interop.protocol.IConnectRequest): ArrayBuffer {
        return Arrays.toArrayBuffer(protocol.ConnectRequest.encode(connectRequest).finish());
    }

    public static discoveryServiceRequestPayload(serviceDiscoveryRequest: plexus.interop.protocol.IServiceDiscoveryRequest): ArrayBuffer {
        return encodeClientToBrokerEnvelop({
            serviceDiscoveryRequest
        });
    }

    public static discoveryMethodRequestPayload(methodDiscoveryRequest: plexus.interop.protocol.IMethodDiscoveryRequest): ArrayBuffer {
        return encodeClientToBrokerEnvelop({
            methodDiscoveryRequest
        });
    }

    public static discoveryResponsePayload(request: plexus.interop.protocol.IServiceDiscoveryResponse): ArrayBuffer {
        return Arrays.toArrayBuffer(protocol.ServiceDiscoveryResponse.encode(request).finish());
    }

    public static decodeConnectRequest(data: ArrayBuffer): plexus.interop.protocol.IConnectRequest {
        const envelop = plexus.interop.protocol.ConnectRequest.decode(new Uint8Array(data));
        return plexus.interop.protocol.ConnectRequest.toObject(envelop) as plexus.interop.protocol.IConnectRequest;
    }

    public static decodeMethodDiscoveryResponse(data: ArrayBuffer): plexus.interop.protocol.IMethodDiscoveryResponse {
        const envelop = plexus.interop.protocol.MethodDiscoveryResponse.decode(new Uint8Array(data));
        return plexus.interop.protocol.MethodDiscoveryResponse.toObject(envelop) as plexus.interop.protocol.IMethodDiscoveryResponse;
    }

    public static decodeMethodDiscoveryRequest(data: ArrayBuffer): plexus.interop.protocol.IMethodDiscoveryResponse {
        const envelop = plexus.interop.protocol.MethodDiscoveryResponse.decode(new Uint8Array(data));
        return plexus.interop.protocol.MethodDiscoveryResponse.toObject(envelop) as plexus.interop.protocol.IMethodDiscoveryResponse;
    }

    public static decodeServiceDiscoveryResponse(data: ArrayBuffer): plexus.interop.protocol.IServiceDiscoveryResponse {
        const envelop = plexus.interop.protocol.ServiceDiscoveryResponse.decode(new Uint8Array(data));
        return plexus.interop.protocol.ServiceDiscoveryResponse.toObject(envelop) as plexus.interop.protocol.IServiceDiscoveryResponse;
    }

    public static decodeServiceDiscoveryRequest(data: ArrayBuffer): plexus.interop.protocol.IServiceDiscoveryRequest {
        const clientToBroker = ClientProtocolHelper.decodeClientToBrokerRequest(data);
        return clientToBroker.serviceDiscoveryRequest as plexus.interop.protocol.IServiceDiscoveryRequest;
    }

    public static decodeClientToBrokerRequest(data: ArrayBuffer): plexus.interop.protocol.IClientToBrokerRequestEnvelope {
        const envelop = plexus.interop.protocol.ClientToBrokerRequestEnvelope.decode(new Uint8Array(data));
        return plexus.interop.protocol.ClientToBrokerRequestEnvelope.toObject(envelop) as plexus.interop.protocol.IClientToBrokerRequestEnvelope;
    }

    public static decodeConnectResponse(data: ArrayBuffer): plexus.interop.protocol.IConnectResponse {
        const envelop = plexus.interop.protocol.ConnectResponse.decode(new Uint8Array(data));
        return plexus.interop.protocol.ConnectResponse.toObject(envelop) as plexus.interop.protocol.IConnectResponse;
    }

    public static decodeBrokerEnvelop(data: ArrayBuffer): plexus.interop.protocol.IBrokerToClientRequestEnvelope {
        const envelop = plexus.interop.protocol.BrokerToClientRequestEnvelope.decode(new Uint8Array(data));
        return plexus.interop.protocol.BrokerToClientRequestEnvelope.toObject(envelop) as plexus.interop.protocol.IBrokerToClientRequestEnvelope;
    }

    public static decodeInvocationStartRequest(data: ArrayBuffer): plexus.interop.protocol.IInvocationStartRequest {
        const envelop = plexus.interop.protocol.ClientToBrokerRequestEnvelope.decode(new Uint8Array(data));
        const clientToBroker = plexus.interop.protocol.ClientToBrokerRequestEnvelope.toObject(envelop) as plexus.interop.protocol.IClientToBrokerRequestEnvelope;
        return clientToBroker.invocationStartRequest as plexus.interop.protocol.IInvocationStartRequest;
    }

    public static decodeInvocationStarting(data: ArrayBuffer): plexus.interop.protocol.IInvocationStarting {
        const envelop = plexus.interop.protocol.InvocationStarting.decode(new Uint8Array(data));
        return plexus.interop.protocol.InvocationStarting.toObject(envelop) as plexus.interop.protocol.IInvocationStarting;
    }

    public static decodeInvocationStarted(data: ArrayBuffer): plexus.interop.protocol.IInvocationStarted {
        const envelop = plexus.interop.protocol.InvocationStarted.decode(new Uint8Array(data));
        return plexus.interop.protocol.InvocationStarted.toObject(envelop) as plexus.interop.protocol.IInvocationStarted;
    }

    public static connectResponsePayload(connectResponse: plexus.interop.protocol.IConnectResponse): ArrayBuffer {
        return Arrays.toArrayBuffer(protocol.ConnectResponse.encode(connectResponse).finish());
    }

    public static invocationRequestedPayload(invocationStartRequested: plexus.interop.protocol.IInvocationStartRequested): ArrayBuffer {
        return encodeBrokerToClientEnvelop({
            invocationStartRequested
        });
    }

    public static messageHeaderPayload(message: plexus.interop.protocol.IInvocationMessageHeader): ArrayBuffer {
        return encodeInvocationEnvelop({
            message
        });
    }

    public static messageReceivedPayload(confirmation: plexus.interop.protocol.IInvocationMessageReceived): ArrayBuffer {
        return encodeInvocationEnvelop({
            confirmation
        });
    }

    public static sendCompletionPayload(sendCompletion: plexus.interop.protocol.IInvocationSendCompletion): ArrayBuffer {
        return encodeInvocationEnvelop({
            sendCompletion
        });
    }

    public static invocationStartedMessagePayload(header: plexus.interop.protocol.IInvocationStarted): ArrayBuffer {
        return Arrays.toArrayBuffer(protocol.InvocationStarted.encode(header).finish());
    }

    public static invocationStartingMessagePayload(header: plexus.interop.protocol.IInvocationStarting): ArrayBuffer {
        return Arrays.toArrayBuffer(protocol.InvocationStarting.encode(header).finish());
    }

    public static toInvocationInfo(header: plexus.interop.protocol.IInvocationStartRequested): InvocationMetaInfo {
        return {
            methodId: header.methodId,
            serviceId: header.serviceId,
            consumerApplicationId: header.consumerApplicationId,
            consumerConnectionId: UniqueId.fromProperties(header.consumerConnectionId as plexus.IUniqueId)
        };
    }

    public static decodeInvocationEnvelop(data: ArrayBuffer): plexus.interop.protocol.IInvocationMessageEnvelope {
        const envelop = plexus.interop.protocol.InvocationMessageEnvelope.decode(new Uint8Array(data));
        return plexus.interop.protocol.InvocationMessageEnvelope.toObject(envelop) as plexus.interop.protocol.IInvocationMessageEnvelope;
    }

    public static longToNumber(value: Long | number): number {
        return (value instanceof Long) ? (value as Long).toNumber() : value;
    }

}

function encodeBrokerToClientEnvelop(header: plexus.interop.protocol.IBrokerToClientRequestEnvelope): ArrayBuffer {
    return Arrays.toArrayBuffer(protocol.BrokerToClientRequestEnvelope.encode(header).finish());
}

function encodeClientToBrokerEnvelop(header: plexus.interop.protocol.IClientToBrokerRequestEnvelope): ArrayBuffer {
    return Arrays.toArrayBuffer(protocol.ClientToBrokerRequestEnvelope.encode(header).finish());
}

function encodeInvocationEnvelop(header: plexus.interop.protocol.IInvocationMessageEnvelope): ArrayBuffer {
    return Arrays.toArrayBuffer(protocol.InvocationMessageEnvelope.encode(header).finish());
}