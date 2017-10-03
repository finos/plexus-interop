/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots.plexus || ($protobuf.roots.plexus = {});

$root.com = (function() {

    /**
     * Namespace com.
     * @exports com
     * @namespace
     */
    var com = {};

    com.plexus = (function() {

        /**
         * Namespace plexus.
         * @memberof com
         * @namespace
         */
        var plexus = {};

        plexus.model = (function() {

            /**
             * Namespace model.
             * @memberof com.plexus
             * @namespace
             */
            var model = {};

            model.Request = (function() {

                /**
                 * Properties of a Request.
                 * @memberof com.plexus.model
                 * @interface IRequest
                 * @property {string} [data] Request data
                 */

                /**
                 * Constructs a new Request.
                 * @memberof com.plexus.model
                 * @classdesc Represents a Request.
                 * @constructor
                 * @param {com.plexus.model.IRequest=} [properties] Properties to set
                 */
                function Request(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Request data.
                 * @member {string}data
                 * @memberof com.plexus.model.Request
                 * @instance
                 */
                Request.prototype.data = "";

                /**
                 * Creates a new Request instance using the specified properties.
                 * @function create
                 * @memberof com.plexus.model.Request
                 * @static
                 * @param {com.plexus.model.IRequest=} [properties] Properties to set
                 * @returns {com.plexus.model.Request} Request instance
                 */
                Request.create = function create(properties) {
                    return new Request(properties);
                };

                /**
                 * Encodes the specified Request message. Does not implicitly {@link com.plexus.model.Request.verify|verify} messages.
                 * @function encode
                 * @memberof com.plexus.model.Request
                 * @static
                 * @param {com.plexus.model.IRequest} message Request message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Request.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.data != null && message.hasOwnProperty("data"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.data);
                    return writer;
                };

                /**
                 * Encodes the specified Request message, length delimited. Does not implicitly {@link com.plexus.model.Request.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof com.plexus.model.Request
                 * @static
                 * @param {com.plexus.model.IRequest} message Request message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Request.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Request message from the specified reader or buffer.
                 * @function decode
                 * @memberof com.plexus.model.Request
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {com.plexus.model.Request} Request
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Request.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.plexus.model.Request();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.data = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Request message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof com.plexus.model.Request
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {com.plexus.model.Request} Request
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Request.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Request message.
                 * @function verify
                 * @memberof com.plexus.model.Request
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Request.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.data != null && message.hasOwnProperty("data"))
                        if (!$util.isString(message.data))
                            return "data: string expected";
                    return null;
                };

                /**
                 * Creates a Request message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof com.plexus.model.Request
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {com.plexus.model.Request} Request
                 */
                Request.fromObject = function fromObject(object) {
                    if (object instanceof $root.com.plexus.model.Request)
                        return object;
                    var message = new $root.com.plexus.model.Request();
                    if (object.data != null)
                        message.data = String(object.data);
                    return message;
                };

                /**
                 * Creates a plain object from a Request message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof com.plexus.model.Request
                 * @static
                 * @param {com.plexus.model.Request} message Request
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Request.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        object.data = "";
                    if (message.data != null && message.hasOwnProperty("data"))
                        object.data = message.data;
                    return object;
                };

                /**
                 * Converts this Request to JSON.
                 * @function toJSON
                 * @memberof com.plexus.model.Request
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Request.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Request;
            })();

            model.Response = (function() {

                /**
                 * Properties of a Response.
                 * @memberof com.plexus.model
                 * @interface IResponse
                 * @property {string} [result] Response result
                 * @property {com.plexus.model.Status} [status] Response status
                 */

                /**
                 * Constructs a new Response.
                 * @memberof com.plexus.model
                 * @classdesc Represents a Response.
                 * @constructor
                 * @param {com.plexus.model.IResponse=} [properties] Properties to set
                 */
                function Response(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Response result.
                 * @member {string}result
                 * @memberof com.plexus.model.Response
                 * @instance
                 */
                Response.prototype.result = "";

                /**
                 * Response status.
                 * @member {com.plexus.model.Status}status
                 * @memberof com.plexus.model.Response
                 * @instance
                 */
                Response.prototype.status = 0;

                /**
                 * Creates a new Response instance using the specified properties.
                 * @function create
                 * @memberof com.plexus.model.Response
                 * @static
                 * @param {com.plexus.model.IResponse=} [properties] Properties to set
                 * @returns {com.plexus.model.Response} Response instance
                 */
                Response.create = function create(properties) {
                    return new Response(properties);
                };

                /**
                 * Encodes the specified Response message. Does not implicitly {@link com.plexus.model.Response.verify|verify} messages.
                 * @function encode
                 * @memberof com.plexus.model.Response
                 * @static
                 * @param {com.plexus.model.IResponse} message Response message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Response.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.result != null && message.hasOwnProperty("result"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.result);
                    if (message.status != null && message.hasOwnProperty("status"))
                        writer.uint32(/* id 2, wireType 0 =*/16).int32(message.status);
                    return writer;
                };

                /**
                 * Encodes the specified Response message, length delimited. Does not implicitly {@link com.plexus.model.Response.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof com.plexus.model.Response
                 * @static
                 * @param {com.plexus.model.IResponse} message Response message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Response.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Response message from the specified reader or buffer.
                 * @function decode
                 * @memberof com.plexus.model.Response
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {com.plexus.model.Response} Response
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Response.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.plexus.model.Response();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.result = reader.string();
                            break;
                        case 2:
                            message.status = reader.int32();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Response message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof com.plexus.model.Response
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {com.plexus.model.Response} Response
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Response.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Response message.
                 * @function verify
                 * @memberof com.plexus.model.Response
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Response.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.result != null && message.hasOwnProperty("result"))
                        if (!$util.isString(message.result))
                            return "result: string expected";
                    if (message.status != null && message.hasOwnProperty("status"))
                        switch (message.status) {
                        default:
                            return "status: enum value expected";
                        case 0:
                        case 1:
                            break;
                        }
                    return null;
                };

                /**
                 * Creates a Response message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof com.plexus.model.Response
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {com.plexus.model.Response} Response
                 */
                Response.fromObject = function fromObject(object) {
                    if (object instanceof $root.com.plexus.model.Response)
                        return object;
                    var message = new $root.com.plexus.model.Response();
                    if (object.result != null)
                        message.result = String(object.result);
                    switch (object.status) {
                    case "SUCCESS":
                    case 0:
                        message.status = 0;
                        break;
                    case "ERROR":
                    case 1:
                        message.status = 1;
                        break;
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Response message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof com.plexus.model.Response
                 * @static
                 * @param {com.plexus.model.Response} message Response
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Response.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.result = "";
                        object.status = options.enums === String ? "SUCCESS" : 0;
                    }
                    if (message.result != null && message.hasOwnProperty("result"))
                        object.result = message.result;
                    if (message.status != null && message.hasOwnProperty("status"))
                        object.status = options.enums === String ? $root.com.plexus.model.Status[message.status] : message.status;
                    return object;
                };

                /**
                 * Converts this Response to JSON.
                 * @function toJSON
                 * @memberof com.plexus.model.Response
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Response.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Response;
            })();

            /**
             * Status enum.
             * @enum {string}
             * @property {number} SUCCESS=0 SUCCESS value
             * @property {number} ERROR=1 ERROR value
             */
            model.Status = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "SUCCESS"] = 0;
                values[valuesById[1] = "ERROR"] = 1;
                return values;
            })();

            return model;
        })();

        return plexus;
    })();

    return com;
})();

module.exports = $root;
