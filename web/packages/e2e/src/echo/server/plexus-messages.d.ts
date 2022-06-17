/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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
/** Namespace interop. */
export namespace interop {

    /** Properties of an ApplicationOptions. */
    interface IApplicationOptions {

        /** ApplicationOptions title */
        title?: (string|null);

        /** ApplicationOptions launchOnCall */
        launchOnCall?: (interop.ApplicationLaunchOnCallMode|null);
    }

    /** Represents an ApplicationOptions. */
    class ApplicationOptions implements IApplicationOptions {

        /**
         * Constructs a new ApplicationOptions.
         * @param [properties] Properties to set
         */
        constructor(properties?: interop.IApplicationOptions);

        /** ApplicationOptions title. */
        public title: string;

        /** ApplicationOptions launchOnCall. */
        public launchOnCall: interop.ApplicationLaunchOnCallMode;

        /**
         * Creates a new ApplicationOptions instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ApplicationOptions instance
         */
        public static create(properties?: interop.IApplicationOptions): interop.ApplicationOptions;

        /**
         * Encodes the specified ApplicationOptions message. Does not implicitly {@link interop.ApplicationOptions.verify|verify} messages.
         * @param message ApplicationOptions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: interop.IApplicationOptions, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an ApplicationOptions message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ApplicationOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): interop.ApplicationOptions;

        /**
         * Verifies an ApplicationOptions message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an ApplicationOptions message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ApplicationOptions
         */
        public static fromObject(object: { [k: string]: any }): interop.ApplicationOptions;

        /**
         * Creates a plain object from an ApplicationOptions message. Also converts values to other types if specified.
         * @param message ApplicationOptions
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: interop.ApplicationOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ApplicationOptions to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a ProvidedServiceOptions. */
    interface IProvidedServiceOptions {

        /** ProvidedServiceOptions title */
        title?: (string|null);

        /** ProvidedServiceOptions launchOnCall */
        launchOnCall?: (interop.ApplicationLaunchOnCallMode|null);
    }

    /** Represents a ProvidedServiceOptions. */
    class ProvidedServiceOptions implements IProvidedServiceOptions {

        /**
         * Constructs a new ProvidedServiceOptions.
         * @param [properties] Properties to set
         */
        constructor(properties?: interop.IProvidedServiceOptions);

        /** ProvidedServiceOptions title. */
        public title: string;

        /** ProvidedServiceOptions launchOnCall. */
        public launchOnCall: interop.ApplicationLaunchOnCallMode;

        /**
         * Creates a new ProvidedServiceOptions instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ProvidedServiceOptions instance
         */
        public static create(properties?: interop.IProvidedServiceOptions): interop.ProvidedServiceOptions;

        /**
         * Encodes the specified ProvidedServiceOptions message. Does not implicitly {@link interop.ProvidedServiceOptions.verify|verify} messages.
         * @param message ProvidedServiceOptions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: interop.IProvidedServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ProvidedServiceOptions message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ProvidedServiceOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): interop.ProvidedServiceOptions;

        /**
         * Verifies a ProvidedServiceOptions message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ProvidedServiceOptions message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ProvidedServiceOptions
         */
        public static fromObject(object: { [k: string]: any }): interop.ProvidedServiceOptions;

        /**
         * Creates a plain object from a ProvidedServiceOptions message. Also converts values to other types if specified.
         * @param message ProvidedServiceOptions
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: interop.ProvidedServiceOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ProvidedServiceOptions to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a ConsumedServiceOptions. */
    interface IConsumedServiceOptions {
    }

    /** Represents a ConsumedServiceOptions. */
    class ConsumedServiceOptions implements IConsumedServiceOptions {

        /**
         * Constructs a new ConsumedServiceOptions.
         * @param [properties] Properties to set
         */
        constructor(properties?: interop.IConsumedServiceOptions);

        /**
         * Creates a new ConsumedServiceOptions instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ConsumedServiceOptions instance
         */
        public static create(properties?: interop.IConsumedServiceOptions): interop.ConsumedServiceOptions;

        /**
         * Encodes the specified ConsumedServiceOptions message. Does not implicitly {@link interop.ConsumedServiceOptions.verify|verify} messages.
         * @param message ConsumedServiceOptions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: interop.IConsumedServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ConsumedServiceOptions message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ConsumedServiceOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): interop.ConsumedServiceOptions;

        /**
         * Verifies a ConsumedServiceOptions message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ConsumedServiceOptions message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ConsumedServiceOptions
         */
        public static fromObject(object: { [k: string]: any }): interop.ConsumedServiceOptions;

        /**
         * Creates a plain object from a ConsumedServiceOptions message. Also converts values to other types if specified.
         * @param message ConsumedServiceOptions
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: interop.ConsumedServiceOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ConsumedServiceOptions to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a ProvidedMethodOptions. */
    interface IProvidedMethodOptions {

        /** ProvidedMethodOptions title */
        title?: (string|null);

        /** ProvidedMethodOptions launchOnCall */
        launchOnCall?: (interop.ApplicationLaunchOnCallMode|null);

        /** ProvidedMethodOptions timeoutMs */
        timeoutMs?: (number|null);
    }

    /** Represents a ProvidedMethodOptions. */
    class ProvidedMethodOptions implements IProvidedMethodOptions {

        /**
         * Constructs a new ProvidedMethodOptions.
         * @param [properties] Properties to set
         */
        constructor(properties?: interop.IProvidedMethodOptions);

        /** ProvidedMethodOptions title. */
        public title: string;

        /** ProvidedMethodOptions launchOnCall. */
        public launchOnCall: interop.ApplicationLaunchOnCallMode;

        /** ProvidedMethodOptions timeoutMs. */
        public timeoutMs: number;

        /**
         * Creates a new ProvidedMethodOptions instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ProvidedMethodOptions instance
         */
        public static create(properties?: interop.IProvidedMethodOptions): interop.ProvidedMethodOptions;

        /**
         * Encodes the specified ProvidedMethodOptions message. Does not implicitly {@link interop.ProvidedMethodOptions.verify|verify} messages.
         * @param message ProvidedMethodOptions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: interop.IProvidedMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ProvidedMethodOptions message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ProvidedMethodOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): interop.ProvidedMethodOptions;

        /**
         * Verifies a ProvidedMethodOptions message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ProvidedMethodOptions message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ProvidedMethodOptions
         */
        public static fromObject(object: { [k: string]: any }): interop.ProvidedMethodOptions;

        /**
         * Creates a plain object from a ProvidedMethodOptions message. Also converts values to other types if specified.
         * @param message ProvidedMethodOptions
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: interop.ProvidedMethodOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ProvidedMethodOptions to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a ConsumedMethodOptions. */
    interface IConsumedMethodOptions {
    }

    /** Represents a ConsumedMethodOptions. */
    class ConsumedMethodOptions implements IConsumedMethodOptions {

        /**
         * Constructs a new ConsumedMethodOptions.
         * @param [properties] Properties to set
         */
        constructor(properties?: interop.IConsumedMethodOptions);

        /**
         * Creates a new ConsumedMethodOptions instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ConsumedMethodOptions instance
         */
        public static create(properties?: interop.IConsumedMethodOptions): interop.ConsumedMethodOptions;

        /**
         * Encodes the specified ConsumedMethodOptions message. Does not implicitly {@link interop.ConsumedMethodOptions.verify|verify} messages.
         * @param message ConsumedMethodOptions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: interop.IConsumedMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ConsumedMethodOptions message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ConsumedMethodOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): interop.ConsumedMethodOptions;

        /**
         * Verifies a ConsumedMethodOptions message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ConsumedMethodOptions message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ConsumedMethodOptions
         */
        public static fromObject(object: { [k: string]: any }): interop.ConsumedMethodOptions;

        /**
         * Creates a plain object from a ConsumedMethodOptions message. Also converts values to other types if specified.
         * @param message ConsumedMethodOptions
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: interop.ConsumedMethodOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ConsumedMethodOptions to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** ApplicationLaunchOnCallMode enum. */
    enum ApplicationLaunchOnCallMode {
        IF_NOT_LAUNCHED = 0,
        DEFAULT = 0,
        ALWAYS = 1,
        ENABLED = 1,
        NEVER = 2,
        DISABLED = 2
    }
}

/** Namespace plexus. */
export namespace plexus {

    /** Namespace interop. */
    namespace interop {

        /** Namespace testing. */
        namespace testing {

            /** Represents an EchoService */
            class EchoService extends $protobuf.rpc.Service {

                /**
                 * Constructs a new EchoService service.
                 * @param rpcImpl RPC implementation
                 * @param [requestDelimited=false] Whether requests are length-delimited
                 * @param [responseDelimited=false] Whether responses are length-delimited
                 */
                constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

                /**
                 * Creates new EchoService service using the specified rpc implementation.
                 * @param rpcImpl RPC implementation
                 * @param [requestDelimited=false] Whether requests are length-delimited
                 * @param [responseDelimited=false] Whether responses are length-delimited
                 * @returns RPC service. Useful where requests and/or responses are streamed.
                 */
                public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): EchoService;

                /**
                 * Calls Unary.
                 * @param request EchoRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and EchoRequest
                 */
                public unary(request: plexus.interop.testing.IEchoRequest, callback: plexus.interop.testing.EchoService.UnaryCallback): void;

                /**
                 * Calls Unary.
                 * @param request EchoRequest message or plain object
                 * @returns Promise
                 */
                public unary(request: plexus.interop.testing.IEchoRequest): Promise<plexus.interop.testing.EchoRequest>;

                /**
                 * Calls ServerStreaming.
                 * @param request EchoRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and EchoRequest
                 */
                public serverStreaming(request: plexus.interop.testing.IEchoRequest, callback: plexus.interop.testing.EchoService.ServerStreamingCallback): void;

                /**
                 * Calls ServerStreaming.
                 * @param request EchoRequest message or plain object
                 * @returns Promise
                 */
                public serverStreaming(request: plexus.interop.testing.IEchoRequest): Promise<plexus.interop.testing.EchoRequest>;

                /**
                 * Calls ClientStreaming.
                 * @param request EchoRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and EchoRequest
                 */
                public clientStreaming(request: plexus.interop.testing.IEchoRequest, callback: plexus.interop.testing.EchoService.ClientStreamingCallback): void;

                /**
                 * Calls ClientStreaming.
                 * @param request EchoRequest message or plain object
                 * @returns Promise
                 */
                public clientStreaming(request: plexus.interop.testing.IEchoRequest): Promise<plexus.interop.testing.EchoRequest>;

                /**
                 * Calls DuplexStreaming.
                 * @param request EchoRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and EchoRequest
                 */
                public duplexStreaming(request: plexus.interop.testing.IEchoRequest, callback: plexus.interop.testing.EchoService.DuplexStreamingCallback): void;

                /**
                 * Calls DuplexStreaming.
                 * @param request EchoRequest message or plain object
                 * @returns Promise
                 */
                public duplexStreaming(request: plexus.interop.testing.IEchoRequest): Promise<plexus.interop.testing.EchoRequest>;
            }

            namespace EchoService {

                /**
                 * Callback as used by {@link plexus.interop.testing.EchoService#unary}.
                 * @param error Error, if any
                 * @param [response] EchoRequest
                 */
                type UnaryCallback = (error: (Error|null), response?: plexus.interop.testing.EchoRequest) => void;

                /**
                 * Callback as used by {@link plexus.interop.testing.EchoService#serverStreaming}.
                 * @param error Error, if any
                 * @param [response] EchoRequest
                 */
                type ServerStreamingCallback = (error: (Error|null), response?: plexus.interop.testing.EchoRequest) => void;

                /**
                 * Callback as used by {@link plexus.interop.testing.EchoService#clientStreaming}.
                 * @param error Error, if any
                 * @param [response] EchoRequest
                 */
                type ClientStreamingCallback = (error: (Error|null), response?: plexus.interop.testing.EchoRequest) => void;

                /**
                 * Callback as used by {@link plexus.interop.testing.EchoService#duplexStreaming}.
                 * @param error Error, if any
                 * @param [response] EchoRequest
                 */
                type DuplexStreamingCallback = (error: (Error|null), response?: plexus.interop.testing.EchoRequest) => void;
            }

            /** Properties of an EchoRequest. */
            interface IEchoRequest {

                /** EchoRequest stringField */
                stringField?: (string|null);

                /** EchoRequest int64Field */
                int64Field?: (Long|null);

                /** EchoRequest uint32Field */
                uint32Field?: (number|null);

                /** EchoRequest repeatedDoubleField */
                repeatedDoubleField?: (number[]|null);

                /** EchoRequest enumField */
                enumField?: (plexus.interop.testing.EchoRequest.SubEnum|null);

                /** EchoRequest subMessageField */
                subMessageField?: (plexus.interop.testing.EchoRequest.ISubMessage|null);

                /** EchoRequest repeatedSubMessageField */
                repeatedSubMessageField?: (plexus.interop.testing.EchoRequest.ISubMessage[]|null);
            }

            /** Represents an EchoRequest. */
            class EchoRequest implements IEchoRequest {

                /**
                 * Constructs a new EchoRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: plexus.interop.testing.IEchoRequest);

                /** EchoRequest stringField. */
                public stringField: string;

                /** EchoRequest int64Field. */
                public int64Field: Long;

                /** EchoRequest uint32Field. */
                public uint32Field: number;

                /** EchoRequest repeatedDoubleField. */
                public repeatedDoubleField: number[];

                /** EchoRequest enumField. */
                public enumField: plexus.interop.testing.EchoRequest.SubEnum;

                /** EchoRequest subMessageField. */
                public subMessageField?: (plexus.interop.testing.EchoRequest.ISubMessage|null);

                /** EchoRequest repeatedSubMessageField. */
                public repeatedSubMessageField: plexus.interop.testing.EchoRequest.ISubMessage[];

                /**
                 * Creates a new EchoRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns EchoRequest instance
                 */
                public static create(properties?: plexus.interop.testing.IEchoRequest): plexus.interop.testing.EchoRequest;

                /**
                 * Encodes the specified EchoRequest message. Does not implicitly {@link plexus.interop.testing.EchoRequest.verify|verify} messages.
                 * @param message EchoRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: plexus.interop.testing.IEchoRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EchoRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EchoRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.testing.EchoRequest;

                /**
                 * Verifies an EchoRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EchoRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EchoRequest
                 */
                public static fromObject(object: { [k: string]: any }): plexus.interop.testing.EchoRequest;

                /**
                 * Creates a plain object from an EchoRequest message. Also converts values to other types if specified.
                 * @param message EchoRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: plexus.interop.testing.EchoRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EchoRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            namespace EchoRequest {

                /** Properties of a SubMessage. */
                interface ISubMessage {

                    /** SubMessage bytesField */
                    bytesField?: (Uint8Array|null);

                    /** SubMessage stringField */
                    stringField?: (string|null);
                }

                /** Represents a SubMessage. */
                class SubMessage implements ISubMessage {

                    /**
                     * Constructs a new SubMessage.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: plexus.interop.testing.EchoRequest.ISubMessage);

                    /** SubMessage bytesField. */
                    public bytesField: Uint8Array;

                    /** SubMessage stringField. */
                    public stringField: string;

                    /**
                     * Creates a new SubMessage instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns SubMessage instance
                     */
                    public static create(properties?: plexus.interop.testing.EchoRequest.ISubMessage): plexus.interop.testing.EchoRequest.SubMessage;

                    /**
                     * Encodes the specified SubMessage message. Does not implicitly {@link plexus.interop.testing.EchoRequest.SubMessage.verify|verify} messages.
                     * @param message SubMessage message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: plexus.interop.testing.EchoRequest.ISubMessage, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a SubMessage message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns SubMessage
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.testing.EchoRequest.SubMessage;

                    /**
                     * Verifies a SubMessage message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a SubMessage message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns SubMessage
                     */
                    public static fromObject(object: { [k: string]: any }): plexus.interop.testing.EchoRequest.SubMessage;

                    /**
                     * Creates a plain object from a SubMessage message. Also converts values to other types if specified.
                     * @param message SubMessage
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: plexus.interop.testing.EchoRequest.SubMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this SubMessage to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** SubEnum enum. */
                enum SubEnum {
                    VALUE_ONE = 0,
                    VALUE_TWO = 1
                }
            }
        }
    }
}
