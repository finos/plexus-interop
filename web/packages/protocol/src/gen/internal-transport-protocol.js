/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots.plexusTransport || ($protobuf.roots.plexusTransport = {});

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

        interop.transport = (function() {

            /**
             * Namespace transport.
             * @memberof plexus.interop
             * @namespace
             */
            var transport = {};

            transport.protocol = (function() {

                /**
                 * Namespace protocol.
                 * @memberof plexus.interop.transport
                 * @namespace
                 */
                var protocol = {};

                protocol.MessageFrameHeader = (function() {

                    /**
                     * Properties of a MessageFrameHeader.
                     * @memberof plexus.interop.transport.protocol
                     * @interface IMessageFrameHeader
                     * @property {plexus.IUniqueId} [channelId] MessageFrameHeader channelId
                     * @property {number} [length] MessageFrameHeader length
                     * @property {boolean} [hasMore] MessageFrameHeader hasMore
                     */

                    /**
                     * Constructs a new MessageFrameHeader.
                     * @memberof plexus.interop.transport.protocol
                     * @classdesc Represents a MessageFrameHeader.
                     * @constructor
                     * @param {plexus.interop.transport.protocol.IMessageFrameHeader=} [properties] Properties to set
                     */
                    function MessageFrameHeader(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * MessageFrameHeader channelId.
                     * @member {(plexus.IUniqueId|null|undefined)}channelId
                     * @memberof plexus.interop.transport.protocol.MessageFrameHeader
                     * @instance
                     */
                    MessageFrameHeader.prototype.channelId = null;

                    /**
                     * MessageFrameHeader length.
                     * @member {number}length
                     * @memberof plexus.interop.transport.protocol.MessageFrameHeader
                     * @instance
                     */
                    MessageFrameHeader.prototype.length = 0;

                    /**
                     * MessageFrameHeader hasMore.
                     * @member {boolean}hasMore
                     * @memberof plexus.interop.transport.protocol.MessageFrameHeader
                     * @instance
                     */
                    MessageFrameHeader.prototype.hasMore = false;

                    /**
                     * Creates a new MessageFrameHeader instance using the specified properties.
                     * @function create
                     * @memberof plexus.interop.transport.protocol.MessageFrameHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IMessageFrameHeader=} [properties] Properties to set
                     * @returns {plexus.interop.transport.protocol.MessageFrameHeader} MessageFrameHeader instance
                     */
                    MessageFrameHeader.create = function create(properties) {
                        return new MessageFrameHeader(properties);
                    };

                    /**
                     * Encodes the specified MessageFrameHeader message. Does not implicitly {@link plexus.interop.transport.protocol.MessageFrameHeader.verify|verify} messages.
                     * @function encode
                     * @memberof plexus.interop.transport.protocol.MessageFrameHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IMessageFrameHeader} message MessageFrameHeader message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    MessageFrameHeader.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.channelId != null && message.hasOwnProperty("channelId"))
                            $root.plexus.UniqueId.encode(message.channelId, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        if (message.length != null && message.hasOwnProperty("length"))
                            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.length);
                        if (message.hasMore != null && message.hasOwnProperty("hasMore"))
                            writer.uint32(/* id 3, wireType 0 =*/24).bool(message.hasMore);
                        return writer;
                    };

                    /**
                     * Encodes the specified MessageFrameHeader message, length delimited. Does not implicitly {@link plexus.interop.transport.protocol.MessageFrameHeader.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof plexus.interop.transport.protocol.MessageFrameHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IMessageFrameHeader} message MessageFrameHeader message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    MessageFrameHeader.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a MessageFrameHeader message from the specified reader or buffer.
                     * @function decode
                     * @memberof plexus.interop.transport.protocol.MessageFrameHeader
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {plexus.interop.transport.protocol.MessageFrameHeader} MessageFrameHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    MessageFrameHeader.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.transport.protocol.MessageFrameHeader();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1:
                                message.channelId = $root.plexus.UniqueId.decode(reader, reader.uint32());
                                break;
                            case 2:
                                message.length = reader.uint32();
                                break;
                            case 3:
                                message.hasMore = reader.bool();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a MessageFrameHeader message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof plexus.interop.transport.protocol.MessageFrameHeader
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {plexus.interop.transport.protocol.MessageFrameHeader} MessageFrameHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    MessageFrameHeader.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a MessageFrameHeader message.
                     * @function verify
                     * @memberof plexus.interop.transport.protocol.MessageFrameHeader
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    MessageFrameHeader.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.channelId != null && message.hasOwnProperty("channelId")) {
                            var error = $root.plexus.UniqueId.verify(message.channelId);
                            if (error)
                                return "channelId." + error;
                        }
                        if (message.length != null && message.hasOwnProperty("length"))
                            if (!$util.isInteger(message.length))
                                return "length: integer expected";
                        if (message.hasMore != null && message.hasOwnProperty("hasMore"))
                            if (typeof message.hasMore !== "boolean")
                                return "hasMore: boolean expected";
                        return null;
                    };

                    /**
                     * Creates a MessageFrameHeader message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof plexus.interop.transport.protocol.MessageFrameHeader
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {plexus.interop.transport.protocol.MessageFrameHeader} MessageFrameHeader
                     */
                    MessageFrameHeader.fromObject = function fromObject(object) {
                        if (object instanceof $root.plexus.interop.transport.protocol.MessageFrameHeader)
                            return object;
                        var message = new $root.plexus.interop.transport.protocol.MessageFrameHeader();
                        if (object.channelId != null) {
                            if (typeof object.channelId !== "object")
                                throw TypeError(".plexus.interop.transport.protocol.MessageFrameHeader.channelId: object expected");
                            message.channelId = $root.plexus.UniqueId.fromObject(object.channelId);
                        }
                        if (object.length != null)
                            message.length = object.length >>> 0;
                        if (object.hasMore != null)
                            message.hasMore = Boolean(object.hasMore);
                        return message;
                    };

                    /**
                     * Creates a plain object from a MessageFrameHeader message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof plexus.interop.transport.protocol.MessageFrameHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.MessageFrameHeader} message MessageFrameHeader
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    MessageFrameHeader.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults) {
                            object.channelId = null;
                            object.length = 0;
                            object.hasMore = false;
                        }
                        if (message.channelId != null && message.hasOwnProperty("channelId"))
                            object.channelId = $root.plexus.UniqueId.toObject(message.channelId, options);
                        if (message.length != null && message.hasOwnProperty("length"))
                            object.length = message.length;
                        if (message.hasMore != null && message.hasOwnProperty("hasMore"))
                            object.hasMore = message.hasMore;
                        return object;
                    };

                    /**
                     * Converts this MessageFrameHeader to JSON.
                     * @function toJSON
                     * @memberof plexus.interop.transport.protocol.MessageFrameHeader
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    MessageFrameHeader.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return MessageFrameHeader;
                })();

                protocol.ConnectionOpenHeader = (function() {

                    /**
                     * Properties of a ConnectionOpenHeader.
                     * @memberof plexus.interop.transport.protocol
                     * @interface IConnectionOpenHeader
                     * @property {plexus.IUniqueId} [connectionId] ConnectionOpenHeader connectionId
                     */

                    /**
                     * Constructs a new ConnectionOpenHeader.
                     * @memberof plexus.interop.transport.protocol
                     * @classdesc Represents a ConnectionOpenHeader.
                     * @constructor
                     * @param {plexus.interop.transport.protocol.IConnectionOpenHeader=} [properties] Properties to set
                     */
                    function ConnectionOpenHeader(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * ConnectionOpenHeader connectionId.
                     * @member {(plexus.IUniqueId|null|undefined)}connectionId
                     * @memberof plexus.interop.transport.protocol.ConnectionOpenHeader
                     * @instance
                     */
                    ConnectionOpenHeader.prototype.connectionId = null;

                    /**
                     * Creates a new ConnectionOpenHeader instance using the specified properties.
                     * @function create
                     * @memberof plexus.interop.transport.protocol.ConnectionOpenHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IConnectionOpenHeader=} [properties] Properties to set
                     * @returns {plexus.interop.transport.protocol.ConnectionOpenHeader} ConnectionOpenHeader instance
                     */
                    ConnectionOpenHeader.create = function create(properties) {
                        return new ConnectionOpenHeader(properties);
                    };

                    /**
                     * Encodes the specified ConnectionOpenHeader message. Does not implicitly {@link plexus.interop.transport.protocol.ConnectionOpenHeader.verify|verify} messages.
                     * @function encode
                     * @memberof plexus.interop.transport.protocol.ConnectionOpenHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IConnectionOpenHeader} message ConnectionOpenHeader message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ConnectionOpenHeader.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.connectionId != null && message.hasOwnProperty("connectionId"))
                            $root.plexus.UniqueId.encode(message.connectionId, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified ConnectionOpenHeader message, length delimited. Does not implicitly {@link plexus.interop.transport.protocol.ConnectionOpenHeader.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof plexus.interop.transport.protocol.ConnectionOpenHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IConnectionOpenHeader} message ConnectionOpenHeader message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ConnectionOpenHeader.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a ConnectionOpenHeader message from the specified reader or buffer.
                     * @function decode
                     * @memberof plexus.interop.transport.protocol.ConnectionOpenHeader
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {plexus.interop.transport.protocol.ConnectionOpenHeader} ConnectionOpenHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ConnectionOpenHeader.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.transport.protocol.ConnectionOpenHeader();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1:
                                message.connectionId = $root.plexus.UniqueId.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a ConnectionOpenHeader message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof plexus.interop.transport.protocol.ConnectionOpenHeader
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {plexus.interop.transport.protocol.ConnectionOpenHeader} ConnectionOpenHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ConnectionOpenHeader.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a ConnectionOpenHeader message.
                     * @function verify
                     * @memberof plexus.interop.transport.protocol.ConnectionOpenHeader
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ConnectionOpenHeader.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.connectionId != null && message.hasOwnProperty("connectionId")) {
                            var error = $root.plexus.UniqueId.verify(message.connectionId);
                            if (error)
                                return "connectionId." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates a ConnectionOpenHeader message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof plexus.interop.transport.protocol.ConnectionOpenHeader
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {plexus.interop.transport.protocol.ConnectionOpenHeader} ConnectionOpenHeader
                     */
                    ConnectionOpenHeader.fromObject = function fromObject(object) {
                        if (object instanceof $root.plexus.interop.transport.protocol.ConnectionOpenHeader)
                            return object;
                        var message = new $root.plexus.interop.transport.protocol.ConnectionOpenHeader();
                        if (object.connectionId != null) {
                            if (typeof object.connectionId !== "object")
                                throw TypeError(".plexus.interop.transport.protocol.ConnectionOpenHeader.connectionId: object expected");
                            message.connectionId = $root.plexus.UniqueId.fromObject(object.connectionId);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a ConnectionOpenHeader message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof plexus.interop.transport.protocol.ConnectionOpenHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.ConnectionOpenHeader} message ConnectionOpenHeader
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ConnectionOpenHeader.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults)
                            object.connectionId = null;
                        if (message.connectionId != null && message.hasOwnProperty("connectionId"))
                            object.connectionId = $root.plexus.UniqueId.toObject(message.connectionId, options);
                        return object;
                    };

                    /**
                     * Converts this ConnectionOpenHeader to JSON.
                     * @function toJSON
                     * @memberof plexus.interop.transport.protocol.ConnectionOpenHeader
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ConnectionOpenHeader.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return ConnectionOpenHeader;
                })();

                protocol.ConnectionCloseHeader = (function() {

                    /**
                     * Properties of a ConnectionCloseHeader.
                     * @memberof plexus.interop.transport.protocol
                     * @interface IConnectionCloseHeader
                     * @property {plexus.ICompletion} [completion] ConnectionCloseHeader completion
                     */

                    /**
                     * Constructs a new ConnectionCloseHeader.
                     * @memberof plexus.interop.transport.protocol
                     * @classdesc Represents a ConnectionCloseHeader.
                     * @constructor
                     * @param {plexus.interop.transport.protocol.IConnectionCloseHeader=} [properties] Properties to set
                     */
                    function ConnectionCloseHeader(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * ConnectionCloseHeader completion.
                     * @member {(plexus.ICompletion|null|undefined)}completion
                     * @memberof plexus.interop.transport.protocol.ConnectionCloseHeader
                     * @instance
                     */
                    ConnectionCloseHeader.prototype.completion = null;

                    /**
                     * Creates a new ConnectionCloseHeader instance using the specified properties.
                     * @function create
                     * @memberof plexus.interop.transport.protocol.ConnectionCloseHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IConnectionCloseHeader=} [properties] Properties to set
                     * @returns {plexus.interop.transport.protocol.ConnectionCloseHeader} ConnectionCloseHeader instance
                     */
                    ConnectionCloseHeader.create = function create(properties) {
                        return new ConnectionCloseHeader(properties);
                    };

                    /**
                     * Encodes the specified ConnectionCloseHeader message. Does not implicitly {@link plexus.interop.transport.protocol.ConnectionCloseHeader.verify|verify} messages.
                     * @function encode
                     * @memberof plexus.interop.transport.protocol.ConnectionCloseHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IConnectionCloseHeader} message ConnectionCloseHeader message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ConnectionCloseHeader.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.completion != null && message.hasOwnProperty("completion"))
                            $root.plexus.Completion.encode(message.completion, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified ConnectionCloseHeader message, length delimited. Does not implicitly {@link plexus.interop.transport.protocol.ConnectionCloseHeader.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof plexus.interop.transport.protocol.ConnectionCloseHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IConnectionCloseHeader} message ConnectionCloseHeader message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ConnectionCloseHeader.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a ConnectionCloseHeader message from the specified reader or buffer.
                     * @function decode
                     * @memberof plexus.interop.transport.protocol.ConnectionCloseHeader
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {plexus.interop.transport.protocol.ConnectionCloseHeader} ConnectionCloseHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ConnectionCloseHeader.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.transport.protocol.ConnectionCloseHeader();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1:
                                message.completion = $root.plexus.Completion.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a ConnectionCloseHeader message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof plexus.interop.transport.protocol.ConnectionCloseHeader
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {plexus.interop.transport.protocol.ConnectionCloseHeader} ConnectionCloseHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ConnectionCloseHeader.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a ConnectionCloseHeader message.
                     * @function verify
                     * @memberof plexus.interop.transport.protocol.ConnectionCloseHeader
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ConnectionCloseHeader.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.completion != null && message.hasOwnProperty("completion")) {
                            var error = $root.plexus.Completion.verify(message.completion);
                            if (error)
                                return "completion." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates a ConnectionCloseHeader message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof plexus.interop.transport.protocol.ConnectionCloseHeader
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {plexus.interop.transport.protocol.ConnectionCloseHeader} ConnectionCloseHeader
                     */
                    ConnectionCloseHeader.fromObject = function fromObject(object) {
                        if (object instanceof $root.plexus.interop.transport.protocol.ConnectionCloseHeader)
                            return object;
                        var message = new $root.plexus.interop.transport.protocol.ConnectionCloseHeader();
                        if (object.completion != null) {
                            if (typeof object.completion !== "object")
                                throw TypeError(".plexus.interop.transport.protocol.ConnectionCloseHeader.completion: object expected");
                            message.completion = $root.plexus.Completion.fromObject(object.completion);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a ConnectionCloseHeader message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof plexus.interop.transport.protocol.ConnectionCloseHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.ConnectionCloseHeader} message ConnectionCloseHeader
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ConnectionCloseHeader.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults)
                            object.completion = null;
                        if (message.completion != null && message.hasOwnProperty("completion"))
                            object.completion = $root.plexus.Completion.toObject(message.completion, options);
                        return object;
                    };

                    /**
                     * Converts this ConnectionCloseHeader to JSON.
                     * @function toJSON
                     * @memberof plexus.interop.transport.protocol.ConnectionCloseHeader
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ConnectionCloseHeader.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return ConnectionCloseHeader;
                })();

                protocol.ChannelOpenHeader = (function() {

                    /**
                     * Properties of a ChannelOpenHeader.
                     * @memberof plexus.interop.transport.protocol
                     * @interface IChannelOpenHeader
                     * @property {plexus.IUniqueId} [channelId] ChannelOpenHeader channelId
                     */

                    /**
                     * Constructs a new ChannelOpenHeader.
                     * @memberof plexus.interop.transport.protocol
                     * @classdesc Represents a ChannelOpenHeader.
                     * @constructor
                     * @param {plexus.interop.transport.protocol.IChannelOpenHeader=} [properties] Properties to set
                     */
                    function ChannelOpenHeader(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * ChannelOpenHeader channelId.
                     * @member {(plexus.IUniqueId|null|undefined)}channelId
                     * @memberof plexus.interop.transport.protocol.ChannelOpenHeader
                     * @instance
                     */
                    ChannelOpenHeader.prototype.channelId = null;

                    /**
                     * Creates a new ChannelOpenHeader instance using the specified properties.
                     * @function create
                     * @memberof plexus.interop.transport.protocol.ChannelOpenHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IChannelOpenHeader=} [properties] Properties to set
                     * @returns {plexus.interop.transport.protocol.ChannelOpenHeader} ChannelOpenHeader instance
                     */
                    ChannelOpenHeader.create = function create(properties) {
                        return new ChannelOpenHeader(properties);
                    };

                    /**
                     * Encodes the specified ChannelOpenHeader message. Does not implicitly {@link plexus.interop.transport.protocol.ChannelOpenHeader.verify|verify} messages.
                     * @function encode
                     * @memberof plexus.interop.transport.protocol.ChannelOpenHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IChannelOpenHeader} message ChannelOpenHeader message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ChannelOpenHeader.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.channelId != null && message.hasOwnProperty("channelId"))
                            $root.plexus.UniqueId.encode(message.channelId, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified ChannelOpenHeader message, length delimited. Does not implicitly {@link plexus.interop.transport.protocol.ChannelOpenHeader.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof plexus.interop.transport.protocol.ChannelOpenHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IChannelOpenHeader} message ChannelOpenHeader message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ChannelOpenHeader.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a ChannelOpenHeader message from the specified reader or buffer.
                     * @function decode
                     * @memberof plexus.interop.transport.protocol.ChannelOpenHeader
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {plexus.interop.transport.protocol.ChannelOpenHeader} ChannelOpenHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ChannelOpenHeader.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.transport.protocol.ChannelOpenHeader();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1:
                                message.channelId = $root.plexus.UniqueId.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a ChannelOpenHeader message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof plexus.interop.transport.protocol.ChannelOpenHeader
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {plexus.interop.transport.protocol.ChannelOpenHeader} ChannelOpenHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ChannelOpenHeader.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a ChannelOpenHeader message.
                     * @function verify
                     * @memberof plexus.interop.transport.protocol.ChannelOpenHeader
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ChannelOpenHeader.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.channelId != null && message.hasOwnProperty("channelId")) {
                            var error = $root.plexus.UniqueId.verify(message.channelId);
                            if (error)
                                return "channelId." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates a ChannelOpenHeader message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof plexus.interop.transport.protocol.ChannelOpenHeader
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {plexus.interop.transport.protocol.ChannelOpenHeader} ChannelOpenHeader
                     */
                    ChannelOpenHeader.fromObject = function fromObject(object) {
                        if (object instanceof $root.plexus.interop.transport.protocol.ChannelOpenHeader)
                            return object;
                        var message = new $root.plexus.interop.transport.protocol.ChannelOpenHeader();
                        if (object.channelId != null) {
                            if (typeof object.channelId !== "object")
                                throw TypeError(".plexus.interop.transport.protocol.ChannelOpenHeader.channelId: object expected");
                            message.channelId = $root.plexus.UniqueId.fromObject(object.channelId);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a ChannelOpenHeader message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof plexus.interop.transport.protocol.ChannelOpenHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.ChannelOpenHeader} message ChannelOpenHeader
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ChannelOpenHeader.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults)
                            object.channelId = null;
                        if (message.channelId != null && message.hasOwnProperty("channelId"))
                            object.channelId = $root.plexus.UniqueId.toObject(message.channelId, options);
                        return object;
                    };

                    /**
                     * Converts this ChannelOpenHeader to JSON.
                     * @function toJSON
                     * @memberof plexus.interop.transport.protocol.ChannelOpenHeader
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ChannelOpenHeader.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return ChannelOpenHeader;
                })();

                protocol.ChannelCloseHeader = (function() {

                    /**
                     * Properties of a ChannelCloseHeader.
                     * @memberof plexus.interop.transport.protocol
                     * @interface IChannelCloseHeader
                     * @property {plexus.IUniqueId} [channelId] ChannelCloseHeader channelId
                     * @property {plexus.ICompletion} [completion] ChannelCloseHeader completion
                     */

                    /**
                     * Constructs a new ChannelCloseHeader.
                     * @memberof plexus.interop.transport.protocol
                     * @classdesc Represents a ChannelCloseHeader.
                     * @constructor
                     * @param {plexus.interop.transport.protocol.IChannelCloseHeader=} [properties] Properties to set
                     */
                    function ChannelCloseHeader(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * ChannelCloseHeader channelId.
                     * @member {(plexus.IUniqueId|null|undefined)}channelId
                     * @memberof plexus.interop.transport.protocol.ChannelCloseHeader
                     * @instance
                     */
                    ChannelCloseHeader.prototype.channelId = null;

                    /**
                     * ChannelCloseHeader completion.
                     * @member {(plexus.ICompletion|null|undefined)}completion
                     * @memberof plexus.interop.transport.protocol.ChannelCloseHeader
                     * @instance
                     */
                    ChannelCloseHeader.prototype.completion = null;

                    /**
                     * Creates a new ChannelCloseHeader instance using the specified properties.
                     * @function create
                     * @memberof plexus.interop.transport.protocol.ChannelCloseHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IChannelCloseHeader=} [properties] Properties to set
                     * @returns {plexus.interop.transport.protocol.ChannelCloseHeader} ChannelCloseHeader instance
                     */
                    ChannelCloseHeader.create = function create(properties) {
                        return new ChannelCloseHeader(properties);
                    };

                    /**
                     * Encodes the specified ChannelCloseHeader message. Does not implicitly {@link plexus.interop.transport.protocol.ChannelCloseHeader.verify|verify} messages.
                     * @function encode
                     * @memberof plexus.interop.transport.protocol.ChannelCloseHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IChannelCloseHeader} message ChannelCloseHeader message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ChannelCloseHeader.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.channelId != null && message.hasOwnProperty("channelId"))
                            $root.plexus.UniqueId.encode(message.channelId, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        if (message.completion != null && message.hasOwnProperty("completion"))
                            $root.plexus.Completion.encode(message.completion, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified ChannelCloseHeader message, length delimited. Does not implicitly {@link plexus.interop.transport.protocol.ChannelCloseHeader.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof plexus.interop.transport.protocol.ChannelCloseHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.IChannelCloseHeader} message ChannelCloseHeader message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ChannelCloseHeader.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a ChannelCloseHeader message from the specified reader or buffer.
                     * @function decode
                     * @memberof plexus.interop.transport.protocol.ChannelCloseHeader
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {plexus.interop.transport.protocol.ChannelCloseHeader} ChannelCloseHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ChannelCloseHeader.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.transport.protocol.ChannelCloseHeader();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1:
                                message.channelId = $root.plexus.UniqueId.decode(reader, reader.uint32());
                                break;
                            case 2:
                                message.completion = $root.plexus.Completion.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a ChannelCloseHeader message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof plexus.interop.transport.protocol.ChannelCloseHeader
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {plexus.interop.transport.protocol.ChannelCloseHeader} ChannelCloseHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ChannelCloseHeader.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a ChannelCloseHeader message.
                     * @function verify
                     * @memberof plexus.interop.transport.protocol.ChannelCloseHeader
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ChannelCloseHeader.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.channelId != null && message.hasOwnProperty("channelId")) {
                            var error = $root.plexus.UniqueId.verify(message.channelId);
                            if (error)
                                return "channelId." + error;
                        }
                        if (message.completion != null && message.hasOwnProperty("completion")) {
                            error = $root.plexus.Completion.verify(message.completion);
                            if (error)
                                return "completion." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates a ChannelCloseHeader message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof plexus.interop.transport.protocol.ChannelCloseHeader
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {plexus.interop.transport.protocol.ChannelCloseHeader} ChannelCloseHeader
                     */
                    ChannelCloseHeader.fromObject = function fromObject(object) {
                        if (object instanceof $root.plexus.interop.transport.protocol.ChannelCloseHeader)
                            return object;
                        var message = new $root.plexus.interop.transport.protocol.ChannelCloseHeader();
                        if (object.channelId != null) {
                            if (typeof object.channelId !== "object")
                                throw TypeError(".plexus.interop.transport.protocol.ChannelCloseHeader.channelId: object expected");
                            message.channelId = $root.plexus.UniqueId.fromObject(object.channelId);
                        }
                        if (object.completion != null) {
                            if (typeof object.completion !== "object")
                                throw TypeError(".plexus.interop.transport.protocol.ChannelCloseHeader.completion: object expected");
                            message.completion = $root.plexus.Completion.fromObject(object.completion);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a ChannelCloseHeader message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof plexus.interop.transport.protocol.ChannelCloseHeader
                     * @static
                     * @param {plexus.interop.transport.protocol.ChannelCloseHeader} message ChannelCloseHeader
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ChannelCloseHeader.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults) {
                            object.channelId = null;
                            object.completion = null;
                        }
                        if (message.channelId != null && message.hasOwnProperty("channelId"))
                            object.channelId = $root.plexus.UniqueId.toObject(message.channelId, options);
                        if (message.completion != null && message.hasOwnProperty("completion"))
                            object.completion = $root.plexus.Completion.toObject(message.completion, options);
                        return object;
                    };

                    /**
                     * Converts this ChannelCloseHeader to JSON.
                     * @function toJSON
                     * @memberof plexus.interop.transport.protocol.ChannelCloseHeader
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ChannelCloseHeader.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return ChannelCloseHeader;
                })();

                protocol.Header = (function() {

                    /**
                     * Properties of a Header.
                     * @memberof plexus.interop.transport.protocol
                     * @interface IHeader
                     * @property {plexus.interop.transport.protocol.IMessageFrameHeader} [messageFrame] Header messageFrame
                     * @property {plexus.interop.transport.protocol.IChannelOpenHeader} [channelOpen] Header channelOpen
                     * @property {plexus.interop.transport.protocol.IChannelCloseHeader} [channelClose] Header channelClose
                     * @property {plexus.interop.transport.protocol.IConnectionOpenHeader} [open] Header open
                     * @property {plexus.interop.transport.protocol.IConnectionCloseHeader} [close] Header close
                     */

                    /**
                     * Constructs a new Header.
                     * @memberof plexus.interop.transport.protocol
                     * @classdesc Represents a Header.
                     * @constructor
                     * @param {plexus.interop.transport.protocol.IHeader=} [properties] Properties to set
                     */
                    function Header(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Header messageFrame.
                     * @member {(plexus.interop.transport.protocol.IMessageFrameHeader|null|undefined)}messageFrame
                     * @memberof plexus.interop.transport.protocol.Header
                     * @instance
                     */
                    Header.prototype.messageFrame = null;

                    /**
                     * Header channelOpen.
                     * @member {(plexus.interop.transport.protocol.IChannelOpenHeader|null|undefined)}channelOpen
                     * @memberof plexus.interop.transport.protocol.Header
                     * @instance
                     */
                    Header.prototype.channelOpen = null;

                    /**
                     * Header channelClose.
                     * @member {(plexus.interop.transport.protocol.IChannelCloseHeader|null|undefined)}channelClose
                     * @memberof plexus.interop.transport.protocol.Header
                     * @instance
                     */
                    Header.prototype.channelClose = null;

                    /**
                     * Header open.
                     * @member {(plexus.interop.transport.protocol.IConnectionOpenHeader|null|undefined)}open
                     * @memberof plexus.interop.transport.protocol.Header
                     * @instance
                     */
                    Header.prototype.open = null;

                    /**
                     * Header close.
                     * @member {(plexus.interop.transport.protocol.IConnectionCloseHeader|null|undefined)}close
                     * @memberof plexus.interop.transport.protocol.Header
                     * @instance
                     */
                    Header.prototype.close = null;

                    // OneOf field names bound to virtual getters and setters
                    var $oneOfFields;

                    /**
                     * Header content.
                     * @member {string|undefined} content
                     * @memberof plexus.interop.transport.protocol.Header
                     * @instance
                     */
                    Object.defineProperty(Header.prototype, "content", {
                        get: $util.oneOfGetter($oneOfFields = ["messageFrame", "channelOpen", "channelClose", "open", "close"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * Creates a new Header instance using the specified properties.
                     * @function create
                     * @memberof plexus.interop.transport.protocol.Header
                     * @static
                     * @param {plexus.interop.transport.protocol.IHeader=} [properties] Properties to set
                     * @returns {plexus.interop.transport.protocol.Header} Header instance
                     */
                    Header.create = function create(properties) {
                        return new Header(properties);
                    };

                    /**
                     * Encodes the specified Header message. Does not implicitly {@link plexus.interop.transport.protocol.Header.verify|verify} messages.
                     * @function encode
                     * @memberof plexus.interop.transport.protocol.Header
                     * @static
                     * @param {plexus.interop.transport.protocol.IHeader} message Header message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Header.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.messageFrame != null && message.hasOwnProperty("messageFrame"))
                            $root.plexus.interop.transport.protocol.MessageFrameHeader.encode(message.messageFrame, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        if (message.channelOpen != null && message.hasOwnProperty("channelOpen"))
                            $root.plexus.interop.transport.protocol.ChannelOpenHeader.encode(message.channelOpen, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        if (message.channelClose != null && message.hasOwnProperty("channelClose"))
                            $root.plexus.interop.transport.protocol.ChannelCloseHeader.encode(message.channelClose, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                        if (message.open != null && message.hasOwnProperty("open"))
                            $root.plexus.interop.transport.protocol.ConnectionOpenHeader.encode(message.open, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                        if (message.close != null && message.hasOwnProperty("close"))
                            $root.plexus.interop.transport.protocol.ConnectionCloseHeader.encode(message.close, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified Header message, length delimited. Does not implicitly {@link plexus.interop.transport.protocol.Header.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof plexus.interop.transport.protocol.Header
                     * @static
                     * @param {plexus.interop.transport.protocol.IHeader} message Header message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Header.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a Header message from the specified reader or buffer.
                     * @function decode
                     * @memberof plexus.interop.transport.protocol.Header
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {plexus.interop.transport.protocol.Header} Header
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Header.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.transport.protocol.Header();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1:
                                message.messageFrame = $root.plexus.interop.transport.protocol.MessageFrameHeader.decode(reader, reader.uint32());
                                break;
                            case 2:
                                message.channelOpen = $root.plexus.interop.transport.protocol.ChannelOpenHeader.decode(reader, reader.uint32());
                                break;
                            case 3:
                                message.channelClose = $root.plexus.interop.transport.protocol.ChannelCloseHeader.decode(reader, reader.uint32());
                                break;
                            case 4:
                                message.open = $root.plexus.interop.transport.protocol.ConnectionOpenHeader.decode(reader, reader.uint32());
                                break;
                            case 5:
                                message.close = $root.plexus.interop.transport.protocol.ConnectionCloseHeader.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a Header message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof plexus.interop.transport.protocol.Header
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {plexus.interop.transport.protocol.Header} Header
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Header.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Header message.
                     * @function verify
                     * @memberof plexus.interop.transport.protocol.Header
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Header.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        var properties = {};
                        if (message.messageFrame != null && message.hasOwnProperty("messageFrame")) {
                            properties.content = 1;
                            var error = $root.plexus.interop.transport.protocol.MessageFrameHeader.verify(message.messageFrame);
                            if (error)
                                return "messageFrame." + error;
                        }
                        if (message.channelOpen != null && message.hasOwnProperty("channelOpen")) {
                            if (properties.content === 1)
                                return "content: multiple values";
                            properties.content = 1;
                            error = $root.plexus.interop.transport.protocol.ChannelOpenHeader.verify(message.channelOpen);
                            if (error)
                                return "channelOpen." + error;
                        }
                        if (message.channelClose != null && message.hasOwnProperty("channelClose")) {
                            if (properties.content === 1)
                                return "content: multiple values";
                            properties.content = 1;
                            error = $root.plexus.interop.transport.protocol.ChannelCloseHeader.verify(message.channelClose);
                            if (error)
                                return "channelClose." + error;
                        }
                        if (message.open != null && message.hasOwnProperty("open")) {
                            if (properties.content === 1)
                                return "content: multiple values";
                            properties.content = 1;
                            error = $root.plexus.interop.transport.protocol.ConnectionOpenHeader.verify(message.open);
                            if (error)
                                return "open." + error;
                        }
                        if (message.close != null && message.hasOwnProperty("close")) {
                            if (properties.content === 1)
                                return "content: multiple values";
                            properties.content = 1;
                            error = $root.plexus.interop.transport.protocol.ConnectionCloseHeader.verify(message.close);
                            if (error)
                                return "close." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates a Header message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof plexus.interop.transport.protocol.Header
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {plexus.interop.transport.protocol.Header} Header
                     */
                    Header.fromObject = function fromObject(object) {
                        if (object instanceof $root.plexus.interop.transport.protocol.Header)
                            return object;
                        var message = new $root.plexus.interop.transport.protocol.Header();
                        if (object.messageFrame != null) {
                            if (typeof object.messageFrame !== "object")
                                throw TypeError(".plexus.interop.transport.protocol.Header.messageFrame: object expected");
                            message.messageFrame = $root.plexus.interop.transport.protocol.MessageFrameHeader.fromObject(object.messageFrame);
                        }
                        if (object.channelOpen != null) {
                            if (typeof object.channelOpen !== "object")
                                throw TypeError(".plexus.interop.transport.protocol.Header.channelOpen: object expected");
                            message.channelOpen = $root.plexus.interop.transport.protocol.ChannelOpenHeader.fromObject(object.channelOpen);
                        }
                        if (object.channelClose != null) {
                            if (typeof object.channelClose !== "object")
                                throw TypeError(".plexus.interop.transport.protocol.Header.channelClose: object expected");
                            message.channelClose = $root.plexus.interop.transport.protocol.ChannelCloseHeader.fromObject(object.channelClose);
                        }
                        if (object.open != null) {
                            if (typeof object.open !== "object")
                                throw TypeError(".plexus.interop.transport.protocol.Header.open: object expected");
                            message.open = $root.plexus.interop.transport.protocol.ConnectionOpenHeader.fromObject(object.open);
                        }
                        if (object.close != null) {
                            if (typeof object.close !== "object")
                                throw TypeError(".plexus.interop.transport.protocol.Header.close: object expected");
                            message.close = $root.plexus.interop.transport.protocol.ConnectionCloseHeader.fromObject(object.close);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a Header message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof plexus.interop.transport.protocol.Header
                     * @static
                     * @param {plexus.interop.transport.protocol.Header} message Header
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Header.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (message.messageFrame != null && message.hasOwnProperty("messageFrame")) {
                            object.messageFrame = $root.plexus.interop.transport.protocol.MessageFrameHeader.toObject(message.messageFrame, options);
                            if (options.oneofs)
                                object.content = "messageFrame";
                        }
                        if (message.channelOpen != null && message.hasOwnProperty("channelOpen")) {
                            object.channelOpen = $root.plexus.interop.transport.protocol.ChannelOpenHeader.toObject(message.channelOpen, options);
                            if (options.oneofs)
                                object.content = "channelOpen";
                        }
                        if (message.channelClose != null && message.hasOwnProperty("channelClose")) {
                            object.channelClose = $root.plexus.interop.transport.protocol.ChannelCloseHeader.toObject(message.channelClose, options);
                            if (options.oneofs)
                                object.content = "channelClose";
                        }
                        if (message.open != null && message.hasOwnProperty("open")) {
                            object.open = $root.plexus.interop.transport.protocol.ConnectionOpenHeader.toObject(message.open, options);
                            if (options.oneofs)
                                object.content = "open";
                        }
                        if (message.close != null && message.hasOwnProperty("close")) {
                            object.close = $root.plexus.interop.transport.protocol.ConnectionCloseHeader.toObject(message.close, options);
                            if (options.oneofs)
                                object.content = "close";
                        }
                        return object;
                    };

                    /**
                     * Converts this Header to JSON.
                     * @function toJSON
                     * @memberof plexus.interop.transport.protocol.Header
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Header.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return Header;
                })();

                return protocol;
            })();

            return transport;
        })();

        return interop;
    })();

    plexus.UniqueId = (function() {

        /**
         * Properties of an UniqueId.
         * @memberof plexus
         * @interface IUniqueId
         * @property {Long} [lo] UniqueId lo
         * @property {Long} [hi] UniqueId hi
         */

        /**
         * Constructs a new UniqueId.
         * @memberof plexus
         * @classdesc Represents an UniqueId.
         * @constructor
         * @param {plexus.IUniqueId=} [properties] Properties to set
         */
        function UniqueId(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UniqueId lo.
         * @member {Long}lo
         * @memberof plexus.UniqueId
         * @instance
         */
        UniqueId.prototype.lo = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UniqueId hi.
         * @member {Long}hi
         * @memberof plexus.UniqueId
         * @instance
         */
        UniqueId.prototype.hi = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new UniqueId instance using the specified properties.
         * @function create
         * @memberof plexus.UniqueId
         * @static
         * @param {plexus.IUniqueId=} [properties] Properties to set
         * @returns {plexus.UniqueId} UniqueId instance
         */
        UniqueId.create = function create(properties) {
            return new UniqueId(properties);
        };

        /**
         * Encodes the specified UniqueId message. Does not implicitly {@link plexus.UniqueId.verify|verify} messages.
         * @function encode
         * @memberof plexus.UniqueId
         * @static
         * @param {plexus.IUniqueId} message UniqueId message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UniqueId.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.lo != null && message.hasOwnProperty("lo"))
                writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.lo);
            if (message.hi != null && message.hasOwnProperty("hi"))
                writer.uint32(/* id 2, wireType 1 =*/17).fixed64(message.hi);
            return writer;
        };

        /**
         * Encodes the specified UniqueId message, length delimited. Does not implicitly {@link plexus.UniqueId.verify|verify} messages.
         * @function encodeDelimited
         * @memberof plexus.UniqueId
         * @static
         * @param {plexus.IUniqueId} message UniqueId message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UniqueId.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UniqueId message from the specified reader or buffer.
         * @function decode
         * @memberof plexus.UniqueId
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {plexus.UniqueId} UniqueId
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UniqueId.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.UniqueId();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.lo = reader.fixed64();
                    break;
                case 2:
                    message.hi = reader.fixed64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an UniqueId message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof plexus.UniqueId
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {plexus.UniqueId} UniqueId
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UniqueId.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UniqueId message.
         * @function verify
         * @memberof plexus.UniqueId
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UniqueId.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.lo != null && message.hasOwnProperty("lo"))
                if (!$util.isInteger(message.lo) && !(message.lo && $util.isInteger(message.lo.low) && $util.isInteger(message.lo.high)))
                    return "lo: integer|Long expected";
            if (message.hi != null && message.hasOwnProperty("hi"))
                if (!$util.isInteger(message.hi) && !(message.hi && $util.isInteger(message.hi.low) && $util.isInteger(message.hi.high)))
                    return "hi: integer|Long expected";
            return null;
        };

        /**
         * Creates an UniqueId message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof plexus.UniqueId
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {plexus.UniqueId} UniqueId
         */
        UniqueId.fromObject = function fromObject(object) {
            if (object instanceof $root.plexus.UniqueId)
                return object;
            var message = new $root.plexus.UniqueId();
            if (object.lo != null)
                if ($util.Long)
                    (message.lo = $util.Long.fromValue(object.lo)).unsigned = false;
                else if (typeof object.lo === "string")
                    message.lo = parseInt(object.lo, 10);
                else if (typeof object.lo === "number")
                    message.lo = object.lo;
                else if (typeof object.lo === "object")
                    message.lo = new $util.LongBits(object.lo.low >>> 0, object.lo.high >>> 0).toNumber();
            if (object.hi != null)
                if ($util.Long)
                    (message.hi = $util.Long.fromValue(object.hi)).unsigned = false;
                else if (typeof object.hi === "string")
                    message.hi = parseInt(object.hi, 10);
                else if (typeof object.hi === "number")
                    message.hi = object.hi;
                else if (typeof object.hi === "object")
                    message.hi = new $util.LongBits(object.hi.low >>> 0, object.hi.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from an UniqueId message. Also converts values to other types if specified.
         * @function toObject
         * @memberof plexus.UniqueId
         * @static
         * @param {plexus.UniqueId} message UniqueId
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UniqueId.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.lo = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.lo = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.hi = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.hi = options.longs === String ? "0" : 0;
            }
            if (message.lo != null && message.hasOwnProperty("lo"))
                if (typeof message.lo === "number")
                    object.lo = options.longs === String ? String(message.lo) : message.lo;
                else
                    object.lo = options.longs === String ? $util.Long.prototype.toString.call(message.lo) : options.longs === Number ? new $util.LongBits(message.lo.low >>> 0, message.lo.high >>> 0).toNumber() : message.lo;
            if (message.hi != null && message.hasOwnProperty("hi"))
                if (typeof message.hi === "number")
                    object.hi = options.longs === String ? String(message.hi) : message.hi;
                else
                    object.hi = options.longs === String ? $util.Long.prototype.toString.call(message.hi) : options.longs === Number ? new $util.LongBits(message.hi.low >>> 0, message.hi.high >>> 0).toNumber() : message.hi;
            return object;
        };

        /**
         * Converts this UniqueId to JSON.
         * @function toJSON
         * @memberof plexus.UniqueId
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UniqueId.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return UniqueId;
    })();

    plexus.Error = (function() {

        /**
         * Properties of an Error.
         * @memberof plexus
         * @interface IError
         * @property {string} [message] Error message
         * @property {string} [details] Error details
         */

        /**
         * Constructs a new Error.
         * @memberof plexus
         * @classdesc Represents an Error.
         * @constructor
         * @param {plexus.IError=} [properties] Properties to set
         */
        function Error(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Error message.
         * @member {string}message
         * @memberof plexus.Error
         * @instance
         */
        Error.prototype.message = "";

        /**
         * Error details.
         * @member {string}details
         * @memberof plexus.Error
         * @instance
         */
        Error.prototype.details = "";

        /**
         * Creates a new Error instance using the specified properties.
         * @function create
         * @memberof plexus.Error
         * @static
         * @param {plexus.IError=} [properties] Properties to set
         * @returns {plexus.Error} Error instance
         */
        Error.create = function create(properties) {
            return new Error(properties);
        };

        /**
         * Encodes the specified Error message. Does not implicitly {@link plexus.Error.verify|verify} messages.
         * @function encode
         * @memberof plexus.Error
         * @static
         * @param {plexus.IError} message Error message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Error.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.message != null && message.hasOwnProperty("message"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.message);
            if (message.details != null && message.hasOwnProperty("details"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.details);
            return writer;
        };

        /**
         * Encodes the specified Error message, length delimited. Does not implicitly {@link plexus.Error.verify|verify} messages.
         * @function encodeDelimited
         * @memberof plexus.Error
         * @static
         * @param {plexus.IError} message Error message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Error.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Error message from the specified reader or buffer.
         * @function decode
         * @memberof plexus.Error
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {plexus.Error} Error
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Error.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.Error();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.message = reader.string();
                    break;
                case 2:
                    message.details = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Error message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof plexus.Error
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {plexus.Error} Error
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Error.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Error message.
         * @function verify
         * @memberof plexus.Error
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Error.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.message != null && message.hasOwnProperty("message"))
                if (!$util.isString(message.message))
                    return "message: string expected";
            if (message.details != null && message.hasOwnProperty("details"))
                if (!$util.isString(message.details))
                    return "details: string expected";
            return null;
        };

        /**
         * Creates an Error message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof plexus.Error
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {plexus.Error} Error
         */
        Error.fromObject = function fromObject(object) {
            if (object instanceof $root.plexus.Error)
                return object;
            var message = new $root.plexus.Error();
            if (object.message != null)
                message.message = String(object.message);
            if (object.details != null)
                message.details = String(object.details);
            return message;
        };

        /**
         * Creates a plain object from an Error message. Also converts values to other types if specified.
         * @function toObject
         * @memberof plexus.Error
         * @static
         * @param {plexus.Error} message Error
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Error.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.message = "";
                object.details = "";
            }
            if (message.message != null && message.hasOwnProperty("message"))
                object.message = message.message;
            if (message.details != null && message.hasOwnProperty("details"))
                object.details = message.details;
            return object;
        };

        /**
         * Converts this Error to JSON.
         * @function toJSON
         * @memberof plexus.Error
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Error.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Error;
    })();

    plexus.Completion = (function() {

        /**
         * Properties of a Completion.
         * @memberof plexus
         * @interface ICompletion
         * @property {plexus.Completion.Status} [status] Completion status
         * @property {plexus.IError} [error] Completion error
         */

        /**
         * Constructs a new Completion.
         * @memberof plexus
         * @classdesc Represents a Completion.
         * @constructor
         * @param {plexus.ICompletion=} [properties] Properties to set
         */
        function Completion(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Completion status.
         * @member {plexus.Completion.Status}status
         * @memberof plexus.Completion
         * @instance
         */
        Completion.prototype.status = 0;

        /**
         * Completion error.
         * @member {(plexus.IError|null|undefined)}error
         * @memberof plexus.Completion
         * @instance
         */
        Completion.prototype.error = null;

        /**
         * Creates a new Completion instance using the specified properties.
         * @function create
         * @memberof plexus.Completion
         * @static
         * @param {plexus.ICompletion=} [properties] Properties to set
         * @returns {plexus.Completion} Completion instance
         */
        Completion.create = function create(properties) {
            return new Completion(properties);
        };

        /**
         * Encodes the specified Completion message. Does not implicitly {@link plexus.Completion.verify|verify} messages.
         * @function encode
         * @memberof plexus.Completion
         * @static
         * @param {plexus.ICompletion} message Completion message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Completion.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.status != null && message.hasOwnProperty("status"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
            if (message.error != null && message.hasOwnProperty("error"))
                $root.plexus.Error.encode(message.error, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Completion message, length delimited. Does not implicitly {@link plexus.Completion.verify|verify} messages.
         * @function encodeDelimited
         * @memberof plexus.Completion
         * @static
         * @param {plexus.ICompletion} message Completion message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Completion.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Completion message from the specified reader or buffer.
         * @function decode
         * @memberof plexus.Completion
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {plexus.Completion} Completion
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Completion.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.Completion();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.status = reader.int32();
                    break;
                case 2:
                    message.error = $root.plexus.Error.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Completion message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof plexus.Completion
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {plexus.Completion} Completion
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Completion.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Completion message.
         * @function verify
         * @memberof plexus.Completion
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Completion.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.error != null && message.hasOwnProperty("error")) {
                var error = $root.plexus.Error.verify(message.error);
                if (error)
                    return "error." + error;
            }
            return null;
        };

        /**
         * Creates a Completion message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof plexus.Completion
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {plexus.Completion} Completion
         */
        Completion.fromObject = function fromObject(object) {
            if (object instanceof $root.plexus.Completion)
                return object;
            var message = new $root.plexus.Completion();
            switch (object.status) {
            case "Completed":
            case 0:
                message.status = 0;
                break;
            case "Canceled":
            case 1:
                message.status = 1;
                break;
            case "Failed":
            case 2:
                message.status = 2;
                break;
            }
            if (object.error != null) {
                if (typeof object.error !== "object")
                    throw TypeError(".plexus.Completion.error: object expected");
                message.error = $root.plexus.Error.fromObject(object.error);
            }
            return message;
        };

        /**
         * Creates a plain object from a Completion message. Also converts values to other types if specified.
         * @function toObject
         * @memberof plexus.Completion
         * @static
         * @param {plexus.Completion} message Completion
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Completion.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.status = options.enums === String ? "Completed" : 0;
                object.error = null;
            }
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.plexus.Completion.Status[message.status] : message.status;
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = $root.plexus.Error.toObject(message.error, options);
            return object;
        };

        /**
         * Converts this Completion to JSON.
         * @function toJSON
         * @memberof plexus.Completion
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Completion.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Status enum.
         * @enum {string}
         * @property {number} Completed=0 Completed value
         * @property {number} Canceled=1 Canceled value
         * @property {number} Failed=2 Failed value
         */
        Completion.Status = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "Completed"] = 0;
            values[valuesById[1] = "Canceled"] = 1;
            values[valuesById[2] = "Failed"] = 2;
            return values;
        })();

        return Completion;
    })();

    return plexus;
})();

module.exports = $root;
