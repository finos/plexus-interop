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
import * as $protobuf from "protobufjs";

/** Namespace plexus. */
export namespace plexus {

    /** Namespace interop. */
    namespace interop {

        /** Namespace protocol. */
        namespace protocol {

            /** Properties of a ConsumedServiceReference. */
            interface IConsumedServiceReference {

                /** ConsumedServiceReference serviceId */
                serviceId?: string;

                /** ConsumedServiceReference serviceAlias */
                serviceAlias?: string;
            }

            /** Represents a ConsumedServiceReference. */
            class ConsumedServiceReference {

                /**
                 * Constructs a new ConsumedServiceReference.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IConsumedServiceReference);

                /** ConsumedServiceReference serviceId. */
                public serviceId: string;

                /** ConsumedServiceReference serviceAlias. */
                public serviceAlias: string;

                /**
                 * Creates a new ConsumedServiceReference instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ConsumedServiceReference instance
                 */
                public static create(properties?: plexus.interop.protocol.IConsumedServiceReference): plexus.interop.protocol.ConsumedServiceReference;

                /**
                 * Encodes the specified ConsumedServiceReference message. Does not implicitly {@link plexus.interop.protocol.ConsumedServiceReference.verify|verify} messages.
                 * @param message ConsumedServiceReference message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IConsumedServiceReference, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ConsumedServiceReference message, length delimited. Does not implicitly {@link plexus.interop.protocol.ConsumedServiceReference.verify|verify} messages.
                 * @param message ConsumedServiceReference message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IConsumedServiceReference, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ConsumedServiceReference message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ConsumedServiceReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.ConsumedServiceReference;

                /**
                 * Decodes a ConsumedServiceReference message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ConsumedServiceReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.ConsumedServiceReference;

                /**
                 * Verifies a ConsumedServiceReference message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ConsumedServiceReference message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ConsumedServiceReference
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.ConsumedServiceReference;

                /**
                 * Creates a plain object from a ConsumedServiceReference message. Also converts values to other types if specified.
                 * @param message ConsumedServiceReference
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.ConsumedServiceReference, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ConsumedServiceReference to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a ConsumedMethodReference. */
            interface IConsumedMethodReference {

                /** ConsumedMethodReference consumedService */
                consumedService?: plexus.interop.protocol.IConsumedServiceReference;

                /** ConsumedMethodReference methodId */
                methodId?: string;
            }

            /** Represents a ConsumedMethodReference. */
            class ConsumedMethodReference {

                /**
                 * Constructs a new ConsumedMethodReference.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IConsumedMethodReference);

                /** ConsumedMethodReference consumedService. */
                public consumedService?: (plexus.interop.protocol.IConsumedServiceReference|null);

                /** ConsumedMethodReference methodId. */
                public methodId: string;

                /**
                 * Creates a new ConsumedMethodReference instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ConsumedMethodReference instance
                 */
                public static create(properties?: plexus.interop.protocol.IConsumedMethodReference): plexus.interop.protocol.ConsumedMethodReference;

                /**
                 * Encodes the specified ConsumedMethodReference message. Does not implicitly {@link plexus.interop.protocol.ConsumedMethodReference.verify|verify} messages.
                 * @param message ConsumedMethodReference message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IConsumedMethodReference, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ConsumedMethodReference message, length delimited. Does not implicitly {@link plexus.interop.protocol.ConsumedMethodReference.verify|verify} messages.
                 * @param message ConsumedMethodReference message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IConsumedMethodReference, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ConsumedMethodReference message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ConsumedMethodReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.ConsumedMethodReference;

                /**
                 * Decodes a ConsumedMethodReference message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ConsumedMethodReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.ConsumedMethodReference;

                /**
                 * Verifies a ConsumedMethodReference message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ConsumedMethodReference message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ConsumedMethodReference
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.ConsumedMethodReference;

                /**
                 * Creates a plain object from a ConsumedMethodReference message. Also converts values to other types if specified.
                 * @param message ConsumedMethodReference
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.ConsumedMethodReference, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ConsumedMethodReference to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a ProvidedServiceReference. */
            interface IProvidedServiceReference {

                /** ProvidedServiceReference serviceId */
                serviceId?: string;

                /** ProvidedServiceReference serviceAlias */
                serviceAlias?: string;

                /** ProvidedServiceReference applicationId */
                applicationId?: string;

                /** ProvidedServiceReference connectionId */
                connectionId?: plexus.IUniqueId;
            }

            /** Represents a ProvidedServiceReference. */
            class ProvidedServiceReference {

                /**
                 * Constructs a new ProvidedServiceReference.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IProvidedServiceReference);

                /** ProvidedServiceReference serviceId. */
                public serviceId: string;

                /** ProvidedServiceReference serviceAlias. */
                public serviceAlias: string;

                /** ProvidedServiceReference applicationId. */
                public applicationId: string;

                /** ProvidedServiceReference connectionId. */
                public connectionId?: (plexus.IUniqueId|null);

                /**
                 * Creates a new ProvidedServiceReference instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ProvidedServiceReference instance
                 */
                public static create(properties?: plexus.interop.protocol.IProvidedServiceReference): plexus.interop.protocol.ProvidedServiceReference;

                /**
                 * Encodes the specified ProvidedServiceReference message. Does not implicitly {@link plexus.interop.protocol.ProvidedServiceReference.verify|verify} messages.
                 * @param message ProvidedServiceReference message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IProvidedServiceReference, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ProvidedServiceReference message, length delimited. Does not implicitly {@link plexus.interop.protocol.ProvidedServiceReference.verify|verify} messages.
                 * @param message ProvidedServiceReference message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IProvidedServiceReference, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ProvidedServiceReference message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ProvidedServiceReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.ProvidedServiceReference;

                /**
                 * Decodes a ProvidedServiceReference message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ProvidedServiceReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.ProvidedServiceReference;

                /**
                 * Verifies a ProvidedServiceReference message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ProvidedServiceReference message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ProvidedServiceReference
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.ProvidedServiceReference;

                /**
                 * Creates a plain object from a ProvidedServiceReference message. Also converts values to other types if specified.
                 * @param message ProvidedServiceReference
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.ProvidedServiceReference, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ProvidedServiceReference to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a ProvidedMethodReference. */
            interface IProvidedMethodReference {

                /** ProvidedMethodReference providedService */
                providedService?: plexus.interop.protocol.IProvidedServiceReference;

                /** ProvidedMethodReference methodId */
                methodId?: string;
            }

            /** Represents a ProvidedMethodReference. */
            class ProvidedMethodReference {

                /**
                 * Constructs a new ProvidedMethodReference.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IProvidedMethodReference);

                /** ProvidedMethodReference providedService. */
                public providedService?: (plexus.interop.protocol.IProvidedServiceReference|null);

                /** ProvidedMethodReference methodId. */
                public methodId: string;

                /**
                 * Creates a new ProvidedMethodReference instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ProvidedMethodReference instance
                 */
                public static create(properties?: plexus.interop.protocol.IProvidedMethodReference): plexus.interop.protocol.ProvidedMethodReference;

                /**
                 * Encodes the specified ProvidedMethodReference message. Does not implicitly {@link plexus.interop.protocol.ProvidedMethodReference.verify|verify} messages.
                 * @param message ProvidedMethodReference message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IProvidedMethodReference, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ProvidedMethodReference message, length delimited. Does not implicitly {@link plexus.interop.protocol.ProvidedMethodReference.verify|verify} messages.
                 * @param message ProvidedMethodReference message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IProvidedMethodReference, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ProvidedMethodReference message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ProvidedMethodReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.ProvidedMethodReference;

                /**
                 * Decodes a ProvidedMethodReference message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ProvidedMethodReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.ProvidedMethodReference;

                /**
                 * Verifies a ProvidedMethodReference message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ProvidedMethodReference message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ProvidedMethodReference
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.ProvidedMethodReference;

                /**
                 * Creates a plain object from a ProvidedMethodReference message. Also converts values to other types if specified.
                 * @param message ProvidedMethodReference
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.ProvidedMethodReference, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ProvidedMethodReference to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a ConnectRequest. */
            interface IConnectRequest {

                /** ConnectRequest applicationId */
                applicationId?: string;

                /** ConnectRequest applicationInstanceId */
                applicationInstanceId?: plexus.IUniqueId;
            }

            /** Represents a ConnectRequest. */
            class ConnectRequest {

                /**
                 * Constructs a new ConnectRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IConnectRequest);

                /** ConnectRequest applicationId. */
                public applicationId: string;

                /** ConnectRequest applicationInstanceId. */
                public applicationInstanceId?: (plexus.IUniqueId|null);

                /**
                 * Creates a new ConnectRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ConnectRequest instance
                 */
                public static create(properties?: plexus.interop.protocol.IConnectRequest): plexus.interop.protocol.ConnectRequest;

                /**
                 * Encodes the specified ConnectRequest message. Does not implicitly {@link plexus.interop.protocol.ConnectRequest.verify|verify} messages.
                 * @param message ConnectRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IConnectRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ConnectRequest message, length delimited. Does not implicitly {@link plexus.interop.protocol.ConnectRequest.verify|verify} messages.
                 * @param message ConnectRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IConnectRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ConnectRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ConnectRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.ConnectRequest;

                /**
                 * Decodes a ConnectRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ConnectRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.ConnectRequest;

                /**
                 * Verifies a ConnectRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ConnectRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ConnectRequest
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.ConnectRequest;

                /**
                 * Creates a plain object from a ConnectRequest message. Also converts values to other types if specified.
                 * @param message ConnectRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.ConnectRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ConnectRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a ConnectResponse. */
            interface IConnectResponse {

                /** ConnectResponse connectionId */
                connectionId?: plexus.IUniqueId;
            }

            /** Represents a ConnectResponse. */
            class ConnectResponse {

                /**
                 * Constructs a new ConnectResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IConnectResponse);

                /** ConnectResponse connectionId. */
                public connectionId?: (plexus.IUniqueId|null);

                /**
                 * Creates a new ConnectResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ConnectResponse instance
                 */
                public static create(properties?: plexus.interop.protocol.IConnectResponse): plexus.interop.protocol.ConnectResponse;

                /**
                 * Encodes the specified ConnectResponse message. Does not implicitly {@link plexus.interop.protocol.ConnectResponse.verify|verify} messages.
                 * @param message ConnectResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IConnectResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ConnectResponse message, length delimited. Does not implicitly {@link plexus.interop.protocol.ConnectResponse.verify|verify} messages.
                 * @param message ConnectResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IConnectResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ConnectResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ConnectResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.ConnectResponse;

                /**
                 * Decodes a ConnectResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ConnectResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.ConnectResponse;

                /**
                 * Verifies a ConnectResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ConnectResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ConnectResponse
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.ConnectResponse;

                /**
                 * Creates a plain object from a ConnectResponse message. Also converts values to other types if specified.
                 * @param message ConnectResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.ConnectResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ConnectResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a ClientToBrokerRequestEnvelope. */
            interface IClientToBrokerRequestEnvelope {

                /** ClientToBrokerRequestEnvelope invocationStartRequest */
                invocationStartRequest?: plexus.interop.protocol.IInvocationStartRequest;

                /** ClientToBrokerRequestEnvelope serviceDiscoveryRequest */
                serviceDiscoveryRequest?: plexus.interop.protocol.IServiceDiscoveryRequest;

                /** ClientToBrokerRequestEnvelope methodDiscoveryRequest */
                methodDiscoveryRequest?: plexus.interop.protocol.IMethodDiscoveryRequest;
            }

            /** Represents a ClientToBrokerRequestEnvelope. */
            class ClientToBrokerRequestEnvelope {

                /**
                 * Constructs a new ClientToBrokerRequestEnvelope.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IClientToBrokerRequestEnvelope);

                /** ClientToBrokerRequestEnvelope invocationStartRequest. */
                public invocationStartRequest?: (plexus.interop.protocol.IInvocationStartRequest|null);

                /** ClientToBrokerRequestEnvelope serviceDiscoveryRequest. */
                public serviceDiscoveryRequest?: (plexus.interop.protocol.IServiceDiscoveryRequest|null);

                /** ClientToBrokerRequestEnvelope methodDiscoveryRequest. */
                public methodDiscoveryRequest?: (plexus.interop.protocol.IMethodDiscoveryRequest|null);

                /** ClientToBrokerRequestEnvelope payload. */
                public payload?: string;

                /**
                 * Creates a new ClientToBrokerRequestEnvelope instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ClientToBrokerRequestEnvelope instance
                 */
                public static create(properties?: plexus.interop.protocol.IClientToBrokerRequestEnvelope): plexus.interop.protocol.ClientToBrokerRequestEnvelope;

                /**
                 * Encodes the specified ClientToBrokerRequestEnvelope message. Does not implicitly {@link plexus.interop.protocol.ClientToBrokerRequestEnvelope.verify|verify} messages.
                 * @param message ClientToBrokerRequestEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IClientToBrokerRequestEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ClientToBrokerRequestEnvelope message, length delimited. Does not implicitly {@link plexus.interop.protocol.ClientToBrokerRequestEnvelope.verify|verify} messages.
                 * @param message ClientToBrokerRequestEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IClientToBrokerRequestEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ClientToBrokerRequestEnvelope message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ClientToBrokerRequestEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.ClientToBrokerRequestEnvelope;

                /**
                 * Decodes a ClientToBrokerRequestEnvelope message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ClientToBrokerRequestEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.ClientToBrokerRequestEnvelope;

                /**
                 * Verifies a ClientToBrokerRequestEnvelope message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ClientToBrokerRequestEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ClientToBrokerRequestEnvelope
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.ClientToBrokerRequestEnvelope;

                /**
                 * Creates a plain object from a ClientToBrokerRequestEnvelope message. Also converts values to other types if specified.
                 * @param message ClientToBrokerRequestEnvelope
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.ClientToBrokerRequestEnvelope, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ClientToBrokerRequestEnvelope to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a BrokerToClientRequestEnvelope. */
            interface IBrokerToClientRequestEnvelope {

                /** BrokerToClientRequestEnvelope invocationStartRequested */
                invocationStartRequested?: plexus.interop.protocol.IInvocationStartRequested;
            }

            /** Represents a BrokerToClientRequestEnvelope. */
            class BrokerToClientRequestEnvelope {

                /**
                 * Constructs a new BrokerToClientRequestEnvelope.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IBrokerToClientRequestEnvelope);

                /** BrokerToClientRequestEnvelope invocationStartRequested. */
                public invocationStartRequested?: (plexus.interop.protocol.IInvocationStartRequested|null);

                /** BrokerToClientRequestEnvelope payload. */
                public payload?: string;

                /**
                 * Creates a new BrokerToClientRequestEnvelope instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns BrokerToClientRequestEnvelope instance
                 */
                public static create(properties?: plexus.interop.protocol.IBrokerToClientRequestEnvelope): plexus.interop.protocol.BrokerToClientRequestEnvelope;

                /**
                 * Encodes the specified BrokerToClientRequestEnvelope message. Does not implicitly {@link plexus.interop.protocol.BrokerToClientRequestEnvelope.verify|verify} messages.
                 * @param message BrokerToClientRequestEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IBrokerToClientRequestEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified BrokerToClientRequestEnvelope message, length delimited. Does not implicitly {@link plexus.interop.protocol.BrokerToClientRequestEnvelope.verify|verify} messages.
                 * @param message BrokerToClientRequestEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IBrokerToClientRequestEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a BrokerToClientRequestEnvelope message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns BrokerToClientRequestEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.BrokerToClientRequestEnvelope;

                /**
                 * Decodes a BrokerToClientRequestEnvelope message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns BrokerToClientRequestEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.BrokerToClientRequestEnvelope;

                /**
                 * Verifies a BrokerToClientRequestEnvelope message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a BrokerToClientRequestEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns BrokerToClientRequestEnvelope
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.BrokerToClientRequestEnvelope;

                /**
                 * Creates a plain object from a BrokerToClientRequestEnvelope message. Also converts values to other types if specified.
                 * @param message BrokerToClientRequestEnvelope
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.BrokerToClientRequestEnvelope, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this BrokerToClientRequestEnvelope to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an InvocationStartRequest. */
            interface IInvocationStartRequest {

                /** InvocationStartRequest consumedMethod */
                consumedMethod?: plexus.interop.protocol.IConsumedMethodReference;

                /** InvocationStartRequest providedMethod */
                providedMethod?: plexus.interop.protocol.IProvidedMethodReference;
            }

            /** Represents an InvocationStartRequest. */
            class InvocationStartRequest {

                /**
                 * Constructs a new InvocationStartRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IInvocationStartRequest);

                /** InvocationStartRequest consumedMethod. */
                public consumedMethod?: (plexus.interop.protocol.IConsumedMethodReference|null);

                /** InvocationStartRequest providedMethod. */
                public providedMethod?: (plexus.interop.protocol.IProvidedMethodReference|null);

                /** InvocationStartRequest target. */
                public target?: string;

                /**
                 * Creates a new InvocationStartRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InvocationStartRequest instance
                 */
                public static create(properties?: plexus.interop.protocol.IInvocationStartRequest): plexus.interop.protocol.InvocationStartRequest;

                /**
                 * Encodes the specified InvocationStartRequest message. Does not implicitly {@link plexus.interop.protocol.InvocationStartRequest.verify|verify} messages.
                 * @param message InvocationStartRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IInvocationStartRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InvocationStartRequest message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationStartRequest.verify|verify} messages.
                 * @param message InvocationStartRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IInvocationStartRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InvocationStartRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InvocationStartRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.InvocationStartRequest;

                /**
                 * Decodes an InvocationStartRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InvocationStartRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.InvocationStartRequest;

                /**
                 * Verifies an InvocationStartRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an InvocationStartRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns InvocationStartRequest
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.InvocationStartRequest;

                /**
                 * Creates a plain object from an InvocationStartRequest message. Also converts values to other types if specified.
                 * @param message InvocationStartRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.InvocationStartRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InvocationStartRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an InvocationStarting. */
            interface IInvocationStarting {
            }

            /** Represents an InvocationStarting. */
            class InvocationStarting {

                /**
                 * Constructs a new InvocationStarting.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IInvocationStarting);

                /**
                 * Creates a new InvocationStarting instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InvocationStarting instance
                 */
                public static create(properties?: plexus.interop.protocol.IInvocationStarting): plexus.interop.protocol.InvocationStarting;

                /**
                 * Encodes the specified InvocationStarting message. Does not implicitly {@link plexus.interop.protocol.InvocationStarting.verify|verify} messages.
                 * @param message InvocationStarting message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IInvocationStarting, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InvocationStarting message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationStarting.verify|verify} messages.
                 * @param message InvocationStarting message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IInvocationStarting, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InvocationStarting message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InvocationStarting
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.InvocationStarting;

                /**
                 * Decodes an InvocationStarting message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InvocationStarting
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.InvocationStarting;

                /**
                 * Verifies an InvocationStarting message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an InvocationStarting message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns InvocationStarting
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.InvocationStarting;

                /**
                 * Creates a plain object from an InvocationStarting message. Also converts values to other types if specified.
                 * @param message InvocationStarting
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.InvocationStarting, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InvocationStarting to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an InvocationStartRequested. */
            interface IInvocationStartRequested {

                /** InvocationStartRequested serviceId */
                serviceId?: string;

                /** InvocationStartRequested serviceAlias */
                serviceAlias?: string;

                /** InvocationStartRequested methodId */
                methodId?: string;

                /** InvocationStartRequested consumerApplicationId */
                consumerApplicationId?: string;

                /** InvocationStartRequested consumerConnectionId */
                consumerConnectionId?: plexus.IUniqueId;
            }

            /** Represents an InvocationStartRequested. */
            class InvocationStartRequested {

                /**
                 * Constructs a new InvocationStartRequested.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IInvocationStartRequested);

                /** InvocationStartRequested serviceId. */
                public serviceId: string;

                /** InvocationStartRequested serviceAlias. */
                public serviceAlias: string;

                /** InvocationStartRequested methodId. */
                public methodId: string;

                /** InvocationStartRequested consumerApplicationId. */
                public consumerApplicationId: string;

                /** InvocationStartRequested consumerConnectionId. */
                public consumerConnectionId?: (plexus.IUniqueId|null);

                /**
                 * Creates a new InvocationStartRequested instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InvocationStartRequested instance
                 */
                public static create(properties?: plexus.interop.protocol.IInvocationStartRequested): plexus.interop.protocol.InvocationStartRequested;

                /**
                 * Encodes the specified InvocationStartRequested message. Does not implicitly {@link plexus.interop.protocol.InvocationStartRequested.verify|verify} messages.
                 * @param message InvocationStartRequested message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IInvocationStartRequested, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InvocationStartRequested message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationStartRequested.verify|verify} messages.
                 * @param message InvocationStartRequested message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IInvocationStartRequested, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InvocationStartRequested message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InvocationStartRequested
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.InvocationStartRequested;

                /**
                 * Decodes an InvocationStartRequested message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InvocationStartRequested
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.InvocationStartRequested;

                /**
                 * Verifies an InvocationStartRequested message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an InvocationStartRequested message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns InvocationStartRequested
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.InvocationStartRequested;

                /**
                 * Creates a plain object from an InvocationStartRequested message. Also converts values to other types if specified.
                 * @param message InvocationStartRequested
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.InvocationStartRequested, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InvocationStartRequested to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an InvocationStarted. */
            interface IInvocationStarted {
            }

            /** Represents an InvocationStarted. */
            class InvocationStarted {

                /**
                 * Constructs a new InvocationStarted.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IInvocationStarted);

                /**
                 * Creates a new InvocationStarted instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InvocationStarted instance
                 */
                public static create(properties?: plexus.interop.protocol.IInvocationStarted): plexus.interop.protocol.InvocationStarted;

                /**
                 * Encodes the specified InvocationStarted message. Does not implicitly {@link plexus.interop.protocol.InvocationStarted.verify|verify} messages.
                 * @param message InvocationStarted message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IInvocationStarted, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InvocationStarted message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationStarted.verify|verify} messages.
                 * @param message InvocationStarted message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IInvocationStarted, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InvocationStarted message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InvocationStarted
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.InvocationStarted;

                /**
                 * Decodes an InvocationStarted message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InvocationStarted
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.InvocationStarted;

                /**
                 * Verifies an InvocationStarted message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an InvocationStarted message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns InvocationStarted
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.InvocationStarted;

                /**
                 * Creates a plain object from an InvocationStarted message. Also converts values to other types if specified.
                 * @param message InvocationStarted
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.InvocationStarted, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InvocationStarted to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an InvocationMessageHeader. */
            interface IInvocationMessageHeader {
            }

            /** Represents an InvocationMessageHeader. */
            class InvocationMessageHeader {

                /**
                 * Constructs a new InvocationMessageHeader.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IInvocationMessageHeader);

                /**
                 * Creates a new InvocationMessageHeader instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InvocationMessageHeader instance
                 */
                public static create(properties?: plexus.interop.protocol.IInvocationMessageHeader): plexus.interop.protocol.InvocationMessageHeader;

                /**
                 * Encodes the specified InvocationMessageHeader message. Does not implicitly {@link plexus.interop.protocol.InvocationMessageHeader.verify|verify} messages.
                 * @param message InvocationMessageHeader message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IInvocationMessageHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InvocationMessageHeader message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationMessageHeader.verify|verify} messages.
                 * @param message InvocationMessageHeader message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IInvocationMessageHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InvocationMessageHeader message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InvocationMessageHeader
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.InvocationMessageHeader;

                /**
                 * Decodes an InvocationMessageHeader message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InvocationMessageHeader
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.InvocationMessageHeader;

                /**
                 * Verifies an InvocationMessageHeader message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an InvocationMessageHeader message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns InvocationMessageHeader
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.InvocationMessageHeader;

                /**
                 * Creates a plain object from an InvocationMessageHeader message. Also converts values to other types if specified.
                 * @param message InvocationMessageHeader
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.InvocationMessageHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InvocationMessageHeader to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an InvocationMessageReceived. */
            interface IInvocationMessageReceived {
            }

            /** Represents an InvocationMessageReceived. */
            class InvocationMessageReceived {

                /**
                 * Constructs a new InvocationMessageReceived.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IInvocationMessageReceived);

                /**
                 * Creates a new InvocationMessageReceived instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InvocationMessageReceived instance
                 */
                public static create(properties?: plexus.interop.protocol.IInvocationMessageReceived): plexus.interop.protocol.InvocationMessageReceived;

                /**
                 * Encodes the specified InvocationMessageReceived message. Does not implicitly {@link plexus.interop.protocol.InvocationMessageReceived.verify|verify} messages.
                 * @param message InvocationMessageReceived message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IInvocationMessageReceived, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InvocationMessageReceived message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationMessageReceived.verify|verify} messages.
                 * @param message InvocationMessageReceived message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IInvocationMessageReceived, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InvocationMessageReceived message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InvocationMessageReceived
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.InvocationMessageReceived;

                /**
                 * Decodes an InvocationMessageReceived message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InvocationMessageReceived
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.InvocationMessageReceived;

                /**
                 * Verifies an InvocationMessageReceived message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an InvocationMessageReceived message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns InvocationMessageReceived
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.InvocationMessageReceived;

                /**
                 * Creates a plain object from an InvocationMessageReceived message. Also converts values to other types if specified.
                 * @param message InvocationMessageReceived
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.InvocationMessageReceived, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InvocationMessageReceived to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an InvocationSendCompletion. */
            interface IInvocationSendCompletion {
            }

            /** Represents an InvocationSendCompletion. */
            class InvocationSendCompletion {

                /**
                 * Constructs a new InvocationSendCompletion.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IInvocationSendCompletion);

                /**
                 * Creates a new InvocationSendCompletion instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InvocationSendCompletion instance
                 */
                public static create(properties?: plexus.interop.protocol.IInvocationSendCompletion): plexus.interop.protocol.InvocationSendCompletion;

                /**
                 * Encodes the specified InvocationSendCompletion message. Does not implicitly {@link plexus.interop.protocol.InvocationSendCompletion.verify|verify} messages.
                 * @param message InvocationSendCompletion message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IInvocationSendCompletion, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InvocationSendCompletion message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationSendCompletion.verify|verify} messages.
                 * @param message InvocationSendCompletion message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IInvocationSendCompletion, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InvocationSendCompletion message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InvocationSendCompletion
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.InvocationSendCompletion;

                /**
                 * Decodes an InvocationSendCompletion message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InvocationSendCompletion
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.InvocationSendCompletion;

                /**
                 * Verifies an InvocationSendCompletion message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an InvocationSendCompletion message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns InvocationSendCompletion
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.InvocationSendCompletion;

                /**
                 * Creates a plain object from an InvocationSendCompletion message. Also converts values to other types if specified.
                 * @param message InvocationSendCompletion
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.InvocationSendCompletion, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InvocationSendCompletion to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an InvocationMessageEnvelope. */
            interface IInvocationMessageEnvelope {

                /** InvocationMessageEnvelope message */
                message?: plexus.interop.protocol.IInvocationMessageHeader;

                /** InvocationMessageEnvelope confirmation */
                confirmation?: plexus.interop.protocol.IInvocationMessageReceived;

                /** InvocationMessageEnvelope sendCompletion */
                sendCompletion?: plexus.interop.protocol.IInvocationSendCompletion;
            }

            /** Represents an InvocationMessageEnvelope. */
            class InvocationMessageEnvelope {

                /**
                 * Constructs a new InvocationMessageEnvelope.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IInvocationMessageEnvelope);

                /** InvocationMessageEnvelope message. */
                public message?: (plexus.interop.protocol.IInvocationMessageHeader|null);

                /** InvocationMessageEnvelope confirmation. */
                public confirmation?: (plexus.interop.protocol.IInvocationMessageReceived|null);

                /** InvocationMessageEnvelope sendCompletion. */
                public sendCompletion?: (plexus.interop.protocol.IInvocationSendCompletion|null);

                /** InvocationMessageEnvelope payload. */
                public payload?: string;

                /**
                 * Creates a new InvocationMessageEnvelope instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InvocationMessageEnvelope instance
                 */
                public static create(properties?: plexus.interop.protocol.IInvocationMessageEnvelope): plexus.interop.protocol.InvocationMessageEnvelope;

                /**
                 * Encodes the specified InvocationMessageEnvelope message. Does not implicitly {@link plexus.interop.protocol.InvocationMessageEnvelope.verify|verify} messages.
                 * @param message InvocationMessageEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IInvocationMessageEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InvocationMessageEnvelope message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationMessageEnvelope.verify|verify} messages.
                 * @param message InvocationMessageEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IInvocationMessageEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InvocationMessageEnvelope message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InvocationMessageEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.InvocationMessageEnvelope;

                /**
                 * Decodes an InvocationMessageEnvelope message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InvocationMessageEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.InvocationMessageEnvelope;

                /**
                 * Verifies an InvocationMessageEnvelope message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an InvocationMessageEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns InvocationMessageEnvelope
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.InvocationMessageEnvelope;

                /**
                 * Creates a plain object from an InvocationMessageEnvelope message. Also converts values to other types if specified.
                 * @param message InvocationMessageEnvelope
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.InvocationMessageEnvelope, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InvocationMessageEnvelope to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** DiscoveryMode enum. */
            enum DiscoveryMode {
                Offline = 0,
                Online = 1
            }

            /** MethodType enum. */
            enum MethodType {
                Unary = 0,
                ServerStreaming = 1,
                ClientStreaming = 2,
                DuplexStreaming = 3
            }

            /** Properties of a ServiceDiscoveryRequest. */
            interface IServiceDiscoveryRequest {

                /** ServiceDiscoveryRequest consumedService */
                consumedService?: plexus.interop.protocol.IConsumedServiceReference;

                /** ServiceDiscoveryRequest discoveryMode */
                discoveryMode?: plexus.interop.protocol.DiscoveryMode;
            }

            /** Represents a ServiceDiscoveryRequest. */
            class ServiceDiscoveryRequest {

                /**
                 * Constructs a new ServiceDiscoveryRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IServiceDiscoveryRequest);

                /** ServiceDiscoveryRequest consumedService. */
                public consumedService?: (plexus.interop.protocol.IConsumedServiceReference|null);

                /** ServiceDiscoveryRequest discoveryMode. */
                public discoveryMode: plexus.interop.protocol.DiscoveryMode;

                /**
                 * Creates a new ServiceDiscoveryRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ServiceDiscoveryRequest instance
                 */
                public static create(properties?: plexus.interop.protocol.IServiceDiscoveryRequest): plexus.interop.protocol.ServiceDiscoveryRequest;

                /**
                 * Encodes the specified ServiceDiscoveryRequest message. Does not implicitly {@link plexus.interop.protocol.ServiceDiscoveryRequest.verify|verify} messages.
                 * @param message ServiceDiscoveryRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IServiceDiscoveryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ServiceDiscoveryRequest message, length delimited. Does not implicitly {@link plexus.interop.protocol.ServiceDiscoveryRequest.verify|verify} messages.
                 * @param message ServiceDiscoveryRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IServiceDiscoveryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ServiceDiscoveryRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ServiceDiscoveryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.ServiceDiscoveryRequest;

                /**
                 * Decodes a ServiceDiscoveryRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ServiceDiscoveryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.ServiceDiscoveryRequest;

                /**
                 * Verifies a ServiceDiscoveryRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ServiceDiscoveryRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ServiceDiscoveryRequest
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.ServiceDiscoveryRequest;

                /**
                 * Creates a plain object from a ServiceDiscoveryRequest message. Also converts values to other types if specified.
                 * @param message ServiceDiscoveryRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.ServiceDiscoveryRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ServiceDiscoveryRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a ServiceDiscoveryResponse. */
            interface IServiceDiscoveryResponse {

                /** ServiceDiscoveryResponse services */
                services?: plexus.interop.protocol.IDiscoveredService[];
            }

            /** Represents a ServiceDiscoveryResponse. */
            class ServiceDiscoveryResponse {

                /**
                 * Constructs a new ServiceDiscoveryResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IServiceDiscoveryResponse);

                /** ServiceDiscoveryResponse services. */
                public services: plexus.interop.protocol.IDiscoveredService[];

                /**
                 * Creates a new ServiceDiscoveryResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ServiceDiscoveryResponse instance
                 */
                public static create(properties?: plexus.interop.protocol.IServiceDiscoveryResponse): plexus.interop.protocol.ServiceDiscoveryResponse;

                /**
                 * Encodes the specified ServiceDiscoveryResponse message. Does not implicitly {@link plexus.interop.protocol.ServiceDiscoveryResponse.verify|verify} messages.
                 * @param message ServiceDiscoveryResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IServiceDiscoveryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ServiceDiscoveryResponse message, length delimited. Does not implicitly {@link plexus.interop.protocol.ServiceDiscoveryResponse.verify|verify} messages.
                 * @param message ServiceDiscoveryResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IServiceDiscoveryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ServiceDiscoveryResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ServiceDiscoveryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.ServiceDiscoveryResponse;

                /**
                 * Decodes a ServiceDiscoveryResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ServiceDiscoveryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.ServiceDiscoveryResponse;

                /**
                 * Verifies a ServiceDiscoveryResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ServiceDiscoveryResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ServiceDiscoveryResponse
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.ServiceDiscoveryResponse;

                /**
                 * Creates a plain object from a ServiceDiscoveryResponse message. Also converts values to other types if specified.
                 * @param message ServiceDiscoveryResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.ServiceDiscoveryResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ServiceDiscoveryResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a DiscoveredService. */
            interface IDiscoveredService {

                /** DiscoveredService consumedService */
                consumedService?: plexus.interop.protocol.IConsumedServiceReference;

                /** DiscoveredService providedService */
                providedService?: plexus.interop.protocol.IProvidedServiceReference;

                /** DiscoveredService serviceTitle */
                serviceTitle?: string;

                /** DiscoveredService methods */
                methods?: plexus.interop.protocol.IDiscoveredServiceMethod[];
            }

            /** Represents a DiscoveredService. */
            class DiscoveredService {

                /**
                 * Constructs a new DiscoveredService.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IDiscoveredService);

                /** DiscoveredService consumedService. */
                public consumedService?: (plexus.interop.protocol.IConsumedServiceReference|null);

                /** DiscoveredService providedService. */
                public providedService?: (plexus.interop.protocol.IProvidedServiceReference|null);

                /** DiscoveredService serviceTitle. */
                public serviceTitle: string;

                /** DiscoveredService methods. */
                public methods: plexus.interop.protocol.IDiscoveredServiceMethod[];

                /**
                 * Creates a new DiscoveredService instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns DiscoveredService instance
                 */
                public static create(properties?: plexus.interop.protocol.IDiscoveredService): plexus.interop.protocol.DiscoveredService;

                /**
                 * Encodes the specified DiscoveredService message. Does not implicitly {@link plexus.interop.protocol.DiscoveredService.verify|verify} messages.
                 * @param message DiscoveredService message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IDiscoveredService, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified DiscoveredService message, length delimited. Does not implicitly {@link plexus.interop.protocol.DiscoveredService.verify|verify} messages.
                 * @param message DiscoveredService message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IDiscoveredService, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a DiscoveredService message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns DiscoveredService
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.DiscoveredService;

                /**
                 * Decodes a DiscoveredService message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns DiscoveredService
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.DiscoveredService;

                /**
                 * Verifies a DiscoveredService message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a DiscoveredService message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns DiscoveredService
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.DiscoveredService;

                /**
                 * Creates a plain object from a DiscoveredService message. Also converts values to other types if specified.
                 * @param message DiscoveredService
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.DiscoveredService, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this DiscoveredService to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a DiscoveredServiceMethod. */
            interface IDiscoveredServiceMethod {

                /** DiscoveredServiceMethod methodId */
                methodId?: string;

                /** DiscoveredServiceMethod methodTitle */
                methodTitle?: string;

                /** DiscoveredServiceMethod inputMessageId */
                inputMessageId?: string;

                /** DiscoveredServiceMethod outputMessageId */
                outputMessageId?: string;

                /** DiscoveredServiceMethod methodType */
                methodType?: plexus.interop.protocol.MethodType;
            }

            /** Represents a DiscoveredServiceMethod. */
            class DiscoveredServiceMethod {

                /**
                 * Constructs a new DiscoveredServiceMethod.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IDiscoveredServiceMethod);

                /** DiscoveredServiceMethod methodId. */
                public methodId: string;

                /** DiscoveredServiceMethod methodTitle. */
                public methodTitle: string;

                /** DiscoveredServiceMethod inputMessageId. */
                public inputMessageId: string;

                /** DiscoveredServiceMethod outputMessageId. */
                public outputMessageId: string;

                /** DiscoveredServiceMethod methodType. */
                public methodType: plexus.interop.protocol.MethodType;

                /**
                 * Creates a new DiscoveredServiceMethod instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns DiscoveredServiceMethod instance
                 */
                public static create(properties?: plexus.interop.protocol.IDiscoveredServiceMethod): plexus.interop.protocol.DiscoveredServiceMethod;

                /**
                 * Encodes the specified DiscoveredServiceMethod message. Does not implicitly {@link plexus.interop.protocol.DiscoveredServiceMethod.verify|verify} messages.
                 * @param message DiscoveredServiceMethod message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IDiscoveredServiceMethod, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified DiscoveredServiceMethod message, length delimited. Does not implicitly {@link plexus.interop.protocol.DiscoveredServiceMethod.verify|verify} messages.
                 * @param message DiscoveredServiceMethod message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IDiscoveredServiceMethod, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a DiscoveredServiceMethod message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns DiscoveredServiceMethod
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.DiscoveredServiceMethod;

                /**
                 * Decodes a DiscoveredServiceMethod message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns DiscoveredServiceMethod
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.DiscoveredServiceMethod;

                /**
                 * Verifies a DiscoveredServiceMethod message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a DiscoveredServiceMethod message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns DiscoveredServiceMethod
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.DiscoveredServiceMethod;

                /**
                 * Creates a plain object from a DiscoveredServiceMethod message. Also converts values to other types if specified.
                 * @param message DiscoveredServiceMethod
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.DiscoveredServiceMethod, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this DiscoveredServiceMethod to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a MethodDiscoveryRequest. */
            interface IMethodDiscoveryRequest {

                /** MethodDiscoveryRequest inputMessageId */
                inputMessageId?: string;

                /** MethodDiscoveryRequest outputMessageId */
                outputMessageId?: string;

                /** MethodDiscoveryRequest consumedMethod */
                consumedMethod?: plexus.interop.protocol.IConsumedMethodReference;

                /** MethodDiscoveryRequest discoveryMode */
                discoveryMode?: plexus.interop.protocol.DiscoveryMode;
            }

            /** Represents a MethodDiscoveryRequest. */
            class MethodDiscoveryRequest {

                /**
                 * Constructs a new MethodDiscoveryRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IMethodDiscoveryRequest);

                /** MethodDiscoveryRequest inputMessageId. */
                public inputMessageId: string;

                /** MethodDiscoveryRequest outputMessageId. */
                public outputMessageId: string;

                /** MethodDiscoveryRequest consumedMethod. */
                public consumedMethod?: (plexus.interop.protocol.IConsumedMethodReference|null);

                /** MethodDiscoveryRequest discoveryMode. */
                public discoveryMode: plexus.interop.protocol.DiscoveryMode;

                /**
                 * Creates a new MethodDiscoveryRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns MethodDiscoveryRequest instance
                 */
                public static create(properties?: plexus.interop.protocol.IMethodDiscoveryRequest): plexus.interop.protocol.MethodDiscoveryRequest;

                /**
                 * Encodes the specified MethodDiscoveryRequest message. Does not implicitly {@link plexus.interop.protocol.MethodDiscoveryRequest.verify|verify} messages.
                 * @param message MethodDiscoveryRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IMethodDiscoveryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MethodDiscoveryRequest message, length delimited. Does not implicitly {@link plexus.interop.protocol.MethodDiscoveryRequest.verify|verify} messages.
                 * @param message MethodDiscoveryRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IMethodDiscoveryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MethodDiscoveryRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns MethodDiscoveryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.MethodDiscoveryRequest;

                /**
                 * Decodes a MethodDiscoveryRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns MethodDiscoveryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.MethodDiscoveryRequest;

                /**
                 * Verifies a MethodDiscoveryRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a MethodDiscoveryRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MethodDiscoveryRequest
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.MethodDiscoveryRequest;

                /**
                 * Creates a plain object from a MethodDiscoveryRequest message. Also converts values to other types if specified.
                 * @param message MethodDiscoveryRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.MethodDiscoveryRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MethodDiscoveryRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a MethodDiscoveryResponse. */
            interface IMethodDiscoveryResponse {

                /** MethodDiscoveryResponse methods */
                methods?: plexus.interop.protocol.IDiscoveredMethod[];
            }

            /** Represents a MethodDiscoveryResponse. */
            class MethodDiscoveryResponse {

                /**
                 * Constructs a new MethodDiscoveryResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IMethodDiscoveryResponse);

                /** MethodDiscoveryResponse methods. */
                public methods: plexus.interop.protocol.IDiscoveredMethod[];

                /**
                 * Creates a new MethodDiscoveryResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns MethodDiscoveryResponse instance
                 */
                public static create(properties?: plexus.interop.protocol.IMethodDiscoveryResponse): plexus.interop.protocol.MethodDiscoveryResponse;

                /**
                 * Encodes the specified MethodDiscoveryResponse message. Does not implicitly {@link plexus.interop.protocol.MethodDiscoveryResponse.verify|verify} messages.
                 * @param message MethodDiscoveryResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IMethodDiscoveryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MethodDiscoveryResponse message, length delimited. Does not implicitly {@link plexus.interop.protocol.MethodDiscoveryResponse.verify|verify} messages.
                 * @param message MethodDiscoveryResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IMethodDiscoveryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MethodDiscoveryResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns MethodDiscoveryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.MethodDiscoveryResponse;

                /**
                 * Decodes a MethodDiscoveryResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns MethodDiscoveryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.MethodDiscoveryResponse;

                /**
                 * Verifies a MethodDiscoveryResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a MethodDiscoveryResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MethodDiscoveryResponse
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.MethodDiscoveryResponse;

                /**
                 * Creates a plain object from a MethodDiscoveryResponse message. Also converts values to other types if specified.
                 * @param message MethodDiscoveryResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.MethodDiscoveryResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MethodDiscoveryResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a DiscoveredMethod. */
            interface IDiscoveredMethod {

                /** DiscoveredMethod providedMethod */
                providedMethod?: plexus.interop.protocol.IProvidedMethodReference;

                /** DiscoveredMethod methodTitle */
                methodTitle?: string;

                /** DiscoveredMethod inputMessageId */
                inputMessageId?: string;

                /** DiscoveredMethod outputMessageId */
                outputMessageId?: string;

                /** DiscoveredMethod methodType */
                methodType?: plexus.interop.protocol.MethodType;
            }

            /** Represents a DiscoveredMethod. */
            class DiscoveredMethod {

                /**
                 * Constructs a new DiscoveredMethod.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.protocol.IDiscoveredMethod);

                /** DiscoveredMethod providedMethod. */
                public providedMethod?: (plexus.interop.protocol.IProvidedMethodReference|null);

                /** DiscoveredMethod methodTitle. */
                public methodTitle: string;

                /** DiscoveredMethod inputMessageId. */
                public inputMessageId: string;

                /** DiscoveredMethod outputMessageId. */
                public outputMessageId: string;

                /** DiscoveredMethod methodType. */
                public methodType: plexus.interop.protocol.MethodType;

                /**
                 * Creates a new DiscoveredMethod instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns DiscoveredMethod instance
                 */
                public static create(properties?: plexus.interop.protocol.IDiscoveredMethod): plexus.interop.protocol.DiscoveredMethod;

                /**
                 * Encodes the specified DiscoveredMethod message. Does not implicitly {@link plexus.interop.protocol.DiscoveredMethod.verify|verify} messages.
                 * @param message DiscoveredMethod message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.protocol.IDiscoveredMethod, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified DiscoveredMethod message, length delimited. Does not implicitly {@link plexus.interop.protocol.DiscoveredMethod.verify|verify} messages.
                 * @param message DiscoveredMethod message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.protocol.IDiscoveredMethod, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a DiscoveredMethod message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns DiscoveredMethod
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.protocol.DiscoveredMethod;

                /**
                 * Decodes a DiscoveredMethod message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns DiscoveredMethod
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.protocol.DiscoveredMethod;

                /**
                 * Verifies a DiscoveredMethod message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a DiscoveredMethod message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns DiscoveredMethod
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.protocol.DiscoveredMethod;

                /**
                 * Creates a plain object from a DiscoveredMethod message. Also converts values to other types if specified.
                 * @param message DiscoveredMethod
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.protocol.DiscoveredMethod, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this DiscoveredMethod to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }
    }

    /** Properties of an UniqueId. */
    interface IUniqueId {

        /** UniqueId lo */
        lo?: Long;

        /** UniqueId hi */
        hi?: Long;
    }

    /** Represents an UniqueId. */
    class UniqueId {

        /**
         * Constructs a new UniqueId.
         * @param [properties] Properties to set
         */
        constructor(properties?: plexus.IUniqueId);

        /** UniqueId lo. */
        public lo: Long;

        /** UniqueId hi. */
        public hi: Long;

        /**
         * Creates a new UniqueId instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UniqueId instance
         */
        public static create(properties?: plexus.IUniqueId): plexus.UniqueId;

        /**
         * Encodes the specified UniqueId message. Does not implicitly {@link plexus.UniqueId.verify|verify} messages.
         * @param message UniqueId message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: plexus.IUniqueId, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UniqueId message, length delimited. Does not implicitly {@link plexus.UniqueId.verify|verify} messages.
         * @param message UniqueId message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: plexus.IUniqueId, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UniqueId message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UniqueId
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.UniqueId;

        /**
         * Decodes an UniqueId message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UniqueId
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.UniqueId;

        /**
         * Verifies an UniqueId message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UniqueId message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UniqueId
         */
        public static fromObject(object: { [k: string]: any }): plexus.UniqueId;

        /**
         * Creates a plain object from an UniqueId message. Also converts values to other types if specified.
         * @param message UniqueId
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: plexus.UniqueId, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UniqueId to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an Error. */
    interface IError {

        /** Error message */
        message?: string;

        /** Error details */
        details?: string;
    }

    /** Represents an Error. */
    class Error {

        /**
         * Constructs a new Error.
         * @param [properties] Properties to set
         */
        constructor(properties?: plexus.IError);

        /** Error message. */
        public message: string;

        /** Error details. */
        public details: string;

        /**
         * Creates a new Error instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Error instance
         */
        public static create(properties?: plexus.IError): plexus.Error;

        /**
         * Encodes the specified Error message. Does not implicitly {@link plexus.Error.verify|verify} messages.
         * @param message Error message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: plexus.IError, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Error message, length delimited. Does not implicitly {@link plexus.Error.verify|verify} messages.
         * @param message Error message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: plexus.IError, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Error message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Error
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.Error;

        /**
         * Decodes an Error message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Error
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.Error;

        /**
         * Verifies an Error message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Error message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Error
         */
        public static fromObject(object: { [k: string]: any }): plexus.Error;

        /**
         * Creates a plain object from an Error message. Also converts values to other types if specified.
         * @param message Error
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: plexus.Error, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Error to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Completion. */
    interface ICompletion {

        /** Completion status */
        status?: plexus.Completion.Status;

        /** Completion error */
        error?: plexus.IError;
    }

    /** Represents a Completion. */
    class Completion {

        /**
         * Constructs a new Completion.
         * @param [properties] Properties to set
         */
        constructor(properties?: plexus.ICompletion);

        /** Completion status. */
        public status: plexus.Completion.Status;

        /** Completion error. */
        public error?: (plexus.IError|null);

        /**
         * Creates a new Completion instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Completion instance
         */
        public static create(properties?: plexus.ICompletion): plexus.Completion;

        /**
         * Encodes the specified Completion message. Does not implicitly {@link plexus.Completion.verify|verify} messages.
         * @param message Completion message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: plexus.ICompletion, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Completion message, length delimited. Does not implicitly {@link plexus.Completion.verify|verify} messages.
         * @param message Completion message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: plexus.ICompletion, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Completion message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Completion
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.Completion;

        /**
         * Decodes a Completion message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Completion
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.Completion;

        /**
         * Verifies a Completion message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Completion message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Completion
         */
        public static fromObject(object: { [k: string]: any }): plexus.Completion;

        /**
         * Creates a plain object from a Completion message. Also converts values to other types if specified.
         * @param message Completion
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: plexus.Completion, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Completion to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Completion {

        /** Status enum. */
        enum Status {
            Completed = 0,
            Canceled = 1,
            Failed = 2
        }
    }
}
