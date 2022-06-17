/*
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
/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots.plexus || ($protobuf.roots.plexus = {});

$root.plexus = (function() {

    /**
     * Namespace plexus.
     * @exports plexus
     * @namespace
     */
    var plexus = {};

    plexus.interop = (function() {

        /**
         * Namespace interop.
         * @memberof plexus
         * @namespace
         */
        var interop = {};

        interop.testing = (function() {

            /**
             * Namespace testing.
             * @memberof plexus.interop
             * @namespace
             */
            var testing = {};

            testing.EchoService = (function() {

                /**
                 * Constructs a new EchoService service.
                 * @memberof plexus.interop.testing
                 * @classdesc Represents an EchoService
                 * @extends $protobuf.rpc.Service
                 * @constructor
                 * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
                 * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
                 * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
                 */
                function EchoService(rpcImpl, requestDelimited, responseDelimited) {
                    $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
                }

                (EchoService.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = EchoService;

                /**
                 * Creates new EchoService service using the specified rpc implementation.
                 * @function create
                 * @memberof plexus.interop.testing.EchoService
                 * @static
                 * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
                 * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
                 * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
                 * @returns {EchoService} RPC service. Useful where requests and/or responses are streamed.
                 */
                EchoService.create = function create(rpcImpl, requestDelimited, responseDelimited) {
                    return new this(rpcImpl, requestDelimited, responseDelimited);
                };

                /**
                 * Callback as used by {@link plexus.interop.testing.EchoService#unary}.
                 * @memberof plexus.interop.testing.EchoService
                 * @typedef UnaryCallback
                 * @type {function}
                 * @param {Error|null} error Error, if any
                 * @param {plexus.interop.testing.EchoRequest} [response] EchoRequest
                 */

                /**
                 * Calls Unary.
                 * @function unary
                 * @memberof plexus.interop.testing.EchoService
                 * @instance
                 * @param {plexus.interop.testing.IEchoRequest} request EchoRequest message or plain object
                 * @param {plexus.interop.testing.EchoService.UnaryCallback} callback Node-style callback called with the error, if any, and EchoRequest
                 * @returns {undefined}
                 * @variation 1
                 */
                Object.defineProperty(EchoService.prototype.unary = function unary(request, callback) {
                    return this.rpcCall(unary, $root.plexus.interop.testing.EchoRequest, $root.plexus.interop.testing.EchoRequest, request, callback);
                }, "name", { value: "Unary" });

                /**
                 * Calls Unary.
                 * @function unary
                 * @memberof plexus.interop.testing.EchoService
                 * @instance
                 * @param {plexus.interop.testing.IEchoRequest} request EchoRequest message or plain object
                 * @returns {Promise<plexus.interop.testing.EchoRequest>} Promise
                 * @variation 2
                 */

                /**
                 * Callback as used by {@link plexus.interop.testing.EchoService#serverStreaming}.
                 * @memberof plexus.interop.testing.EchoService
                 * @typedef ServerStreamingCallback
                 * @type {function}
                 * @param {Error|null} error Error, if any
                 * @param {plexus.interop.testing.EchoRequest} [response] EchoRequest
                 */

                /**
                 * Calls ServerStreaming.
                 * @function serverStreaming
                 * @memberof plexus.interop.testing.EchoService
                 * @instance
                 * @param {plexus.interop.testing.IEchoRequest} request EchoRequest message or plain object
                 * @param {plexus.interop.testing.EchoService.ServerStreamingCallback} callback Node-style callback called with the error, if any, and EchoRequest
                 * @returns {undefined}
                 * @variation 1
                 */
                Object.defineProperty(EchoService.prototype.serverStreaming = function serverStreaming(request, callback) {
                    return this.rpcCall(serverStreaming, $root.plexus.interop.testing.EchoRequest, $root.plexus.interop.testing.EchoRequest, request, callback);
                }, "name", { value: "ServerStreaming" });

                /**
                 * Calls ServerStreaming.
                 * @function serverStreaming
                 * @memberof plexus.interop.testing.EchoService
                 * @instance
                 * @param {plexus.interop.testing.IEchoRequest} request EchoRequest message or plain object
                 * @returns {Promise<plexus.interop.testing.EchoRequest>} Promise
                 * @variation 2
                 */

                /**
                 * Callback as used by {@link plexus.interop.testing.EchoService#clientStreaming}.
                 * @memberof plexus.interop.testing.EchoService
                 * @typedef ClientStreamingCallback
                 * @type {function}
                 * @param {Error|null} error Error, if any
                 * @param {plexus.interop.testing.EchoRequest} [response] EchoRequest
                 */

                /**
                 * Calls ClientStreaming.
                 * @function clientStreaming
                 * @memberof plexus.interop.testing.EchoService
                 * @instance
                 * @param {plexus.interop.testing.IEchoRequest} request EchoRequest message or plain object
                 * @param {plexus.interop.testing.EchoService.ClientStreamingCallback} callback Node-style callback called with the error, if any, and EchoRequest
                 * @returns {undefined}
                 * @variation 1
                 */
                Object.defineProperty(EchoService.prototype.clientStreaming = function clientStreaming(request, callback) {
                    return this.rpcCall(clientStreaming, $root.plexus.interop.testing.EchoRequest, $root.plexus.interop.testing.EchoRequest, request, callback);
                }, "name", { value: "ClientStreaming" });

                /**
                 * Calls ClientStreaming.
                 * @function clientStreaming
                 * @memberof plexus.interop.testing.EchoService
                 * @instance
                 * @param {plexus.interop.testing.IEchoRequest} request EchoRequest message or plain object
                 * @returns {Promise<plexus.interop.testing.EchoRequest>} Promise
                 * @variation 2
                 */

                /**
                 * Callback as used by {@link plexus.interop.testing.EchoService#duplexStreaming}.
                 * @memberof plexus.interop.testing.EchoService
                 * @typedef DuplexStreamingCallback
                 * @type {function}
                 * @param {Error|null} error Error, if any
                 * @param {plexus.interop.testing.EchoRequest} [response] EchoRequest
                 */

                /**
                 * Calls DuplexStreaming.
                 * @function duplexStreaming
                 * @memberof plexus.interop.testing.EchoService
                 * @instance
                 * @param {plexus.interop.testing.IEchoRequest} request EchoRequest message or plain object
                 * @param {plexus.interop.testing.EchoService.DuplexStreamingCallback} callback Node-style callback called with the error, if any, and EchoRequest
                 * @returns {undefined}
                 * @variation 1
                 */
                Object.defineProperty(EchoService.prototype.duplexStreaming = function duplexStreaming(request, callback) {
                    return this.rpcCall(duplexStreaming, $root.plexus.interop.testing.EchoRequest, $root.plexus.interop.testing.EchoRequest, request, callback);
                }, "name", { value: "DuplexStreaming" });

                /**
                 * Calls DuplexStreaming.
                 * @function duplexStreaming
                 * @memberof plexus.interop.testing.EchoService
                 * @instance
                 * @param {plexus.interop.testing.IEchoRequest} request EchoRequest message or plain object
                 * @returns {Promise<plexus.interop.testing.EchoRequest>} Promise
                 * @variation 2
                 */

                return EchoService;
            })();

            testing.EchoRequest = (function() {

                /**
                 * Properties of an EchoRequest.
                 * @memberof plexus.interop.testing
                 * @interface IEchoRequest
                 * @property {string|null} [stringField] EchoRequest stringField
                 * @property {Long|null} [int64Field] EchoRequest int64Field
                 * @property {number|null} [uint32Field] EchoRequest uint32Field
                 * @property {Array.<number>|null} [repeatedDoubleField] EchoRequest repeatedDoubleField
                 * @property {plexus.interop.testing.EchoRequest.SubEnum|null} [enumField] EchoRequest enumField
                 * @property {plexus.interop.testing.EchoRequest.ISubMessage|null} [subMessageField] EchoRequest subMessageField
                 * @property {Array.<plexus.interop.testing.EchoRequest.ISubMessage>|null} [repeatedSubMessageField] EchoRequest repeatedSubMessageField
                 */

                /**
                 * Constructs a new EchoRequest.
                 * @memberof plexus.interop.testing
                 * @classdesc Represents an EchoRequest.
                 * @implements IEchoRequest
                 * @constructor
                 * @param {plexus.interop.testing.IEchoRequest=} [properties] Properties to set
                 */
                function EchoRequest(properties) {
                    this.repeatedDoubleField = [];
                    this.repeatedSubMessageField = [];
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * EchoRequest stringField.
                 * @member {string} stringField
                 * @memberof plexus.interop.testing.EchoRequest
                 * @instance
                 */
                EchoRequest.prototype.stringField = "";

                /**
                 * EchoRequest int64Field.
                 * @member {Long} int64Field
                 * @memberof plexus.interop.testing.EchoRequest
                 * @instance
                 */
                EchoRequest.prototype.int64Field = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * EchoRequest uint32Field.
                 * @member {number} uint32Field
                 * @memberof plexus.interop.testing.EchoRequest
                 * @instance
                 */
                EchoRequest.prototype.uint32Field = 0;

                /**
                 * EchoRequest repeatedDoubleField.
                 * @member {Array.<number>} repeatedDoubleField
                 * @memberof plexus.interop.testing.EchoRequest
                 * @instance
                 */
                EchoRequest.prototype.repeatedDoubleField = $util.emptyArray;

                /**
                 * EchoRequest enumField.
                 * @member {plexus.interop.testing.EchoRequest.SubEnum} enumField
                 * @memberof plexus.interop.testing.EchoRequest
                 * @instance
                 */
                EchoRequest.prototype.enumField = 0;

                /**
                 * EchoRequest subMessageField.
                 * @member {plexus.interop.testing.EchoRequest.ISubMessage|null|undefined} subMessageField
                 * @memberof plexus.interop.testing.EchoRequest
                 * @instance
                 */
                EchoRequest.prototype.subMessageField = null;

                /**
                 * EchoRequest repeatedSubMessageField.
                 * @member {Array.<plexus.interop.testing.EchoRequest.ISubMessage>} repeatedSubMessageField
                 * @memberof plexus.interop.testing.EchoRequest
                 * @instance
                 */
                EchoRequest.prototype.repeatedSubMessageField = $util.emptyArray;

                /**
                 * Creates a new EchoRequest instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.testing.EchoRequest
                 * @static
                 * @param {plexus.interop.testing.IEchoRequest=} [properties] Properties to set
                 * @returns {plexus.interop.testing.EchoRequest} EchoRequest instance
                 */
                EchoRequest.create = function create(properties) {
                    return new EchoRequest(properties);
                };

                /**
                 * Encodes the specified EchoRequest message. Does not implicitly {@link plexus.interop.testing.EchoRequest.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.testing.EchoRequest
                 * @static
                 * @param {plexus.interop.testing.IEchoRequest} message EchoRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                EchoRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.stringField != null && Object.hasOwnProperty.call(message, "stringField"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.stringField);
                    if (message.int64Field != null && Object.hasOwnProperty.call(message, "int64Field"))
                        writer.uint32(/* id 2, wireType 0 =*/16).int64(message.int64Field);
                    if (message.uint32Field != null && Object.hasOwnProperty.call(message, "uint32Field"))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.uint32Field);
                    if (message.repeatedDoubleField != null && message.repeatedDoubleField.length) {
                        writer.uint32(/* id 4, wireType 2 =*/34).fork();
                        for (var i = 0; i < message.repeatedDoubleField.length; ++i)
                            writer.double(message.repeatedDoubleField[i]);
                        writer.ldelim();
                    }
                    if (message.enumField != null && Object.hasOwnProperty.call(message, "enumField"))
                        writer.uint32(/* id 5, wireType 0 =*/40).int32(message.enumField);
                    if (message.subMessageField != null && Object.hasOwnProperty.call(message, "subMessageField"))
                        $root.plexus.interop.testing.EchoRequest.SubMessage.encode(message.subMessageField, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                    if (message.repeatedSubMessageField != null && message.repeatedSubMessageField.length)
                        for (var i = 0; i < message.repeatedSubMessageField.length; ++i)
                            $root.plexus.interop.testing.EchoRequest.SubMessage.encode(message.repeatedSubMessageField[i], writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                    return writer;
                };

                /**
                 * Decodes an EchoRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.testing.EchoRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.testing.EchoRequest} EchoRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                EchoRequest.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.testing.EchoRequest();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.stringField = reader.string();
                            break;
                        case 2:
                            message.int64Field = reader.int64();
                            break;
                        case 3:
                            message.uint32Field = reader.uint32();
                            break;
                        case 4:
                            if (!(message.repeatedDoubleField && message.repeatedDoubleField.length))
                                message.repeatedDoubleField = [];
                            if ((tag & 7) === 2) {
                                var end2 = reader.uint32() + reader.pos;
                                while (reader.pos < end2)
                                    message.repeatedDoubleField.push(reader.double());
                            } else
                                message.repeatedDoubleField.push(reader.double());
                            break;
                        case 5:
                            message.enumField = reader.int32();
                            break;
                        case 6:
                            message.subMessageField = $root.plexus.interop.testing.EchoRequest.SubMessage.decode(reader, reader.uint32());
                            break;
                        case 7:
                            if (!(message.repeatedSubMessageField && message.repeatedSubMessageField.length))
                                message.repeatedSubMessageField = [];
                            message.repeatedSubMessageField.push($root.plexus.interop.testing.EchoRequest.SubMessage.decode(reader, reader.uint32()));
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Verifies an EchoRequest message.
                 * @function verify
                 * @memberof plexus.interop.testing.EchoRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                EchoRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.stringField != null && message.hasOwnProperty("stringField"))
                        if (!$util.isString(message.stringField))
                            return "stringField: string expected";
                    if (message.int64Field != null && message.hasOwnProperty("int64Field"))
                        if (!$util.isInteger(message.int64Field) && !(message.int64Field && $util.isInteger(message.int64Field.low) && $util.isInteger(message.int64Field.high)))
                            return "int64Field: integer|Long expected";
                    if (message.uint32Field != null && message.hasOwnProperty("uint32Field"))
                        if (!$util.isInteger(message.uint32Field))
                            return "uint32Field: integer expected";
                    if (message.repeatedDoubleField != null && message.hasOwnProperty("repeatedDoubleField")) {
                        if (!Array.isArray(message.repeatedDoubleField))
                            return "repeatedDoubleField: array expected";
                        for (var i = 0; i < message.repeatedDoubleField.length; ++i)
                            if (typeof message.repeatedDoubleField[i] !== "number")
                                return "repeatedDoubleField: number[] expected";
                    }
                    if (message.enumField != null && message.hasOwnProperty("enumField"))
                        switch (message.enumField) {
                        default:
                            return "enumField: enum value expected";
                        case 0:
                        case 1:
                            break;
                        }
                    if (message.subMessageField != null && message.hasOwnProperty("subMessageField")) {
                        var error = $root.plexus.interop.testing.EchoRequest.SubMessage.verify(message.subMessageField);
                        if (error)
                            return "subMessageField." + error;
                    }
                    if (message.repeatedSubMessageField != null && message.hasOwnProperty("repeatedSubMessageField")) {
                        if (!Array.isArray(message.repeatedSubMessageField))
                            return "repeatedSubMessageField: array expected";
                        for (var i = 0; i < message.repeatedSubMessageField.length; ++i) {
                            var error = $root.plexus.interop.testing.EchoRequest.SubMessage.verify(message.repeatedSubMessageField[i]);
                            if (error)
                                return "repeatedSubMessageField." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates an EchoRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.testing.EchoRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.testing.EchoRequest} EchoRequest
                 */
                EchoRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.testing.EchoRequest)
                        return object;
                    var message = new $root.plexus.interop.testing.EchoRequest();
                    if (object.stringField != null)
                        message.stringField = String(object.stringField);
                    if (object.int64Field != null)
                        if ($util.Long)
                            (message.int64Field = $util.Long.fromValue(object.int64Field)).unsigned = false;
                        else if (typeof object.int64Field === "string")
                            message.int64Field = parseInt(object.int64Field, 10);
                        else if (typeof object.int64Field === "number")
                            message.int64Field = object.int64Field;
                        else if (typeof object.int64Field === "object")
                            message.int64Field = new $util.LongBits(object.int64Field.low >>> 0, object.int64Field.high >>> 0).toNumber();
                    if (object.uint32Field != null)
                        message.uint32Field = object.uint32Field >>> 0;
                    if (object.repeatedDoubleField) {
                        if (!Array.isArray(object.repeatedDoubleField))
                            throw TypeError(".plexus.interop.testing.EchoRequest.repeatedDoubleField: array expected");
                        message.repeatedDoubleField = [];
                        for (var i = 0; i < object.repeatedDoubleField.length; ++i)
                            message.repeatedDoubleField[i] = Number(object.repeatedDoubleField[i]);
                    }
                    switch (object.enumField) {
                    case "VALUE_ONE":
                    case 0:
                        message.enumField = 0;
                        break;
                    case "VALUE_TWO":
                    case 1:
                        message.enumField = 1;
                        break;
                    }
                    if (object.subMessageField != null) {
                        if (typeof object.subMessageField !== "object")
                            throw TypeError(".plexus.interop.testing.EchoRequest.subMessageField: object expected");
                        message.subMessageField = $root.plexus.interop.testing.EchoRequest.SubMessage.fromObject(object.subMessageField);
                    }
                    if (object.repeatedSubMessageField) {
                        if (!Array.isArray(object.repeatedSubMessageField))
                            throw TypeError(".plexus.interop.testing.EchoRequest.repeatedSubMessageField: array expected");
                        message.repeatedSubMessageField = [];
                        for (var i = 0; i < object.repeatedSubMessageField.length; ++i) {
                            if (typeof object.repeatedSubMessageField[i] !== "object")
                                throw TypeError(".plexus.interop.testing.EchoRequest.repeatedSubMessageField: object expected");
                            message.repeatedSubMessageField[i] = $root.plexus.interop.testing.EchoRequest.SubMessage.fromObject(object.repeatedSubMessageField[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from an EchoRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.testing.EchoRequest
                 * @static
                 * @param {plexus.interop.testing.EchoRequest} message EchoRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                EchoRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.arrays || options.defaults) {
                        object.repeatedDoubleField = [];
                        object.repeatedSubMessageField = [];
                    }
                    if (options.defaults) {
                        object.stringField = "";
                        if ($util.Long) {
                            var long = new $util.Long(0, 0, false);
                            object.int64Field = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.int64Field = options.longs === String ? "0" : 0;
                        object.uint32Field = 0;
                        object.enumField = options.enums === String ? "VALUE_ONE" : 0;
                        object.subMessageField = null;
                    }
                    if (message.stringField != null && message.hasOwnProperty("stringField"))
                        object.stringField = message.stringField;
                    if (message.int64Field != null && message.hasOwnProperty("int64Field"))
                        if (typeof message.int64Field === "number")
                            object.int64Field = options.longs === String ? String(message.int64Field) : message.int64Field;
                        else
                            object.int64Field = options.longs === String ? $util.Long.prototype.toString.call(message.int64Field) : options.longs === Number ? new $util.LongBits(message.int64Field.low >>> 0, message.int64Field.high >>> 0).toNumber() : message.int64Field;
                    if (message.uint32Field != null && message.hasOwnProperty("uint32Field"))
                        object.uint32Field = message.uint32Field;
                    if (message.repeatedDoubleField && message.repeatedDoubleField.length) {
                        object.repeatedDoubleField = [];
                        for (var j = 0; j < message.repeatedDoubleField.length; ++j)
                            object.repeatedDoubleField[j] = options.json && !isFinite(message.repeatedDoubleField[j]) ? String(message.repeatedDoubleField[j]) : message.repeatedDoubleField[j];
                    }
                    if (message.enumField != null && message.hasOwnProperty("enumField"))
                        object.enumField = options.enums === String ? $root.plexus.interop.testing.EchoRequest.SubEnum[message.enumField] : message.enumField;
                    if (message.subMessageField != null && message.hasOwnProperty("subMessageField"))
                        object.subMessageField = $root.plexus.interop.testing.EchoRequest.SubMessage.toObject(message.subMessageField, options);
                    if (message.repeatedSubMessageField && message.repeatedSubMessageField.length) {
                        object.repeatedSubMessageField = [];
                        for (var j = 0; j < message.repeatedSubMessageField.length; ++j)
                            object.repeatedSubMessageField[j] = $root.plexus.interop.testing.EchoRequest.SubMessage.toObject(message.repeatedSubMessageField[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this EchoRequest to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.testing.EchoRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                EchoRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                EchoRequest.SubMessage = (function() {

                    /**
                     * Properties of a SubMessage.
                     * @memberof plexus.interop.testing.EchoRequest
                     * @interface ISubMessage
                     * @property {Uint8Array|null} [bytesField] SubMessage bytesField
                     * @property {string|null} [stringField] SubMessage stringField
                     */

                    /**
                     * Constructs a new SubMessage.
                     * @memberof plexus.interop.testing.EchoRequest
                     * @classdesc Represents a SubMessage.
                     * @implements ISubMessage
                     * @constructor
                     * @param {plexus.interop.testing.EchoRequest.ISubMessage=} [properties] Properties to set
                     */
                    function SubMessage(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * SubMessage bytesField.
                     * @member {Uint8Array} bytesField
                     * @memberof plexus.interop.testing.EchoRequest.SubMessage
                     * @instance
                     */
                    SubMessage.prototype.bytesField = $util.newBuffer([]);

                    /**
                     * SubMessage stringField.
                     * @member {string} stringField
                     * @memberof plexus.interop.testing.EchoRequest.SubMessage
                     * @instance
                     */
                    SubMessage.prototype.stringField = "";

                    /**
                     * Creates a new SubMessage instance using the specified properties.
                     * @function create
                     * @memberof plexus.interop.testing.EchoRequest.SubMessage
                     * @static
                     * @param {plexus.interop.testing.EchoRequest.ISubMessage=} [properties] Properties to set
                     * @returns {plexus.interop.testing.EchoRequest.SubMessage} SubMessage instance
                     */
                    SubMessage.create = function create(properties) {
                        return new SubMessage(properties);
                    };

                    /**
                     * Encodes the specified SubMessage message. Does not implicitly {@link plexus.interop.testing.EchoRequest.SubMessage.verify|verify} messages.
                     * @function encode
                     * @memberof plexus.interop.testing.EchoRequest.SubMessage
                     * @static
                     * @param {plexus.interop.testing.EchoRequest.ISubMessage} message SubMessage message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    SubMessage.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.bytesField != null && Object.hasOwnProperty.call(message, "bytesField"))
                            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.bytesField);
                        if (message.stringField != null && Object.hasOwnProperty.call(message, "stringField"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.stringField);
                        return writer;
                    };

                    /**
                     * Decodes a SubMessage message from the specified reader or buffer.
                     * @function decode
                     * @memberof plexus.interop.testing.EchoRequest.SubMessage
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {plexus.interop.testing.EchoRequest.SubMessage} SubMessage
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    SubMessage.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.testing.EchoRequest.SubMessage();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1:
                                message.bytesField = reader.bytes();
                                break;
                            case 2:
                                message.stringField = reader.string();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Verifies a SubMessage message.
                     * @function verify
                     * @memberof plexus.interop.testing.EchoRequest.SubMessage
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    SubMessage.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.bytesField != null && message.hasOwnProperty("bytesField"))
                            if (!(message.bytesField && typeof message.bytesField.length === "number" || $util.isString(message.bytesField)))
                                return "bytesField: buffer expected";
                        if (message.stringField != null && message.hasOwnProperty("stringField"))
                            if (!$util.isString(message.stringField))
                                return "stringField: string expected";
                        return null;
                    };

                    /**
                     * Creates a SubMessage message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof plexus.interop.testing.EchoRequest.SubMessage
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {plexus.interop.testing.EchoRequest.SubMessage} SubMessage
                     */
                    SubMessage.fromObject = function fromObject(object) {
                        if (object instanceof $root.plexus.interop.testing.EchoRequest.SubMessage)
                            return object;
                        var message = new $root.plexus.interop.testing.EchoRequest.SubMessage();
                        if (object.bytesField != null)
                            if (typeof object.bytesField === "string")
                                $util.base64.decode(object.bytesField, message.bytesField = $util.newBuffer($util.base64.length(object.bytesField)), 0);
                            else if (object.bytesField.length)
                                message.bytesField = object.bytesField;
                        if (object.stringField != null)
                            message.stringField = String(object.stringField);
                        return message;
                    };

                    /**
                     * Creates a plain object from a SubMessage message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof plexus.interop.testing.EchoRequest.SubMessage
                     * @static
                     * @param {plexus.interop.testing.EchoRequest.SubMessage} message SubMessage
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    SubMessage.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults) {
                            if (options.bytes === String)
                                object.bytesField = "";
                            else {
                                object.bytesField = [];
                                if (options.bytes !== Array)
                                    object.bytesField = $util.newBuffer(object.bytesField);
                            }
                            object.stringField = "";
                        }
                        if (message.bytesField != null && message.hasOwnProperty("bytesField"))
                            object.bytesField = options.bytes === String ? $util.base64.encode(message.bytesField, 0, message.bytesField.length) : options.bytes === Array ? Array.prototype.slice.call(message.bytesField) : message.bytesField;
                        if (message.stringField != null && message.hasOwnProperty("stringField"))
                            object.stringField = message.stringField;
                        return object;
                    };

                    /**
                     * Converts this SubMessage to JSON.
                     * @function toJSON
                     * @memberof plexus.interop.testing.EchoRequest.SubMessage
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    SubMessage.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return SubMessage;
                })();

                /**
                 * SubEnum enum.
                 * @name plexus.interop.testing.EchoRequest.SubEnum
                 * @enum {number}
                 * @property {number} VALUE_ONE=0 VALUE_ONE value
                 * @property {number} VALUE_TWO=1 VALUE_TWO value
                 */
                EchoRequest.SubEnum = (function() {
                    var valuesById = {}, values = Object.create(valuesById);
                    values[valuesById[0] = "VALUE_ONE"] = 0;
                    values[valuesById[1] = "VALUE_TWO"] = 1;
                    return values;
                })();

                return EchoRequest;
            })();

            return testing;
        })();

        return interop;
    })();

    return plexus;
})();

module.exports = $root;
