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

        /** Namespace testing. */
        namespace testing {

            /** Properties of an EchoRequest. */
            interface IEchoRequest {

                /** EchoRequest stringField */
                stringField?: string;

                /** EchoRequest int64Field */
                int64Field?: Long;

                /** EchoRequest uint32Field */
                uint32Field?: number;

                /** EchoRequest repeatedDoubleField */
                repeatedDoubleField?: number[];

                /** EchoRequest enumField */
                enumField?: plexus.interop.testing.EchoRequest.SubEnum;

                /** EchoRequest subMessageField */
                subMessageField?: plexus.interop.testing.EchoRequest.ISubMessage;

                /** EchoRequest repeatedSubMessageField */
                repeatedSubMessageField?: plexus.interop.testing.EchoRequest.ISubMessage[];
            }

            /** Represents an EchoRequest. */
            class EchoRequest {

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
                 * Encodes the specified EchoRequest message, length delimited. Does not implicitly {@link plexus.interop.testing.EchoRequest.verify|verify} messages.
                 * @param message EchoRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: plexus.interop.testing.IEchoRequest, writer?: $protobuf.Writer): $protobuf.Writer;

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
                 * Decodes an EchoRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EchoRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.testing.EchoRequest;

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
                    bytesField?: Uint8Array;

                    /** SubMessage stringField */
                    stringField?: string;
                }

                /** Represents a SubMessage. */
                class SubMessage {

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
                     * Encodes the specified SubMessage message, length delimited. Does not implicitly {@link plexus.interop.testing.EchoRequest.SubMessage.verify|verify} messages.
                     * @param message SubMessage message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: plexus.interop.testing.EchoRequest.ISubMessage, writer?: $protobuf.Writer): $protobuf.Writer;

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
                     * Decodes a SubMessage message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns SubMessage
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.testing.EchoRequest.SubMessage;

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
                    value_one = 0,
                    value_two = 1
                }
            }
        }
    }
}
