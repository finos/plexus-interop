/*
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots.plexus || ($protobuf.roots.plexus = {});

$root.fx = (function() {

    /**
     * Namespace fx.
     * @exports fx
     * @namespace
     */
    var fx = {};

    fx.CcyPair = (function() {

        /**
         * Properties of a CcyPair.
         * @memberof fx
         * @interface ICcyPair
         * @property {string|null} [ccyPairName] CcyPair ccyPairName
         */

        /**
         * Constructs a new CcyPair.
         * @memberof fx
         * @classdesc Represents a CcyPair.
         * @implements ICcyPair
         * @constructor
         * @param {fx.ICcyPair=} [properties] Properties to set
         */
        function CcyPair(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CcyPair ccyPairName.
         * @member {string} ccyPairName
         * @memberof fx.CcyPair
         * @instance
         */
        CcyPair.prototype.ccyPairName = "";

        /**
         * Creates a new CcyPair instance using the specified properties.
         * @function create
         * @memberof fx.CcyPair
         * @static
         * @param {fx.ICcyPair=} [properties] Properties to set
         * @returns {fx.CcyPair} CcyPair instance
         */
        CcyPair.create = function create(properties) {
            return new CcyPair(properties);
        };

        /**
         * Encodes the specified CcyPair message. Does not implicitly {@link fx.CcyPair.verify|verify} messages.
         * @function encode
         * @memberof fx.CcyPair
         * @static
         * @param {fx.ICcyPair} message CcyPair message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CcyPair.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ccyPairName != null && message.hasOwnProperty("ccyPairName"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.ccyPairName);
            return writer;
        };

        /**
         * Encodes the specified CcyPair message, length delimited. Does not implicitly {@link fx.CcyPair.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fx.CcyPair
         * @static
         * @param {fx.ICcyPair} message CcyPair message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CcyPair.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CcyPair message from the specified reader or buffer.
         * @function decode
         * @memberof fx.CcyPair
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fx.CcyPair} CcyPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CcyPair.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.fx.CcyPair();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.ccyPairName = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CcyPair message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fx.CcyPair
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fx.CcyPair} CcyPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CcyPair.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CcyPair message.
         * @function verify
         * @memberof fx.CcyPair
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CcyPair.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.ccyPairName != null && message.hasOwnProperty("ccyPairName"))
                if (!$util.isString(message.ccyPairName))
                    return "ccyPairName: string expected";
            return null;
        };

        /**
         * Creates a CcyPair message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fx.CcyPair
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fx.CcyPair} CcyPair
         */
        CcyPair.fromObject = function fromObject(object) {
            if (object instanceof $root.fx.CcyPair)
                return object;
            var message = new $root.fx.CcyPair();
            if (object.ccyPairName != null)
                message.ccyPairName = String(object.ccyPairName);
            return message;
        };

        /**
         * Creates a plain object from a CcyPair message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fx.CcyPair
         * @static
         * @param {fx.CcyPair} message CcyPair
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CcyPair.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.ccyPairName = "";
            if (message.ccyPairName != null && message.hasOwnProperty("ccyPairName"))
                object.ccyPairName = message.ccyPairName;
            return object;
        };

        /**
         * Converts this CcyPair to JSON.
         * @function toJSON
         * @memberof fx.CcyPair
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CcyPair.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return CcyPair;
    })();

    fx.CcyPairRate = (function() {

        /**
         * Properties of a CcyPairRate.
         * @memberof fx
         * @interface ICcyPairRate
         * @property {string|null} [ccyPairName] CcyPairRate ccyPairName
         * @property {number|null} [rate] CcyPairRate rate
         */

        /**
         * Constructs a new CcyPairRate.
         * @memberof fx
         * @classdesc Represents a CcyPairRate.
         * @implements ICcyPairRate
         * @constructor
         * @param {fx.ICcyPairRate=} [properties] Properties to set
         */
        function CcyPairRate(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CcyPairRate ccyPairName.
         * @member {string} ccyPairName
         * @memberof fx.CcyPairRate
         * @instance
         */
        CcyPairRate.prototype.ccyPairName = "";

        /**
         * CcyPairRate rate.
         * @member {number} rate
         * @memberof fx.CcyPairRate
         * @instance
         */
        CcyPairRate.prototype.rate = 0;

        /**
         * Creates a new CcyPairRate instance using the specified properties.
         * @function create
         * @memberof fx.CcyPairRate
         * @static
         * @param {fx.ICcyPairRate=} [properties] Properties to set
         * @returns {fx.CcyPairRate} CcyPairRate instance
         */
        CcyPairRate.create = function create(properties) {
            return new CcyPairRate(properties);
        };

        /**
         * Encodes the specified CcyPairRate message. Does not implicitly {@link fx.CcyPairRate.verify|verify} messages.
         * @function encode
         * @memberof fx.CcyPairRate
         * @static
         * @param {fx.ICcyPairRate} message CcyPairRate message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CcyPairRate.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ccyPairName != null && message.hasOwnProperty("ccyPairName"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.ccyPairName);
            if (message.rate != null && message.hasOwnProperty("rate"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.rate);
            return writer;
        };

        /**
         * Encodes the specified CcyPairRate message, length delimited. Does not implicitly {@link fx.CcyPairRate.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fx.CcyPairRate
         * @static
         * @param {fx.ICcyPairRate} message CcyPairRate message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CcyPairRate.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CcyPairRate message from the specified reader or buffer.
         * @function decode
         * @memberof fx.CcyPairRate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fx.CcyPairRate} CcyPairRate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CcyPairRate.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.fx.CcyPairRate();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.ccyPairName = reader.string();
                    break;
                case 2:
                    message.rate = reader.double();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CcyPairRate message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fx.CcyPairRate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fx.CcyPairRate} CcyPairRate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CcyPairRate.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CcyPairRate message.
         * @function verify
         * @memberof fx.CcyPairRate
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CcyPairRate.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.ccyPairName != null && message.hasOwnProperty("ccyPairName"))
                if (!$util.isString(message.ccyPairName))
                    return "ccyPairName: string expected";
            if (message.rate != null && message.hasOwnProperty("rate"))
                if (typeof message.rate !== "number")
                    return "rate: number expected";
            return null;
        };

        /**
         * Creates a CcyPairRate message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fx.CcyPairRate
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fx.CcyPairRate} CcyPairRate
         */
        CcyPairRate.fromObject = function fromObject(object) {
            if (object instanceof $root.fx.CcyPairRate)
                return object;
            var message = new $root.fx.CcyPairRate();
            if (object.ccyPairName != null)
                message.ccyPairName = String(object.ccyPairName);
            if (object.rate != null)
                message.rate = Number(object.rate);
            return message;
        };

        /**
         * Creates a plain object from a CcyPairRate message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fx.CcyPairRate
         * @static
         * @param {fx.CcyPairRate} message CcyPairRate
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CcyPairRate.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.ccyPairName = "";
                object.rate = 0;
            }
            if (message.ccyPairName != null && message.hasOwnProperty("ccyPairName"))
                object.ccyPairName = message.ccyPairName;
            if (message.rate != null && message.hasOwnProperty("rate"))
                object.rate = options.json && !isFinite(message.rate) ? String(message.rate) : message.rate;
            return object;
        };

        /**
         * Converts this CcyPairRate to JSON.
         * @function toJSON
         * @memberof fx.CcyPairRate
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CcyPairRate.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return CcyPairRate;
    })();

    fx.CcyPairRateService = (function() {

        /**
         * Constructs a new CcyPairRateService service.
         * @memberof fx
         * @classdesc Represents a CcyPairRateService
         * @extends $protobuf.rpc.Service
         * @constructor
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         */
        function CcyPairRateService(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
        }

        (CcyPairRateService.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = CcyPairRateService;

        /**
         * Creates new CcyPairRateService service using the specified rpc implementation.
         * @function create
         * @memberof fx.CcyPairRateService
         * @static
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         * @returns {CcyPairRateService} RPC service. Useful where requests and/or responses are streamed.
         */
        CcyPairRateService.create = function create(rpcImpl, requestDelimited, responseDelimited) {
            return new this(rpcImpl, requestDelimited, responseDelimited);
        };

        /**
         * Callback as used by {@link fx.CcyPairRateService#getRate}.
         * @memberof fx.CcyPairRateService
         * @typedef GetRateCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {fx.CcyPairRate} [response] CcyPairRate
         */

        /**
         * Calls GetRate.
         * @function getRate
         * @memberof fx.CcyPairRateService
         * @instance
         * @param {fx.ICcyPair} request CcyPair message or plain object
         * @param {fx.CcyPairRateService.GetRateCallback} callback Node-style callback called with the error, if any, and CcyPairRate
         * @returns {undefined}
         * @variation 1
         */
        CcyPairRateService.prototype.getRate = function getRate(request, callback) {
            return this.rpcCall(getRate, $root.fx.CcyPair, $root.fx.CcyPairRate, request, callback);
        };

        /**
         * Calls GetRate.
         * @function getRate
         * @memberof fx.CcyPairRateService
         * @instance
         * @param {fx.ICcyPair} request CcyPair message or plain object
         * @returns {Promise<fx.CcyPairRate>} Promise
         * @variation 2
         */

        return CcyPairRateService;
    })();

    return fx;
})();

module.exports = $root;
