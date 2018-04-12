/*
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
var $root = $protobuf.roots.sample || ($protobuf.roots.sample = {});

$root.interop = (function() {

    /**
     * Namespace interop.
     * @exports interop
     * @namespace
     */
    var interop = {};

    interop.samples = (function() {

        /**
         * Namespace samples.
         * @memberof interop
         * @namespace
         */
        var samples = {};

        samples.GreetingService = (function() {

            /**
             * Constructs a new GreetingService service.
             * @memberof interop.samples
             * @classdesc Represents a GreetingService
             * @extends $protobuf.rpc.Service
             * @constructor
             * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
             * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
             * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
             */
            function GreetingService(rpcImpl, requestDelimited, responseDelimited) {
                $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
            }

            (GreetingService.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = GreetingService;

            /**
             * Creates new GreetingService service using the specified rpc implementation.
             * @function create
             * @memberof interop.samples.GreetingService
             * @static
             * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
             * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
             * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
             * @returns {GreetingService} RPC service. Useful where requests and/or responses are streamed.
             */
            GreetingService.create = function create(rpcImpl, requestDelimited, responseDelimited) {
                return new this(rpcImpl, requestDelimited, responseDelimited);
            };

            /**
             * Callback as used by {@link interop.samples.GreetingService#unary}.
             * @memberof interop.samples.GreetingService
             * @typedef UnaryCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {interop.samples.GreetingResponse} [response] GreetingResponse
             */

            /**
             * Calls Unary.
             * @function .unary
             * @memberof interop.samples.GreetingService
             * @instance
             * @param {interop.samples.IGreetingRequest} request GreetingRequest message or plain object
             * @param {interop.samples.GreetingService.UnaryCallback} callback Node-style callback called with the error, if any, and GreetingResponse
             * @returns {undefined}
             * @variation 1
             */
            GreetingService.prototype.unary = function unary(request, callback) {
                return this.rpcCall(unary, $root.interop.samples.GreetingRequest, $root.interop.samples.GreetingResponse, request, callback);
            };

            /**
             * Calls Unary.
             * @function unary
             * @memberof interop.samples.GreetingService
             * @instance
             * @param {interop.samples.IGreetingRequest} request GreetingRequest message or plain object
             * @returns {Promise<interop.samples.GreetingResponse>} Promise
             * @variation 2
             */

            /**
             * Callback as used by {@link interop.samples.GreetingService#serverStreaming}.
             * @memberof interop.samples.GreetingService
             * @typedef ServerStreamingCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {interop.samples.GreetingResponse} [response] GreetingResponse
             */

            /**
             * Calls ServerStreaming.
             * @function .serverStreaming
             * @memberof interop.samples.GreetingService
             * @instance
             * @param {interop.samples.IGreetingRequest} request GreetingRequest message or plain object
             * @param {interop.samples.GreetingService.ServerStreamingCallback} callback Node-style callback called with the error, if any, and GreetingResponse
             * @returns {undefined}
             * @variation 1
             */
            GreetingService.prototype.serverStreaming = function serverStreaming(request, callback) {
                return this.rpcCall(serverStreaming, $root.interop.samples.GreetingRequest, $root.interop.samples.GreetingResponse, request, callback);
            };

            /**
             * Calls ServerStreaming.
             * @function serverStreaming
             * @memberof interop.samples.GreetingService
             * @instance
             * @param {interop.samples.IGreetingRequest} request GreetingRequest message or plain object
             * @returns {Promise<interop.samples.GreetingResponse>} Promise
             * @variation 2
             */

            /**
             * Callback as used by {@link interop.samples.GreetingService#clientStreaming}.
             * @memberof interop.samples.GreetingService
             * @typedef ClientStreamingCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {interop.samples.GreetingResponse} [response] GreetingResponse
             */

            /**
             * Calls ClientStreaming.
             * @function .clientStreaming
             * @memberof interop.samples.GreetingService
             * @instance
             * @param {interop.samples.IGreetingRequest} request GreetingRequest message or plain object
             * @param {interop.samples.GreetingService.ClientStreamingCallback} callback Node-style callback called with the error, if any, and GreetingResponse
             * @returns {undefined}
             * @variation 1
             */
            GreetingService.prototype.clientStreaming = function clientStreaming(request, callback) {
                return this.rpcCall(clientStreaming, $root.interop.samples.GreetingRequest, $root.interop.samples.GreetingResponse, request, callback);
            };

            /**
             * Calls ClientStreaming.
             * @function clientStreaming
             * @memberof interop.samples.GreetingService
             * @instance
             * @param {interop.samples.IGreetingRequest} request GreetingRequest message or plain object
             * @returns {Promise<interop.samples.GreetingResponse>} Promise
             * @variation 2
             */

            /**
             * Callback as used by {@link interop.samples.GreetingService#duplexStreaming}.
             * @memberof interop.samples.GreetingService
             * @typedef DuplexStreamingCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {interop.samples.GreetingResponse} [response] GreetingResponse
             */

            /**
             * Calls DuplexStreaming.
             * @function .duplexStreaming
             * @memberof interop.samples.GreetingService
             * @instance
             * @param {interop.samples.IGreetingRequest} request GreetingRequest message or plain object
             * @param {interop.samples.GreetingService.DuplexStreamingCallback} callback Node-style callback called with the error, if any, and GreetingResponse
             * @returns {undefined}
             * @variation 1
             */
            GreetingService.prototype.duplexStreaming = function duplexStreaming(request, callback) {
                return this.rpcCall(duplexStreaming, $root.interop.samples.GreetingRequest, $root.interop.samples.GreetingResponse, request, callback);
            };

            /**
             * Calls DuplexStreaming.
             * @function duplexStreaming
             * @memberof interop.samples.GreetingService
             * @instance
             * @param {interop.samples.IGreetingRequest} request GreetingRequest message or plain object
             * @returns {Promise<interop.samples.GreetingResponse>} Promise
             * @variation 2
             */

            return GreetingService;
        })();

        samples.GreetingRequest = (function() {

            /**
             * Properties of a GreetingRequest.
             * @memberof interop.samples
             * @interface IGreetingRequest
             * @property {string} [name] GreetingRequest name
             */

            /**
             * Constructs a new GreetingRequest.
             * @memberof interop.samples
             * @classdesc Represents a GreetingRequest.
             * @constructor
             * @param {interop.samples.IGreetingRequest=} [properties] Properties to set
             */
            function GreetingRequest(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GreetingRequest name.
             * @member {string}name
             * @memberof interop.samples.GreetingRequest
             * @instance
             */
            GreetingRequest.prototype.name = "";

            /**
             * Creates a new GreetingRequest instance using the specified properties.
             * @function create
             * @memberof interop.samples.GreetingRequest
             * @static
             * @param {interop.samples.IGreetingRequest=} [properties] Properties to set
             * @returns {interop.samples.GreetingRequest} GreetingRequest instance
             */
            GreetingRequest.create = function create(properties) {
                return new GreetingRequest(properties);
            };

            /**
             * Encodes the specified GreetingRequest message. Does not implicitly {@link interop.samples.GreetingRequest.verify|verify} messages.
             * @function encode
             * @memberof interop.samples.GreetingRequest
             * @static
             * @param {interop.samples.IGreetingRequest} message GreetingRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GreetingRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.name != null && message.hasOwnProperty("name"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                return writer;
            };

            /**
             * Encodes the specified GreetingRequest message, length delimited. Does not implicitly {@link interop.samples.GreetingRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof interop.samples.GreetingRequest
             * @static
             * @param {interop.samples.IGreetingRequest} message GreetingRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GreetingRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GreetingRequest message from the specified reader or buffer.
             * @function decode
             * @memberof interop.samples.GreetingRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {interop.samples.GreetingRequest} GreetingRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GreetingRequest.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.interop.samples.GreetingRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.name = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a GreetingRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof interop.samples.GreetingRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {interop.samples.GreetingRequest} GreetingRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GreetingRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GreetingRequest message.
             * @function verify
             * @memberof interop.samples.GreetingRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GreetingRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                return null;
            };

            /**
             * Creates a GreetingRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof interop.samples.GreetingRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {interop.samples.GreetingRequest} GreetingRequest
             */
            GreetingRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.interop.samples.GreetingRequest)
                    return object;
                var message = new $root.interop.samples.GreetingRequest();
                if (object.name != null)
                    message.name = String(object.name);
                return message;
            };

            /**
             * Creates a plain object from a GreetingRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof interop.samples.GreetingRequest
             * @static
             * @param {interop.samples.GreetingRequest} message GreetingRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GreetingRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.name = "";
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                return object;
            };

            /**
             * Converts this GreetingRequest to JSON.
             * @function toJSON
             * @memberof interop.samples.GreetingRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GreetingRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return GreetingRequest;
        })();

        samples.GreetingResponse = (function() {

            /**
             * Properties of a GreetingResponse.
             * @memberof interop.samples
             * @interface IGreetingResponse
             * @property {string} [greeting] GreetingResponse greeting
             */

            /**
             * Constructs a new GreetingResponse.
             * @memberof interop.samples
             * @classdesc Represents a GreetingResponse.
             * @constructor
             * @param {interop.samples.IGreetingResponse=} [properties] Properties to set
             */
            function GreetingResponse(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GreetingResponse greeting.
             * @member {string}greeting
             * @memberof interop.samples.GreetingResponse
             * @instance
             */
            GreetingResponse.prototype.greeting = "";

            /**
             * Creates a new GreetingResponse instance using the specified properties.
             * @function create
             * @memberof interop.samples.GreetingResponse
             * @static
             * @param {interop.samples.IGreetingResponse=} [properties] Properties to set
             * @returns {interop.samples.GreetingResponse} GreetingResponse instance
             */
            GreetingResponse.create = function create(properties) {
                return new GreetingResponse(properties);
            };

            /**
             * Encodes the specified GreetingResponse message. Does not implicitly {@link interop.samples.GreetingResponse.verify|verify} messages.
             * @function encode
             * @memberof interop.samples.GreetingResponse
             * @static
             * @param {interop.samples.IGreetingResponse} message GreetingResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GreetingResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.greeting != null && message.hasOwnProperty("greeting"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.greeting);
                return writer;
            };

            /**
             * Encodes the specified GreetingResponse message, length delimited. Does not implicitly {@link interop.samples.GreetingResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof interop.samples.GreetingResponse
             * @static
             * @param {interop.samples.IGreetingResponse} message GreetingResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GreetingResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GreetingResponse message from the specified reader or buffer.
             * @function decode
             * @memberof interop.samples.GreetingResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {interop.samples.GreetingResponse} GreetingResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GreetingResponse.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.interop.samples.GreetingResponse();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.greeting = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a GreetingResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof interop.samples.GreetingResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {interop.samples.GreetingResponse} GreetingResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GreetingResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GreetingResponse message.
             * @function verify
             * @memberof interop.samples.GreetingResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GreetingResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.greeting != null && message.hasOwnProperty("greeting"))
                    if (!$util.isString(message.greeting))
                        return "greeting: string expected";
                return null;
            };

            /**
             * Creates a GreetingResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof interop.samples.GreetingResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {interop.samples.GreetingResponse} GreetingResponse
             */
            GreetingResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.interop.samples.GreetingResponse)
                    return object;
                var message = new $root.interop.samples.GreetingResponse();
                if (object.greeting != null)
                    message.greeting = String(object.greeting);
                return message;
            };

            /**
             * Creates a plain object from a GreetingResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof interop.samples.GreetingResponse
             * @static
             * @param {interop.samples.GreetingResponse} message GreetingResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GreetingResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.greeting = "";
                if (message.greeting != null && message.hasOwnProperty("greeting"))
                    object.greeting = message.greeting;
                return object;
            };

            /**
             * Converts this GreetingResponse to JSON.
             * @function toJSON
             * @memberof interop.samples.GreetingResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GreetingResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return GreetingResponse;
        })();

        return samples;
    })();

    return interop;
})();

module.exports = $root;
