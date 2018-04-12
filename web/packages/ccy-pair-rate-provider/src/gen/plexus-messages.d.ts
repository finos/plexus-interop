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

/** Namespace fx. */
export namespace fx {

    /** Properties of a CcyPair. */
    interface ICcyPair {

        /** CcyPair ccyPairName */
        ccyPairName?: (string|null);
    }

    /** Represents a CcyPair. */
    class CcyPair implements ICcyPair {

        /**
         * Constructs a new CcyPair.
         * @param [properties] Properties to set
         */
        constructor(properties?: fx.ICcyPair);

        /** CcyPair ccyPairName. */
        public ccyPairName: string;

        /**
         * Creates a new CcyPair instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CcyPair instance
         */
        public static create(properties?: fx.ICcyPair): fx.CcyPair;

        /**
         * Encodes the specified CcyPair message. Does not implicitly {@link fx.CcyPair.verify|verify} messages.
         * @param message CcyPair message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fx.ICcyPair, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CcyPair message, length delimited. Does not implicitly {@link fx.CcyPair.verify|verify} messages.
         * @param message CcyPair message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fx.ICcyPair, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CcyPair message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CcyPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fx.CcyPair;

        /**
         * Decodes a CcyPair message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CcyPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fx.CcyPair;

        /**
         * Verifies a CcyPair message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CcyPair message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CcyPair
         */
        public static fromObject(object: { [k: string]: any }): fx.CcyPair;

        /**
         * Creates a plain object from a CcyPair message. Also converts values to other types if specified.
         * @param message CcyPair
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fx.CcyPair, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CcyPair to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a CcyPairRate. */
    interface ICcyPairRate {

        /** CcyPairRate ccyPairName */
        ccyPairName?: (string|null);

        /** CcyPairRate rate */
        rate?: (number|null);
    }

    /** Represents a CcyPairRate. */
    class CcyPairRate implements ICcyPairRate {

        /**
         * Constructs a new CcyPairRate.
         * @param [properties] Properties to set
         */
        constructor(properties?: fx.ICcyPairRate);

        /** CcyPairRate ccyPairName. */
        public ccyPairName: string;

        /** CcyPairRate rate. */
        public rate: number;

        /**
         * Creates a new CcyPairRate instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CcyPairRate instance
         */
        public static create(properties?: fx.ICcyPairRate): fx.CcyPairRate;

        /**
         * Encodes the specified CcyPairRate message. Does not implicitly {@link fx.CcyPairRate.verify|verify} messages.
         * @param message CcyPairRate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fx.ICcyPairRate, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CcyPairRate message, length delimited. Does not implicitly {@link fx.CcyPairRate.verify|verify} messages.
         * @param message CcyPairRate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fx.ICcyPairRate, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CcyPairRate message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CcyPairRate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fx.CcyPairRate;

        /**
         * Decodes a CcyPairRate message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CcyPairRate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fx.CcyPairRate;

        /**
         * Verifies a CcyPairRate message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CcyPairRate message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CcyPairRate
         */
        public static fromObject(object: { [k: string]: any }): fx.CcyPairRate;

        /**
         * Creates a plain object from a CcyPairRate message. Also converts values to other types if specified.
         * @param message CcyPairRate
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fx.CcyPairRate, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CcyPairRate to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Represents a CcyPairRateService */
    class CcyPairRateService extends $protobuf.rpc.Service {

        /**
         * Constructs a new CcyPairRateService service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new CcyPairRateService service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): CcyPairRateService;

        /**
         * Calls GetRate.
         * @param request CcyPair message or plain object
         * @param callback Node-style callback called with the error, if any, and CcyPairRate
         */
        public getRate(request: fx.ICcyPair, callback: fx.CcyPairRateService.GetRateCallback): void;

        /**
         * Calls GetRate.
         * @param request CcyPair message or plain object
         * @returns Promise
         */
        public getRate(request: fx.ICcyPair): Promise<fx.CcyPairRate>;
    }

    namespace CcyPairRateService {

        /**
         * Callback as used by {@link fx.CcyPairRateService#getRate}.
         * @param error Error, if any
         * @param [response] CcyPairRate
         */
        type GetRateCallback = (error: (Error|null), response?: fx.CcyPairRate) => void;
    }
}
