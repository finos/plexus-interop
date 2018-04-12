/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as $protobuf from 'protobufjs';

/** Namespace interop. */
export namespace interop {

    /** Namespace samples. */
    namespace samples {

        /** Represents a GreetingService */
        class GreetingService extends $protobuf.rpc.Service {

            /**
             * Constructs a new GreetingService service.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             */
            constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

            /**
             * Creates new GreetingService service using the specified rpc implementation.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             * @returns RPC service. Useful where requests and/or responses are streamed.
             */
            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): GreetingService;

            /**
             * Calls Unary.
             * @param request GreetingRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and GreetingResponse
             */
            public unary(request: interop.samples.IGreetingRequest, callback: interop.samples.GreetingService.UnaryCallback): void;

            /**
             * Calls Unary.
             * @param request GreetingRequest message or plain object
             * @returns Promise
             */
            public unary(request: interop.samples.IGreetingRequest): Promise<interop.samples.GreetingResponse>;

            /**
             * Calls ServerStreaming.
             * @param request GreetingRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and GreetingResponse
             */
            public serverStreaming(request: interop.samples.IGreetingRequest, callback: interop.samples.GreetingService.ServerStreamingCallback): void;

            /**
             * Calls ServerStreaming.
             * @param request GreetingRequest message or plain object
             * @returns Promise
             */
            public serverStreaming(request: interop.samples.IGreetingRequest): Promise<interop.samples.GreetingResponse>;

            /**
             * Calls ClientStreaming.
             * @param request GreetingRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and GreetingResponse
             */
            public clientStreaming(request: interop.samples.IGreetingRequest, callback: interop.samples.GreetingService.ClientStreamingCallback): void;

            /**
             * Calls ClientStreaming.
             * @param request GreetingRequest message or plain object
             * @returns Promise
             */
            public clientStreaming(request: interop.samples.IGreetingRequest): Promise<interop.samples.GreetingResponse>;

            /**
             * Calls DuplexStreaming.
             * @param request GreetingRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and GreetingResponse
             */
            public duplexStreaming(request: interop.samples.IGreetingRequest, callback: interop.samples.GreetingService.DuplexStreamingCallback): void;

            /**
             * Calls DuplexStreaming.
             * @param request GreetingRequest message or plain object
             * @returns Promise
             */
            public duplexStreaming(request: interop.samples.IGreetingRequest): Promise<interop.samples.GreetingResponse>;
        }

        namespace GreetingService {

            /**
             * Callback as used by {@link interop.samples.GreetingService#unary}.
             * @param error Error, if any
             * @param [response] GreetingResponse
             */
            type UnaryCallback = (error: (Error|null), response?: interop.samples.GreetingResponse) => void;

            /**
             * Callback as used by {@link interop.samples.GreetingService#serverStreaming}.
             * @param error Error, if any
             * @param [response] GreetingResponse
             */
            type ServerStreamingCallback = (error: (Error|null), response?: interop.samples.GreetingResponse) => void;

            /**
             * Callback as used by {@link interop.samples.GreetingService#clientStreaming}.
             * @param error Error, if any
             * @param [response] GreetingResponse
             */
            type ClientStreamingCallback = (error: (Error|null), response?: interop.samples.GreetingResponse) => void;

            /**
             * Callback as used by {@link interop.samples.GreetingService#duplexStreaming}.
             * @param error Error, if any
             * @param [response] GreetingResponse
             */
            type DuplexStreamingCallback = (error: (Error|null), response?: interop.samples.GreetingResponse) => void;
        }

        /** Properties of a GreetingRequest. */
        interface IGreetingRequest {

            /** GreetingRequest name */
            name?: string;
        }

        /** Represents a GreetingRequest. */
        class GreetingRequest {

            /**
             * Constructs a new GreetingRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: interop.samples.IGreetingRequest);

            /** GreetingRequest name. */
            public name: string;

            /**
             * Creates a new GreetingRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GreetingRequest instance
             */
            public static create(properties?: interop.samples.IGreetingRequest): interop.samples.GreetingRequest;

            /**
             * Encodes the specified GreetingRequest message. Does not implicitly {@link interop.samples.GreetingRequest.verify|verify} messages.
             * @param message GreetingRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: interop.samples.IGreetingRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GreetingRequest message, length delimited. Does not implicitly {@link interop.samples.GreetingRequest.verify|verify} messages.
             * @param message GreetingRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: interop.samples.IGreetingRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GreetingRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GreetingRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): interop.samples.GreetingRequest;

            /**
             * Decodes a GreetingRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GreetingRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): interop.samples.GreetingRequest;

            /**
             * Verifies a GreetingRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GreetingRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GreetingRequest
             */
            public static fromObject(object: { [k: string]: any }): interop.samples.GreetingRequest;

            /**
             * Creates a plain object from a GreetingRequest message. Also converts values to other types if specified.
             * @param message GreetingRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: interop.samples.GreetingRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GreetingRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a GreetingResponse. */
        interface IGreetingResponse {

            /** GreetingResponse greeting */
            greeting?: string;
        }

        /** Represents a GreetingResponse. */
        class GreetingResponse {

            /**
             * Constructs a new GreetingResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: interop.samples.IGreetingResponse);

            /** GreetingResponse greeting. */
            public greeting: string;

            /**
             * Creates a new GreetingResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GreetingResponse instance
             */
            public static create(properties?: interop.samples.IGreetingResponse): interop.samples.GreetingResponse;

            /**
             * Encodes the specified GreetingResponse message. Does not implicitly {@link interop.samples.GreetingResponse.verify|verify} messages.
             * @param message GreetingResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: interop.samples.IGreetingResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GreetingResponse message, length delimited. Does not implicitly {@link interop.samples.GreetingResponse.verify|verify} messages.
             * @param message GreetingResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: interop.samples.IGreetingResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GreetingResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GreetingResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): interop.samples.GreetingResponse;

            /**
             * Decodes a GreetingResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GreetingResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): interop.samples.GreetingResponse;

            /**
             * Verifies a GreetingResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GreetingResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GreetingResponse
             */
            public static fromObject(object: { [k: string]: any }): interop.samples.GreetingResponse;

            /**
             * Creates a plain object from a GreetingResponse message. Also converts values to other types if specified.
             * @param message GreetingResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: interop.samples.GreetingResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GreetingResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
