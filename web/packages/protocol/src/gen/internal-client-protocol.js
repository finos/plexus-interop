/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots.plexusClient || ($protobuf.roots.plexusClient = {});

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

        interop.protocol = (function() {

            /**
             * Namespace protocol.
             * @memberof plexus.interop
             * @namespace
             */
            var protocol = {};

            protocol.ConsumedServiceReference = (function() {

                /**
                 * Properties of a ConsumedServiceReference.
                 * @memberof plexus.interop.protocol
                 * @interface IConsumedServiceReference
                 * @property {string} [serviceId] ConsumedServiceReference serviceId
                 * @property {string} [serviceAlias] ConsumedServiceReference serviceAlias
                 */

                /**
                 * Constructs a new ConsumedServiceReference.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a ConsumedServiceReference.
                 * @constructor
                 * @param {plexus.interop.protocol.IConsumedServiceReference=} [properties] Properties to set
                 */
                function ConsumedServiceReference(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ConsumedServiceReference serviceId.
                 * @member {string}serviceId
                 * @memberof plexus.interop.protocol.ConsumedServiceReference
                 * @instance
                 */
                ConsumedServiceReference.prototype.serviceId = "";

                /**
                 * ConsumedServiceReference serviceAlias.
                 * @member {string}serviceAlias
                 * @memberof plexus.interop.protocol.ConsumedServiceReference
                 * @instance
                 */
                ConsumedServiceReference.prototype.serviceAlias = "";

                /**
                 * Creates a new ConsumedServiceReference instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.ConsumedServiceReference
                 * @static
                 * @param {plexus.interop.protocol.IConsumedServiceReference=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.ConsumedServiceReference} ConsumedServiceReference instance
                 */
                ConsumedServiceReference.create = function create(properties) {
                    return new ConsumedServiceReference(properties);
                };

                /**
                 * Encodes the specified ConsumedServiceReference message. Does not implicitly {@link plexus.interop.protocol.ConsumedServiceReference.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.ConsumedServiceReference
                 * @static
                 * @param {plexus.interop.protocol.IConsumedServiceReference} message ConsumedServiceReference message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ConsumedServiceReference.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.serviceId != null && message.hasOwnProperty("serviceId"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.serviceId);
                    if (message.serviceAlias != null && message.hasOwnProperty("serviceAlias"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.serviceAlias);
                    return writer;
                };

                /**
                 * Encodes the specified ConsumedServiceReference message, length delimited. Does not implicitly {@link plexus.interop.protocol.ConsumedServiceReference.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.ConsumedServiceReference
                 * @static
                 * @param {plexus.interop.protocol.IConsumedServiceReference} message ConsumedServiceReference message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ConsumedServiceReference.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ConsumedServiceReference message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.ConsumedServiceReference
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.ConsumedServiceReference} ConsumedServiceReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ConsumedServiceReference.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.ConsumedServiceReference();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.serviceId = reader.string();
                            break;
                        case 2:
                            message.serviceAlias = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ConsumedServiceReference message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.ConsumedServiceReference
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.ConsumedServiceReference} ConsumedServiceReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ConsumedServiceReference.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ConsumedServiceReference message.
                 * @function verify
                 * @memberof plexus.interop.protocol.ConsumedServiceReference
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ConsumedServiceReference.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.serviceId != null && message.hasOwnProperty("serviceId"))
                        if (!$util.isString(message.serviceId))
                            return "serviceId: string expected";
                    if (message.serviceAlias != null && message.hasOwnProperty("serviceAlias"))
                        if (!$util.isString(message.serviceAlias))
                            return "serviceAlias: string expected";
                    return null;
                };

                /**
                 * Creates a ConsumedServiceReference message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.ConsumedServiceReference
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.ConsumedServiceReference} ConsumedServiceReference
                 */
                ConsumedServiceReference.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.ConsumedServiceReference)
                        return object;
                    var message = new $root.plexus.interop.protocol.ConsumedServiceReference();
                    if (object.serviceId != null)
                        message.serviceId = String(object.serviceId);
                    if (object.serviceAlias != null)
                        message.serviceAlias = String(object.serviceAlias);
                    return message;
                };

                /**
                 * Creates a plain object from a ConsumedServiceReference message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.ConsumedServiceReference
                 * @static
                 * @param {plexus.interop.protocol.ConsumedServiceReference} message ConsumedServiceReference
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ConsumedServiceReference.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.serviceId = "";
                        object.serviceAlias = "";
                    }
                    if (message.serviceId != null && message.hasOwnProperty("serviceId"))
                        object.serviceId = message.serviceId;
                    if (message.serviceAlias != null && message.hasOwnProperty("serviceAlias"))
                        object.serviceAlias = message.serviceAlias;
                    return object;
                };

                /**
                 * Converts this ConsumedServiceReference to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.ConsumedServiceReference
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ConsumedServiceReference.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return ConsumedServiceReference;
            })();

            protocol.ConsumedMethodReference = (function() {

                /**
                 * Properties of a ConsumedMethodReference.
                 * @memberof plexus.interop.protocol
                 * @interface IConsumedMethodReference
                 * @property {plexus.interop.protocol.IConsumedServiceReference} [consumedService] ConsumedMethodReference consumedService
                 * @property {string} [methodId] ConsumedMethodReference methodId
                 */

                /**
                 * Constructs a new ConsumedMethodReference.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a ConsumedMethodReference.
                 * @constructor
                 * @param {plexus.interop.protocol.IConsumedMethodReference=} [properties] Properties to set
                 */
                function ConsumedMethodReference(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ConsumedMethodReference consumedService.
                 * @member {(plexus.interop.protocol.IConsumedServiceReference|null|undefined)}consumedService
                 * @memberof plexus.interop.protocol.ConsumedMethodReference
                 * @instance
                 */
                ConsumedMethodReference.prototype.consumedService = null;

                /**
                 * ConsumedMethodReference methodId.
                 * @member {string}methodId
                 * @memberof plexus.interop.protocol.ConsumedMethodReference
                 * @instance
                 */
                ConsumedMethodReference.prototype.methodId = "";

                /**
                 * Creates a new ConsumedMethodReference instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.ConsumedMethodReference
                 * @static
                 * @param {plexus.interop.protocol.IConsumedMethodReference=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.ConsumedMethodReference} ConsumedMethodReference instance
                 */
                ConsumedMethodReference.create = function create(properties) {
                    return new ConsumedMethodReference(properties);
                };

                /**
                 * Encodes the specified ConsumedMethodReference message. Does not implicitly {@link plexus.interop.protocol.ConsumedMethodReference.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.ConsumedMethodReference
                 * @static
                 * @param {plexus.interop.protocol.IConsumedMethodReference} message ConsumedMethodReference message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ConsumedMethodReference.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.consumedService != null && message.hasOwnProperty("consumedService"))
                        $root.plexus.interop.protocol.ConsumedServiceReference.encode(message.consumedService, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.methodId != null && message.hasOwnProperty("methodId"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.methodId);
                    return writer;
                };

                /**
                 * Encodes the specified ConsumedMethodReference message, length delimited. Does not implicitly {@link plexus.interop.protocol.ConsumedMethodReference.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.ConsumedMethodReference
                 * @static
                 * @param {plexus.interop.protocol.IConsumedMethodReference} message ConsumedMethodReference message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ConsumedMethodReference.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ConsumedMethodReference message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.ConsumedMethodReference
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.ConsumedMethodReference} ConsumedMethodReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ConsumedMethodReference.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.ConsumedMethodReference();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.consumedService = $root.plexus.interop.protocol.ConsumedServiceReference.decode(reader, reader.uint32());
                            break;
                        case 2:
                            message.methodId = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ConsumedMethodReference message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.ConsumedMethodReference
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.ConsumedMethodReference} ConsumedMethodReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ConsumedMethodReference.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ConsumedMethodReference message.
                 * @function verify
                 * @memberof plexus.interop.protocol.ConsumedMethodReference
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ConsumedMethodReference.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.consumedService != null && message.hasOwnProperty("consumedService")) {
                        var error = $root.plexus.interop.protocol.ConsumedServiceReference.verify(message.consumedService);
                        if (error)
                            return "consumedService." + error;
                    }
                    if (message.methodId != null && message.hasOwnProperty("methodId"))
                        if (!$util.isString(message.methodId))
                            return "methodId: string expected";
                    return null;
                };

                /**
                 * Creates a ConsumedMethodReference message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.ConsumedMethodReference
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.ConsumedMethodReference} ConsumedMethodReference
                 */
                ConsumedMethodReference.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.ConsumedMethodReference)
                        return object;
                    var message = new $root.plexus.interop.protocol.ConsumedMethodReference();
                    if (object.consumedService != null) {
                        if (typeof object.consumedService !== "object")
                            throw TypeError(".plexus.interop.protocol.ConsumedMethodReference.consumedService: object expected");
                        message.consumedService = $root.plexus.interop.protocol.ConsumedServiceReference.fromObject(object.consumedService);
                    }
                    if (object.methodId != null)
                        message.methodId = String(object.methodId);
                    return message;
                };

                /**
                 * Creates a plain object from a ConsumedMethodReference message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.ConsumedMethodReference
                 * @static
                 * @param {plexus.interop.protocol.ConsumedMethodReference} message ConsumedMethodReference
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ConsumedMethodReference.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.consumedService = null;
                        object.methodId = "";
                    }
                    if (message.consumedService != null && message.hasOwnProperty("consumedService"))
                        object.consumedService = $root.plexus.interop.protocol.ConsumedServiceReference.toObject(message.consumedService, options);
                    if (message.methodId != null && message.hasOwnProperty("methodId"))
                        object.methodId = message.methodId;
                    return object;
                };

                /**
                 * Converts this ConsumedMethodReference to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.ConsumedMethodReference
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ConsumedMethodReference.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return ConsumedMethodReference;
            })();

            protocol.ProvidedServiceReference = (function() {

                /**
                 * Properties of a ProvidedServiceReference.
                 * @memberof plexus.interop.protocol
                 * @interface IProvidedServiceReference
                 * @property {string} [serviceId] ProvidedServiceReference serviceId
                 * @property {string} [serviceAlias] ProvidedServiceReference serviceAlias
                 * @property {string} [applicationId] ProvidedServiceReference applicationId
                 * @property {plexus.IUniqueId} [connectionId] ProvidedServiceReference connectionId
                 */

                /**
                 * Constructs a new ProvidedServiceReference.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a ProvidedServiceReference.
                 * @constructor
                 * @param {plexus.interop.protocol.IProvidedServiceReference=} [properties] Properties to set
                 */
                function ProvidedServiceReference(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ProvidedServiceReference serviceId.
                 * @member {string}serviceId
                 * @memberof plexus.interop.protocol.ProvidedServiceReference
                 * @instance
                 */
                ProvidedServiceReference.prototype.serviceId = "";

                /**
                 * ProvidedServiceReference serviceAlias.
                 * @member {string}serviceAlias
                 * @memberof plexus.interop.protocol.ProvidedServiceReference
                 * @instance
                 */
                ProvidedServiceReference.prototype.serviceAlias = "";

                /**
                 * ProvidedServiceReference applicationId.
                 * @member {string}applicationId
                 * @memberof plexus.interop.protocol.ProvidedServiceReference
                 * @instance
                 */
                ProvidedServiceReference.prototype.applicationId = "";

                /**
                 * ProvidedServiceReference connectionId.
                 * @member {(plexus.IUniqueId|null|undefined)}connectionId
                 * @memberof plexus.interop.protocol.ProvidedServiceReference
                 * @instance
                 */
                ProvidedServiceReference.prototype.connectionId = null;

                /**
                 * Creates a new ProvidedServiceReference instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.ProvidedServiceReference
                 * @static
                 * @param {plexus.interop.protocol.IProvidedServiceReference=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.ProvidedServiceReference} ProvidedServiceReference instance
                 */
                ProvidedServiceReference.create = function create(properties) {
                    return new ProvidedServiceReference(properties);
                };

                /**
                 * Encodes the specified ProvidedServiceReference message. Does not implicitly {@link plexus.interop.protocol.ProvidedServiceReference.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.ProvidedServiceReference
                 * @static
                 * @param {plexus.interop.protocol.IProvidedServiceReference} message ProvidedServiceReference message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ProvidedServiceReference.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.serviceId != null && message.hasOwnProperty("serviceId"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.serviceId);
                    if (message.serviceAlias != null && message.hasOwnProperty("serviceAlias"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.serviceAlias);
                    if (message.applicationId != null && message.hasOwnProperty("applicationId"))
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.applicationId);
                    if (message.connectionId != null && message.hasOwnProperty("connectionId"))
                        $root.plexus.UniqueId.encode(message.connectionId, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ProvidedServiceReference message, length delimited. Does not implicitly {@link plexus.interop.protocol.ProvidedServiceReference.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.ProvidedServiceReference
                 * @static
                 * @param {plexus.interop.protocol.IProvidedServiceReference} message ProvidedServiceReference message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ProvidedServiceReference.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ProvidedServiceReference message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.ProvidedServiceReference
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.ProvidedServiceReference} ProvidedServiceReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ProvidedServiceReference.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.ProvidedServiceReference();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.serviceId = reader.string();
                            break;
                        case 2:
                            message.serviceAlias = reader.string();
                            break;
                        case 3:
                            message.applicationId = reader.string();
                            break;
                        case 4:
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
                 * Decodes a ProvidedServiceReference message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.ProvidedServiceReference
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.ProvidedServiceReference} ProvidedServiceReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ProvidedServiceReference.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ProvidedServiceReference message.
                 * @function verify
                 * @memberof plexus.interop.protocol.ProvidedServiceReference
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ProvidedServiceReference.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.serviceId != null && message.hasOwnProperty("serviceId"))
                        if (!$util.isString(message.serviceId))
                            return "serviceId: string expected";
                    if (message.serviceAlias != null && message.hasOwnProperty("serviceAlias"))
                        if (!$util.isString(message.serviceAlias))
                            return "serviceAlias: string expected";
                    if (message.applicationId != null && message.hasOwnProperty("applicationId"))
                        if (!$util.isString(message.applicationId))
                            return "applicationId: string expected";
                    if (message.connectionId != null && message.hasOwnProperty("connectionId")) {
                        var error = $root.plexus.UniqueId.verify(message.connectionId);
                        if (error)
                            return "connectionId." + error;
                    }
                    return null;
                };

                /**
                 * Creates a ProvidedServiceReference message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.ProvidedServiceReference
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.ProvidedServiceReference} ProvidedServiceReference
                 */
                ProvidedServiceReference.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.ProvidedServiceReference)
                        return object;
                    var message = new $root.plexus.interop.protocol.ProvidedServiceReference();
                    if (object.serviceId != null)
                        message.serviceId = String(object.serviceId);
                    if (object.serviceAlias != null)
                        message.serviceAlias = String(object.serviceAlias);
                    if (object.applicationId != null)
                        message.applicationId = String(object.applicationId);
                    if (object.connectionId != null) {
                        if (typeof object.connectionId !== "object")
                            throw TypeError(".plexus.interop.protocol.ProvidedServiceReference.connectionId: object expected");
                        message.connectionId = $root.plexus.UniqueId.fromObject(object.connectionId);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ProvidedServiceReference message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.ProvidedServiceReference
                 * @static
                 * @param {plexus.interop.protocol.ProvidedServiceReference} message ProvidedServiceReference
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ProvidedServiceReference.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.serviceId = "";
                        object.serviceAlias = "";
                        object.applicationId = "";
                        object.connectionId = null;
                    }
                    if (message.serviceId != null && message.hasOwnProperty("serviceId"))
                        object.serviceId = message.serviceId;
                    if (message.serviceAlias != null && message.hasOwnProperty("serviceAlias"))
                        object.serviceAlias = message.serviceAlias;
                    if (message.applicationId != null && message.hasOwnProperty("applicationId"))
                        object.applicationId = message.applicationId;
                    if (message.connectionId != null && message.hasOwnProperty("connectionId"))
                        object.connectionId = $root.plexus.UniqueId.toObject(message.connectionId, options);
                    return object;
                };

                /**
                 * Converts this ProvidedServiceReference to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.ProvidedServiceReference
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ProvidedServiceReference.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return ProvidedServiceReference;
            })();

            protocol.ProvidedMethodReference = (function() {

                /**
                 * Properties of a ProvidedMethodReference.
                 * @memberof plexus.interop.protocol
                 * @interface IProvidedMethodReference
                 * @property {plexus.interop.protocol.IProvidedServiceReference} [providedService] ProvidedMethodReference providedService
                 * @property {string} [methodId] ProvidedMethodReference methodId
                 */

                /**
                 * Constructs a new ProvidedMethodReference.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a ProvidedMethodReference.
                 * @constructor
                 * @param {plexus.interop.protocol.IProvidedMethodReference=} [properties] Properties to set
                 */
                function ProvidedMethodReference(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ProvidedMethodReference providedService.
                 * @member {(plexus.interop.protocol.IProvidedServiceReference|null|undefined)}providedService
                 * @memberof plexus.interop.protocol.ProvidedMethodReference
                 * @instance
                 */
                ProvidedMethodReference.prototype.providedService = null;

                /**
                 * ProvidedMethodReference methodId.
                 * @member {string}methodId
                 * @memberof plexus.interop.protocol.ProvidedMethodReference
                 * @instance
                 */
                ProvidedMethodReference.prototype.methodId = "";

                /**
                 * Creates a new ProvidedMethodReference instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.ProvidedMethodReference
                 * @static
                 * @param {plexus.interop.protocol.IProvidedMethodReference=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.ProvidedMethodReference} ProvidedMethodReference instance
                 */
                ProvidedMethodReference.create = function create(properties) {
                    return new ProvidedMethodReference(properties);
                };

                /**
                 * Encodes the specified ProvidedMethodReference message. Does not implicitly {@link plexus.interop.protocol.ProvidedMethodReference.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.ProvidedMethodReference
                 * @static
                 * @param {plexus.interop.protocol.IProvidedMethodReference} message ProvidedMethodReference message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ProvidedMethodReference.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.providedService != null && message.hasOwnProperty("providedService"))
                        $root.plexus.interop.protocol.ProvidedServiceReference.encode(message.providedService, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.methodId != null && message.hasOwnProperty("methodId"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.methodId);
                    return writer;
                };

                /**
                 * Encodes the specified ProvidedMethodReference message, length delimited. Does not implicitly {@link plexus.interop.protocol.ProvidedMethodReference.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.ProvidedMethodReference
                 * @static
                 * @param {plexus.interop.protocol.IProvidedMethodReference} message ProvidedMethodReference message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ProvidedMethodReference.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ProvidedMethodReference message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.ProvidedMethodReference
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.ProvidedMethodReference} ProvidedMethodReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ProvidedMethodReference.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.ProvidedMethodReference();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.providedService = $root.plexus.interop.protocol.ProvidedServiceReference.decode(reader, reader.uint32());
                            break;
                        case 2:
                            message.methodId = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ProvidedMethodReference message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.ProvidedMethodReference
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.ProvidedMethodReference} ProvidedMethodReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ProvidedMethodReference.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ProvidedMethodReference message.
                 * @function verify
                 * @memberof plexus.interop.protocol.ProvidedMethodReference
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ProvidedMethodReference.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.providedService != null && message.hasOwnProperty("providedService")) {
                        var error = $root.plexus.interop.protocol.ProvidedServiceReference.verify(message.providedService);
                        if (error)
                            return "providedService." + error;
                    }
                    if (message.methodId != null && message.hasOwnProperty("methodId"))
                        if (!$util.isString(message.methodId))
                            return "methodId: string expected";
                    return null;
                };

                /**
                 * Creates a ProvidedMethodReference message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.ProvidedMethodReference
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.ProvidedMethodReference} ProvidedMethodReference
                 */
                ProvidedMethodReference.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.ProvidedMethodReference)
                        return object;
                    var message = new $root.plexus.interop.protocol.ProvidedMethodReference();
                    if (object.providedService != null) {
                        if (typeof object.providedService !== "object")
                            throw TypeError(".plexus.interop.protocol.ProvidedMethodReference.providedService: object expected");
                        message.providedService = $root.plexus.interop.protocol.ProvidedServiceReference.fromObject(object.providedService);
                    }
                    if (object.methodId != null)
                        message.methodId = String(object.methodId);
                    return message;
                };

                /**
                 * Creates a plain object from a ProvidedMethodReference message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.ProvidedMethodReference
                 * @static
                 * @param {plexus.interop.protocol.ProvidedMethodReference} message ProvidedMethodReference
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ProvidedMethodReference.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.providedService = null;
                        object.methodId = "";
                    }
                    if (message.providedService != null && message.hasOwnProperty("providedService"))
                        object.providedService = $root.plexus.interop.protocol.ProvidedServiceReference.toObject(message.providedService, options);
                    if (message.methodId != null && message.hasOwnProperty("methodId"))
                        object.methodId = message.methodId;
                    return object;
                };

                /**
                 * Converts this ProvidedMethodReference to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.ProvidedMethodReference
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ProvidedMethodReference.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return ProvidedMethodReference;
            })();

            protocol.ConnectRequest = (function() {

                /**
                 * Properties of a ConnectRequest.
                 * @memberof plexus.interop.protocol
                 * @interface IConnectRequest
                 * @property {string} [applicationId] ConnectRequest applicationId
                 * @property {plexus.IUniqueId} [applicationInstanceId] ConnectRequest applicationInstanceId
                 */

                /**
                 * Constructs a new ConnectRequest.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a ConnectRequest.
                 * @constructor
                 * @param {plexus.interop.protocol.IConnectRequest=} [properties] Properties to set
                 */
                function ConnectRequest(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ConnectRequest applicationId.
                 * @member {string}applicationId
                 * @memberof plexus.interop.protocol.ConnectRequest
                 * @instance
                 */
                ConnectRequest.prototype.applicationId = "";

                /**
                 * ConnectRequest applicationInstanceId.
                 * @member {(plexus.IUniqueId|null|undefined)}applicationInstanceId
                 * @memberof plexus.interop.protocol.ConnectRequest
                 * @instance
                 */
                ConnectRequest.prototype.applicationInstanceId = null;

                /**
                 * Creates a new ConnectRequest instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.ConnectRequest
                 * @static
                 * @param {plexus.interop.protocol.IConnectRequest=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.ConnectRequest} ConnectRequest instance
                 */
                ConnectRequest.create = function create(properties) {
                    return new ConnectRequest(properties);
                };

                /**
                 * Encodes the specified ConnectRequest message. Does not implicitly {@link plexus.interop.protocol.ConnectRequest.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.ConnectRequest
                 * @static
                 * @param {plexus.interop.protocol.IConnectRequest} message ConnectRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ConnectRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.applicationId != null && message.hasOwnProperty("applicationId"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.applicationId);
                    if (message.applicationInstanceId != null && message.hasOwnProperty("applicationInstanceId"))
                        $root.plexus.UniqueId.encode(message.applicationInstanceId, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ConnectRequest message, length delimited. Does not implicitly {@link plexus.interop.protocol.ConnectRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.ConnectRequest
                 * @static
                 * @param {plexus.interop.protocol.IConnectRequest} message ConnectRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ConnectRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ConnectRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.ConnectRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.ConnectRequest} ConnectRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ConnectRequest.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.ConnectRequest();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.applicationId = reader.string();
                            break;
                        case 2:
                            message.applicationInstanceId = $root.plexus.UniqueId.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ConnectRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.ConnectRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.ConnectRequest} ConnectRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ConnectRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ConnectRequest message.
                 * @function verify
                 * @memberof plexus.interop.protocol.ConnectRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ConnectRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.applicationId != null && message.hasOwnProperty("applicationId"))
                        if (!$util.isString(message.applicationId))
                            return "applicationId: string expected";
                    if (message.applicationInstanceId != null && message.hasOwnProperty("applicationInstanceId")) {
                        var error = $root.plexus.UniqueId.verify(message.applicationInstanceId);
                        if (error)
                            return "applicationInstanceId." + error;
                    }
                    return null;
                };

                /**
                 * Creates a ConnectRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.ConnectRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.ConnectRequest} ConnectRequest
                 */
                ConnectRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.ConnectRequest)
                        return object;
                    var message = new $root.plexus.interop.protocol.ConnectRequest();
                    if (object.applicationId != null)
                        message.applicationId = String(object.applicationId);
                    if (object.applicationInstanceId != null) {
                        if (typeof object.applicationInstanceId !== "object")
                            throw TypeError(".plexus.interop.protocol.ConnectRequest.applicationInstanceId: object expected");
                        message.applicationInstanceId = $root.plexus.UniqueId.fromObject(object.applicationInstanceId);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ConnectRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.ConnectRequest
                 * @static
                 * @param {plexus.interop.protocol.ConnectRequest} message ConnectRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ConnectRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.applicationId = "";
                        object.applicationInstanceId = null;
                    }
                    if (message.applicationId != null && message.hasOwnProperty("applicationId"))
                        object.applicationId = message.applicationId;
                    if (message.applicationInstanceId != null && message.hasOwnProperty("applicationInstanceId"))
                        object.applicationInstanceId = $root.plexus.UniqueId.toObject(message.applicationInstanceId, options);
                    return object;
                };

                /**
                 * Converts this ConnectRequest to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.ConnectRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ConnectRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return ConnectRequest;
            })();

            protocol.ConnectResponse = (function() {

                /**
                 * Properties of a ConnectResponse.
                 * @memberof plexus.interop.protocol
                 * @interface IConnectResponse
                 * @property {plexus.IUniqueId} [connectionId] ConnectResponse connectionId
                 */

                /**
                 * Constructs a new ConnectResponse.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a ConnectResponse.
                 * @constructor
                 * @param {plexus.interop.protocol.IConnectResponse=} [properties] Properties to set
                 */
                function ConnectResponse(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ConnectResponse connectionId.
                 * @member {(plexus.IUniqueId|null|undefined)}connectionId
                 * @memberof plexus.interop.protocol.ConnectResponse
                 * @instance
                 */
                ConnectResponse.prototype.connectionId = null;

                /**
                 * Creates a new ConnectResponse instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.ConnectResponse
                 * @static
                 * @param {plexus.interop.protocol.IConnectResponse=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.ConnectResponse} ConnectResponse instance
                 */
                ConnectResponse.create = function create(properties) {
                    return new ConnectResponse(properties);
                };

                /**
                 * Encodes the specified ConnectResponse message. Does not implicitly {@link plexus.interop.protocol.ConnectResponse.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.ConnectResponse
                 * @static
                 * @param {plexus.interop.protocol.IConnectResponse} message ConnectResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ConnectResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.connectionId != null && message.hasOwnProperty("connectionId"))
                        $root.plexus.UniqueId.encode(message.connectionId, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ConnectResponse message, length delimited. Does not implicitly {@link plexus.interop.protocol.ConnectResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.ConnectResponse
                 * @static
                 * @param {plexus.interop.protocol.IConnectResponse} message ConnectResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ConnectResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ConnectResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.ConnectResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.ConnectResponse} ConnectResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ConnectResponse.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.ConnectResponse();
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
                 * Decodes a ConnectResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.ConnectResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.ConnectResponse} ConnectResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ConnectResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ConnectResponse message.
                 * @function verify
                 * @memberof plexus.interop.protocol.ConnectResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ConnectResponse.verify = function verify(message) {
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
                 * Creates a ConnectResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.ConnectResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.ConnectResponse} ConnectResponse
                 */
                ConnectResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.ConnectResponse)
                        return object;
                    var message = new $root.plexus.interop.protocol.ConnectResponse();
                    if (object.connectionId != null) {
                        if (typeof object.connectionId !== "object")
                            throw TypeError(".plexus.interop.protocol.ConnectResponse.connectionId: object expected");
                        message.connectionId = $root.plexus.UniqueId.fromObject(object.connectionId);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ConnectResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.ConnectResponse
                 * @static
                 * @param {plexus.interop.protocol.ConnectResponse} message ConnectResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ConnectResponse.toObject = function toObject(message, options) {
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
                 * Converts this ConnectResponse to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.ConnectResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ConnectResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return ConnectResponse;
            })();

            protocol.ClientToBrokerRequestEnvelope = (function() {

                /**
                 * Properties of a ClientToBrokerRequestEnvelope.
                 * @memberof plexus.interop.protocol
                 * @interface IClientToBrokerRequestEnvelope
                 * @property {plexus.interop.protocol.IInvocationStartRequest} [invocationStartRequest] ClientToBrokerRequestEnvelope invocationStartRequest
                 * @property {plexus.interop.protocol.IServiceDiscoveryRequest} [serviceDiscoveryRequest] ClientToBrokerRequestEnvelope serviceDiscoveryRequest
                 * @property {plexus.interop.protocol.IMethodDiscoveryRequest} [methodDiscoveryRequest] ClientToBrokerRequestEnvelope methodDiscoveryRequest
                 */

                /**
                 * Constructs a new ClientToBrokerRequestEnvelope.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a ClientToBrokerRequestEnvelope.
                 * @constructor
                 * @param {plexus.interop.protocol.IClientToBrokerRequestEnvelope=} [properties] Properties to set
                 */
                function ClientToBrokerRequestEnvelope(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ClientToBrokerRequestEnvelope invocationStartRequest.
                 * @member {(plexus.interop.protocol.IInvocationStartRequest|null|undefined)}invocationStartRequest
                 * @memberof plexus.interop.protocol.ClientToBrokerRequestEnvelope
                 * @instance
                 */
                ClientToBrokerRequestEnvelope.prototype.invocationStartRequest = null;

                /**
                 * ClientToBrokerRequestEnvelope serviceDiscoveryRequest.
                 * @member {(plexus.interop.protocol.IServiceDiscoveryRequest|null|undefined)}serviceDiscoveryRequest
                 * @memberof plexus.interop.protocol.ClientToBrokerRequestEnvelope
                 * @instance
                 */
                ClientToBrokerRequestEnvelope.prototype.serviceDiscoveryRequest = null;

                /**
                 * ClientToBrokerRequestEnvelope methodDiscoveryRequest.
                 * @member {(plexus.interop.protocol.IMethodDiscoveryRequest|null|undefined)}methodDiscoveryRequest
                 * @memberof plexus.interop.protocol.ClientToBrokerRequestEnvelope
                 * @instance
                 */
                ClientToBrokerRequestEnvelope.prototype.methodDiscoveryRequest = null;

                // OneOf field names bound to virtual getters and setters
                var $oneOfFields;

                /**
                 * ClientToBrokerRequestEnvelope payload.
                 * @member {string|undefined} payload
                 * @memberof plexus.interop.protocol.ClientToBrokerRequestEnvelope
                 * @instance
                 */
                Object.defineProperty(ClientToBrokerRequestEnvelope.prototype, "payload", {
                    get: $util.oneOfGetter($oneOfFields = ["invocationStartRequest", "serviceDiscoveryRequest", "methodDiscoveryRequest"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new ClientToBrokerRequestEnvelope instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.ClientToBrokerRequestEnvelope
                 * @static
                 * @param {plexus.interop.protocol.IClientToBrokerRequestEnvelope=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.ClientToBrokerRequestEnvelope} ClientToBrokerRequestEnvelope instance
                 */
                ClientToBrokerRequestEnvelope.create = function create(properties) {
                    return new ClientToBrokerRequestEnvelope(properties);
                };

                /**
                 * Encodes the specified ClientToBrokerRequestEnvelope message. Does not implicitly {@link plexus.interop.protocol.ClientToBrokerRequestEnvelope.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.ClientToBrokerRequestEnvelope
                 * @static
                 * @param {plexus.interop.protocol.IClientToBrokerRequestEnvelope} message ClientToBrokerRequestEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ClientToBrokerRequestEnvelope.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.invocationStartRequest != null && message.hasOwnProperty("invocationStartRequest"))
                        $root.plexus.interop.protocol.InvocationStartRequest.encode(message.invocationStartRequest, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.serviceDiscoveryRequest != null && message.hasOwnProperty("serviceDiscoveryRequest"))
                        $root.plexus.interop.protocol.ServiceDiscoveryRequest.encode(message.serviceDiscoveryRequest, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.methodDiscoveryRequest != null && message.hasOwnProperty("methodDiscoveryRequest"))
                        $root.plexus.interop.protocol.MethodDiscoveryRequest.encode(message.methodDiscoveryRequest, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ClientToBrokerRequestEnvelope message, length delimited. Does not implicitly {@link plexus.interop.protocol.ClientToBrokerRequestEnvelope.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.ClientToBrokerRequestEnvelope
                 * @static
                 * @param {plexus.interop.protocol.IClientToBrokerRequestEnvelope} message ClientToBrokerRequestEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ClientToBrokerRequestEnvelope.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ClientToBrokerRequestEnvelope message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.ClientToBrokerRequestEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.ClientToBrokerRequestEnvelope} ClientToBrokerRequestEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ClientToBrokerRequestEnvelope.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.ClientToBrokerRequestEnvelope();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.invocationStartRequest = $root.plexus.interop.protocol.InvocationStartRequest.decode(reader, reader.uint32());
                            break;
                        case 2:
                            message.serviceDiscoveryRequest = $root.plexus.interop.protocol.ServiceDiscoveryRequest.decode(reader, reader.uint32());
                            break;
                        case 3:
                            message.methodDiscoveryRequest = $root.plexus.interop.protocol.MethodDiscoveryRequest.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ClientToBrokerRequestEnvelope message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.ClientToBrokerRequestEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.ClientToBrokerRequestEnvelope} ClientToBrokerRequestEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ClientToBrokerRequestEnvelope.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ClientToBrokerRequestEnvelope message.
                 * @function verify
                 * @memberof plexus.interop.protocol.ClientToBrokerRequestEnvelope
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ClientToBrokerRequestEnvelope.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    var properties = {};
                    if (message.invocationStartRequest != null && message.hasOwnProperty("invocationStartRequest")) {
                        properties.payload = 1;
                        var error = $root.plexus.interop.protocol.InvocationStartRequest.verify(message.invocationStartRequest);
                        if (error)
                            return "invocationStartRequest." + error;
                    }
                    if (message.serviceDiscoveryRequest != null && message.hasOwnProperty("serviceDiscoveryRequest")) {
                        if (properties.payload === 1)
                            return "payload: multiple values";
                        properties.payload = 1;
                        error = $root.plexus.interop.protocol.ServiceDiscoveryRequest.verify(message.serviceDiscoveryRequest);
                        if (error)
                            return "serviceDiscoveryRequest." + error;
                    }
                    if (message.methodDiscoveryRequest != null && message.hasOwnProperty("methodDiscoveryRequest")) {
                        if (properties.payload === 1)
                            return "payload: multiple values";
                        properties.payload = 1;
                        error = $root.plexus.interop.protocol.MethodDiscoveryRequest.verify(message.methodDiscoveryRequest);
                        if (error)
                            return "methodDiscoveryRequest." + error;
                    }
                    return null;
                };

                /**
                 * Creates a ClientToBrokerRequestEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.ClientToBrokerRequestEnvelope
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.ClientToBrokerRequestEnvelope} ClientToBrokerRequestEnvelope
                 */
                ClientToBrokerRequestEnvelope.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.ClientToBrokerRequestEnvelope)
                        return object;
                    var message = new $root.plexus.interop.protocol.ClientToBrokerRequestEnvelope();
                    if (object.invocationStartRequest != null) {
                        if (typeof object.invocationStartRequest !== "object")
                            throw TypeError(".plexus.interop.protocol.ClientToBrokerRequestEnvelope.invocationStartRequest: object expected");
                        message.invocationStartRequest = $root.plexus.interop.protocol.InvocationStartRequest.fromObject(object.invocationStartRequest);
                    }
                    if (object.serviceDiscoveryRequest != null) {
                        if (typeof object.serviceDiscoveryRequest !== "object")
                            throw TypeError(".plexus.interop.protocol.ClientToBrokerRequestEnvelope.serviceDiscoveryRequest: object expected");
                        message.serviceDiscoveryRequest = $root.plexus.interop.protocol.ServiceDiscoveryRequest.fromObject(object.serviceDiscoveryRequest);
                    }
                    if (object.methodDiscoveryRequest != null) {
                        if (typeof object.methodDiscoveryRequest !== "object")
                            throw TypeError(".plexus.interop.protocol.ClientToBrokerRequestEnvelope.methodDiscoveryRequest: object expected");
                        message.methodDiscoveryRequest = $root.plexus.interop.protocol.MethodDiscoveryRequest.fromObject(object.methodDiscoveryRequest);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ClientToBrokerRequestEnvelope message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.ClientToBrokerRequestEnvelope
                 * @static
                 * @param {plexus.interop.protocol.ClientToBrokerRequestEnvelope} message ClientToBrokerRequestEnvelope
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ClientToBrokerRequestEnvelope.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (message.invocationStartRequest != null && message.hasOwnProperty("invocationStartRequest")) {
                        object.invocationStartRequest = $root.plexus.interop.protocol.InvocationStartRequest.toObject(message.invocationStartRequest, options);
                        if (options.oneofs)
                            object.payload = "invocationStartRequest";
                    }
                    if (message.serviceDiscoveryRequest != null && message.hasOwnProperty("serviceDiscoveryRequest")) {
                        object.serviceDiscoveryRequest = $root.plexus.interop.protocol.ServiceDiscoveryRequest.toObject(message.serviceDiscoveryRequest, options);
                        if (options.oneofs)
                            object.payload = "serviceDiscoveryRequest";
                    }
                    if (message.methodDiscoveryRequest != null && message.hasOwnProperty("methodDiscoveryRequest")) {
                        object.methodDiscoveryRequest = $root.plexus.interop.protocol.MethodDiscoveryRequest.toObject(message.methodDiscoveryRequest, options);
                        if (options.oneofs)
                            object.payload = "methodDiscoveryRequest";
                    }
                    return object;
                };

                /**
                 * Converts this ClientToBrokerRequestEnvelope to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.ClientToBrokerRequestEnvelope
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ClientToBrokerRequestEnvelope.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return ClientToBrokerRequestEnvelope;
            })();

            protocol.BrokerToClientRequestEnvelope = (function() {

                /**
                 * Properties of a BrokerToClientRequestEnvelope.
                 * @memberof plexus.interop.protocol
                 * @interface IBrokerToClientRequestEnvelope
                 * @property {plexus.interop.protocol.IInvocationStartRequested} [invocationStartRequested] BrokerToClientRequestEnvelope invocationStartRequested
                 */

                /**
                 * Constructs a new BrokerToClientRequestEnvelope.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a BrokerToClientRequestEnvelope.
                 * @constructor
                 * @param {plexus.interop.protocol.IBrokerToClientRequestEnvelope=} [properties] Properties to set
                 */
                function BrokerToClientRequestEnvelope(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * BrokerToClientRequestEnvelope invocationStartRequested.
                 * @member {(plexus.interop.protocol.IInvocationStartRequested|null|undefined)}invocationStartRequested
                 * @memberof plexus.interop.protocol.BrokerToClientRequestEnvelope
                 * @instance
                 */
                BrokerToClientRequestEnvelope.prototype.invocationStartRequested = null;

                // OneOf field names bound to virtual getters and setters
                var $oneOfFields;

                /**
                 * BrokerToClientRequestEnvelope payload.
                 * @member {string|undefined} payload
                 * @memberof plexus.interop.protocol.BrokerToClientRequestEnvelope
                 * @instance
                 */
                Object.defineProperty(BrokerToClientRequestEnvelope.prototype, "payload", {
                    get: $util.oneOfGetter($oneOfFields = ["invocationStartRequested"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new BrokerToClientRequestEnvelope instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.BrokerToClientRequestEnvelope
                 * @static
                 * @param {plexus.interop.protocol.IBrokerToClientRequestEnvelope=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.BrokerToClientRequestEnvelope} BrokerToClientRequestEnvelope instance
                 */
                BrokerToClientRequestEnvelope.create = function create(properties) {
                    return new BrokerToClientRequestEnvelope(properties);
                };

                /**
                 * Encodes the specified BrokerToClientRequestEnvelope message. Does not implicitly {@link plexus.interop.protocol.BrokerToClientRequestEnvelope.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.BrokerToClientRequestEnvelope
                 * @static
                 * @param {plexus.interop.protocol.IBrokerToClientRequestEnvelope} message BrokerToClientRequestEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                BrokerToClientRequestEnvelope.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.invocationStartRequested != null && message.hasOwnProperty("invocationStartRequested"))
                        $root.plexus.interop.protocol.InvocationStartRequested.encode(message.invocationStartRequested, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified BrokerToClientRequestEnvelope message, length delimited. Does not implicitly {@link plexus.interop.protocol.BrokerToClientRequestEnvelope.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.BrokerToClientRequestEnvelope
                 * @static
                 * @param {plexus.interop.protocol.IBrokerToClientRequestEnvelope} message BrokerToClientRequestEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                BrokerToClientRequestEnvelope.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a BrokerToClientRequestEnvelope message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.BrokerToClientRequestEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.BrokerToClientRequestEnvelope} BrokerToClientRequestEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                BrokerToClientRequestEnvelope.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.BrokerToClientRequestEnvelope();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.invocationStartRequested = $root.plexus.interop.protocol.InvocationStartRequested.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a BrokerToClientRequestEnvelope message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.BrokerToClientRequestEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.BrokerToClientRequestEnvelope} BrokerToClientRequestEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                BrokerToClientRequestEnvelope.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a BrokerToClientRequestEnvelope message.
                 * @function verify
                 * @memberof plexus.interop.protocol.BrokerToClientRequestEnvelope
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                BrokerToClientRequestEnvelope.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    var properties = {};
                    if (message.invocationStartRequested != null && message.hasOwnProperty("invocationStartRequested")) {
                        properties.payload = 1;
                        var error = $root.plexus.interop.protocol.InvocationStartRequested.verify(message.invocationStartRequested);
                        if (error)
                            return "invocationStartRequested." + error;
                    }
                    return null;
                };

                /**
                 * Creates a BrokerToClientRequestEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.BrokerToClientRequestEnvelope
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.BrokerToClientRequestEnvelope} BrokerToClientRequestEnvelope
                 */
                BrokerToClientRequestEnvelope.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.BrokerToClientRequestEnvelope)
                        return object;
                    var message = new $root.plexus.interop.protocol.BrokerToClientRequestEnvelope();
                    if (object.invocationStartRequested != null) {
                        if (typeof object.invocationStartRequested !== "object")
                            throw TypeError(".plexus.interop.protocol.BrokerToClientRequestEnvelope.invocationStartRequested: object expected");
                        message.invocationStartRequested = $root.plexus.interop.protocol.InvocationStartRequested.fromObject(object.invocationStartRequested);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a BrokerToClientRequestEnvelope message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.BrokerToClientRequestEnvelope
                 * @static
                 * @param {plexus.interop.protocol.BrokerToClientRequestEnvelope} message BrokerToClientRequestEnvelope
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                BrokerToClientRequestEnvelope.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (message.invocationStartRequested != null && message.hasOwnProperty("invocationStartRequested")) {
                        object.invocationStartRequested = $root.plexus.interop.protocol.InvocationStartRequested.toObject(message.invocationStartRequested, options);
                        if (options.oneofs)
                            object.payload = "invocationStartRequested";
                    }
                    return object;
                };

                /**
                 * Converts this BrokerToClientRequestEnvelope to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.BrokerToClientRequestEnvelope
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                BrokerToClientRequestEnvelope.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return BrokerToClientRequestEnvelope;
            })();

            protocol.InvocationStartRequest = (function() {

                /**
                 * Properties of an InvocationStartRequest.
                 * @memberof plexus.interop.protocol
                 * @interface IInvocationStartRequest
                 * @property {plexus.interop.protocol.IConsumedMethodReference} [consumedMethod] InvocationStartRequest consumedMethod
                 * @property {plexus.interop.protocol.IProvidedMethodReference} [providedMethod] InvocationStartRequest providedMethod
                 */

                /**
                 * Constructs a new InvocationStartRequest.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents an InvocationStartRequest.
                 * @constructor
                 * @param {plexus.interop.protocol.IInvocationStartRequest=} [properties] Properties to set
                 */
                function InvocationStartRequest(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * InvocationStartRequest consumedMethod.
                 * @member {(plexus.interop.protocol.IConsumedMethodReference|null|undefined)}consumedMethod
                 * @memberof plexus.interop.protocol.InvocationStartRequest
                 * @instance
                 */
                InvocationStartRequest.prototype.consumedMethod = null;

                /**
                 * InvocationStartRequest providedMethod.
                 * @member {(plexus.interop.protocol.IProvidedMethodReference|null|undefined)}providedMethod
                 * @memberof plexus.interop.protocol.InvocationStartRequest
                 * @instance
                 */
                InvocationStartRequest.prototype.providedMethod = null;

                // OneOf field names bound to virtual getters and setters
                var $oneOfFields;

                /**
                 * InvocationStartRequest target.
                 * @member {string|undefined} target
                 * @memberof plexus.interop.protocol.InvocationStartRequest
                 * @instance
                 */
                Object.defineProperty(InvocationStartRequest.prototype, "target", {
                    get: $util.oneOfGetter($oneOfFields = ["consumedMethod", "providedMethod"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new InvocationStartRequest instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.InvocationStartRequest
                 * @static
                 * @param {plexus.interop.protocol.IInvocationStartRequest=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.InvocationStartRequest} InvocationStartRequest instance
                 */
                InvocationStartRequest.create = function create(properties) {
                    return new InvocationStartRequest(properties);
                };

                /**
                 * Encodes the specified InvocationStartRequest message. Does not implicitly {@link plexus.interop.protocol.InvocationStartRequest.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.InvocationStartRequest
                 * @static
                 * @param {plexus.interop.protocol.IInvocationStartRequest} message InvocationStartRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationStartRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.consumedMethod != null && message.hasOwnProperty("consumedMethod"))
                        $root.plexus.interop.protocol.ConsumedMethodReference.encode(message.consumedMethod, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.providedMethod != null && message.hasOwnProperty("providedMethod"))
                        $root.plexus.interop.protocol.ProvidedMethodReference.encode(message.providedMethod, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified InvocationStartRequest message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationStartRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.InvocationStartRequest
                 * @static
                 * @param {plexus.interop.protocol.IInvocationStartRequest} message InvocationStartRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationStartRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InvocationStartRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.InvocationStartRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.InvocationStartRequest} InvocationStartRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationStartRequest.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.InvocationStartRequest();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.consumedMethod = $root.plexus.interop.protocol.ConsumedMethodReference.decode(reader, reader.uint32());
                            break;
                        case 2:
                            message.providedMethod = $root.plexus.interop.protocol.ProvidedMethodReference.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an InvocationStartRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.InvocationStartRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.InvocationStartRequest} InvocationStartRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationStartRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an InvocationStartRequest message.
                 * @function verify
                 * @memberof plexus.interop.protocol.InvocationStartRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                InvocationStartRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    var properties = {};
                    if (message.consumedMethod != null && message.hasOwnProperty("consumedMethod")) {
                        properties.target = 1;
                        var error = $root.plexus.interop.protocol.ConsumedMethodReference.verify(message.consumedMethod);
                        if (error)
                            return "consumedMethod." + error;
                    }
                    if (message.providedMethod != null && message.hasOwnProperty("providedMethod")) {
                        if (properties.target === 1)
                            return "target: multiple values";
                        properties.target = 1;
                        error = $root.plexus.interop.protocol.ProvidedMethodReference.verify(message.providedMethod);
                        if (error)
                            return "providedMethod." + error;
                    }
                    return null;
                };

                /**
                 * Creates an InvocationStartRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.InvocationStartRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.InvocationStartRequest} InvocationStartRequest
                 */
                InvocationStartRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.InvocationStartRequest)
                        return object;
                    var message = new $root.plexus.interop.protocol.InvocationStartRequest();
                    if (object.consumedMethod != null) {
                        if (typeof object.consumedMethod !== "object")
                            throw TypeError(".plexus.interop.protocol.InvocationStartRequest.consumedMethod: object expected");
                        message.consumedMethod = $root.plexus.interop.protocol.ConsumedMethodReference.fromObject(object.consumedMethod);
                    }
                    if (object.providedMethod != null) {
                        if (typeof object.providedMethod !== "object")
                            throw TypeError(".plexus.interop.protocol.InvocationStartRequest.providedMethod: object expected");
                        message.providedMethod = $root.plexus.interop.protocol.ProvidedMethodReference.fromObject(object.providedMethod);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from an InvocationStartRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.InvocationStartRequest
                 * @static
                 * @param {plexus.interop.protocol.InvocationStartRequest} message InvocationStartRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                InvocationStartRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (message.consumedMethod != null && message.hasOwnProperty("consumedMethod")) {
                        object.consumedMethod = $root.plexus.interop.protocol.ConsumedMethodReference.toObject(message.consumedMethod, options);
                        if (options.oneofs)
                            object.target = "consumedMethod";
                    }
                    if (message.providedMethod != null && message.hasOwnProperty("providedMethod")) {
                        object.providedMethod = $root.plexus.interop.protocol.ProvidedMethodReference.toObject(message.providedMethod, options);
                        if (options.oneofs)
                            object.target = "providedMethod";
                    }
                    return object;
                };

                /**
                 * Converts this InvocationStartRequest to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.InvocationStartRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InvocationStartRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return InvocationStartRequest;
            })();

            protocol.InvocationStarting = (function() {

                /**
                 * Properties of an InvocationStarting.
                 * @memberof plexus.interop.protocol
                 * @interface IInvocationStarting
                 */

                /**
                 * Constructs a new InvocationStarting.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents an InvocationStarting.
                 * @constructor
                 * @param {plexus.interop.protocol.IInvocationStarting=} [properties] Properties to set
                 */
                function InvocationStarting(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Creates a new InvocationStarting instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.InvocationStarting
                 * @static
                 * @param {plexus.interop.protocol.IInvocationStarting=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.InvocationStarting} InvocationStarting instance
                 */
                InvocationStarting.create = function create(properties) {
                    return new InvocationStarting(properties);
                };

                /**
                 * Encodes the specified InvocationStarting message. Does not implicitly {@link plexus.interop.protocol.InvocationStarting.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.InvocationStarting
                 * @static
                 * @param {plexus.interop.protocol.IInvocationStarting} message InvocationStarting message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationStarting.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    return writer;
                };

                /**
                 * Encodes the specified InvocationStarting message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationStarting.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.InvocationStarting
                 * @static
                 * @param {plexus.interop.protocol.IInvocationStarting} message InvocationStarting message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationStarting.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InvocationStarting message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.InvocationStarting
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.InvocationStarting} InvocationStarting
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationStarting.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.InvocationStarting();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an InvocationStarting message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.InvocationStarting
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.InvocationStarting} InvocationStarting
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationStarting.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an InvocationStarting message.
                 * @function verify
                 * @memberof plexus.interop.protocol.InvocationStarting
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                InvocationStarting.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    return null;
                };

                /**
                 * Creates an InvocationStarting message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.InvocationStarting
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.InvocationStarting} InvocationStarting
                 */
                InvocationStarting.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.InvocationStarting)
                        return object;
                    return new $root.plexus.interop.protocol.InvocationStarting();
                };

                /**
                 * Creates a plain object from an InvocationStarting message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.InvocationStarting
                 * @static
                 * @param {plexus.interop.protocol.InvocationStarting} message InvocationStarting
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                InvocationStarting.toObject = function toObject() {
                    return {};
                };

                /**
                 * Converts this InvocationStarting to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.InvocationStarting
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InvocationStarting.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return InvocationStarting;
            })();

            protocol.InvocationStartRequested = (function() {

                /**
                 * Properties of an InvocationStartRequested.
                 * @memberof plexus.interop.protocol
                 * @interface IInvocationStartRequested
                 * @property {string} [serviceId] InvocationStartRequested serviceId
                 * @property {string} [serviceAlias] InvocationStartRequested serviceAlias
                 * @property {string} [methodId] InvocationStartRequested methodId
                 * @property {string} [consumerApplicationId] InvocationStartRequested consumerApplicationId
                 * @property {plexus.IUniqueId} [consumerConnectionId] InvocationStartRequested consumerConnectionId
                 */

                /**
                 * Constructs a new InvocationStartRequested.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents an InvocationStartRequested.
                 * @constructor
                 * @param {plexus.interop.protocol.IInvocationStartRequested=} [properties] Properties to set
                 */
                function InvocationStartRequested(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * InvocationStartRequested serviceId.
                 * @member {string}serviceId
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @instance
                 */
                InvocationStartRequested.prototype.serviceId = "";

                /**
                 * InvocationStartRequested serviceAlias.
                 * @member {string}serviceAlias
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @instance
                 */
                InvocationStartRequested.prototype.serviceAlias = "";

                /**
                 * InvocationStartRequested methodId.
                 * @member {string}methodId
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @instance
                 */
                InvocationStartRequested.prototype.methodId = "";

                /**
                 * InvocationStartRequested consumerApplicationId.
                 * @member {string}consumerApplicationId
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @instance
                 */
                InvocationStartRequested.prototype.consumerApplicationId = "";

                /**
                 * InvocationStartRequested consumerConnectionId.
                 * @member {(plexus.IUniqueId|null|undefined)}consumerConnectionId
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @instance
                 */
                InvocationStartRequested.prototype.consumerConnectionId = null;

                /**
                 * Creates a new InvocationStartRequested instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @static
                 * @param {plexus.interop.protocol.IInvocationStartRequested=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.InvocationStartRequested} InvocationStartRequested instance
                 */
                InvocationStartRequested.create = function create(properties) {
                    return new InvocationStartRequested(properties);
                };

                /**
                 * Encodes the specified InvocationStartRequested message. Does not implicitly {@link plexus.interop.protocol.InvocationStartRequested.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @static
                 * @param {plexus.interop.protocol.IInvocationStartRequested} message InvocationStartRequested message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationStartRequested.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.serviceId != null && message.hasOwnProperty("serviceId"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.serviceId);
                    if (message.serviceAlias != null && message.hasOwnProperty("serviceAlias"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.serviceAlias);
                    if (message.methodId != null && message.hasOwnProperty("methodId"))
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.methodId);
                    if (message.consumerApplicationId != null && message.hasOwnProperty("consumerApplicationId"))
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.consumerApplicationId);
                    if (message.consumerConnectionId != null && message.hasOwnProperty("consumerConnectionId"))
                        $root.plexus.UniqueId.encode(message.consumerConnectionId, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified InvocationStartRequested message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationStartRequested.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @static
                 * @param {plexus.interop.protocol.IInvocationStartRequested} message InvocationStartRequested message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationStartRequested.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InvocationStartRequested message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.InvocationStartRequested} InvocationStartRequested
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationStartRequested.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.InvocationStartRequested();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.serviceId = reader.string();
                            break;
                        case 2:
                            message.serviceAlias = reader.string();
                            break;
                        case 3:
                            message.methodId = reader.string();
                            break;
                        case 4:
                            message.consumerApplicationId = reader.string();
                            break;
                        case 5:
                            message.consumerConnectionId = $root.plexus.UniqueId.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an InvocationStartRequested message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.InvocationStartRequested} InvocationStartRequested
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationStartRequested.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an InvocationStartRequested message.
                 * @function verify
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                InvocationStartRequested.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.serviceId != null && message.hasOwnProperty("serviceId"))
                        if (!$util.isString(message.serviceId))
                            return "serviceId: string expected";
                    if (message.serviceAlias != null && message.hasOwnProperty("serviceAlias"))
                        if (!$util.isString(message.serviceAlias))
                            return "serviceAlias: string expected";
                    if (message.methodId != null && message.hasOwnProperty("methodId"))
                        if (!$util.isString(message.methodId))
                            return "methodId: string expected";
                    if (message.consumerApplicationId != null && message.hasOwnProperty("consumerApplicationId"))
                        if (!$util.isString(message.consumerApplicationId))
                            return "consumerApplicationId: string expected";
                    if (message.consumerConnectionId != null && message.hasOwnProperty("consumerConnectionId")) {
                        var error = $root.plexus.UniqueId.verify(message.consumerConnectionId);
                        if (error)
                            return "consumerConnectionId." + error;
                    }
                    return null;
                };

                /**
                 * Creates an InvocationStartRequested message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.InvocationStartRequested} InvocationStartRequested
                 */
                InvocationStartRequested.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.InvocationStartRequested)
                        return object;
                    var message = new $root.plexus.interop.protocol.InvocationStartRequested();
                    if (object.serviceId != null)
                        message.serviceId = String(object.serviceId);
                    if (object.serviceAlias != null)
                        message.serviceAlias = String(object.serviceAlias);
                    if (object.methodId != null)
                        message.methodId = String(object.methodId);
                    if (object.consumerApplicationId != null)
                        message.consumerApplicationId = String(object.consumerApplicationId);
                    if (object.consumerConnectionId != null) {
                        if (typeof object.consumerConnectionId !== "object")
                            throw TypeError(".plexus.interop.protocol.InvocationStartRequested.consumerConnectionId: object expected");
                        message.consumerConnectionId = $root.plexus.UniqueId.fromObject(object.consumerConnectionId);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from an InvocationStartRequested message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @static
                 * @param {plexus.interop.protocol.InvocationStartRequested} message InvocationStartRequested
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                InvocationStartRequested.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.serviceId = "";
                        object.serviceAlias = "";
                        object.methodId = "";
                        object.consumerApplicationId = "";
                        object.consumerConnectionId = null;
                    }
                    if (message.serviceId != null && message.hasOwnProperty("serviceId"))
                        object.serviceId = message.serviceId;
                    if (message.serviceAlias != null && message.hasOwnProperty("serviceAlias"))
                        object.serviceAlias = message.serviceAlias;
                    if (message.methodId != null && message.hasOwnProperty("methodId"))
                        object.methodId = message.methodId;
                    if (message.consumerApplicationId != null && message.hasOwnProperty("consumerApplicationId"))
                        object.consumerApplicationId = message.consumerApplicationId;
                    if (message.consumerConnectionId != null && message.hasOwnProperty("consumerConnectionId"))
                        object.consumerConnectionId = $root.plexus.UniqueId.toObject(message.consumerConnectionId, options);
                    return object;
                };

                /**
                 * Converts this InvocationStartRequested to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.InvocationStartRequested
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InvocationStartRequested.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return InvocationStartRequested;
            })();

            protocol.InvocationStarted = (function() {

                /**
                 * Properties of an InvocationStarted.
                 * @memberof plexus.interop.protocol
                 * @interface IInvocationStarted
                 */

                /**
                 * Constructs a new InvocationStarted.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents an InvocationStarted.
                 * @constructor
                 * @param {plexus.interop.protocol.IInvocationStarted=} [properties] Properties to set
                 */
                function InvocationStarted(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Creates a new InvocationStarted instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.InvocationStarted
                 * @static
                 * @param {plexus.interop.protocol.IInvocationStarted=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.InvocationStarted} InvocationStarted instance
                 */
                InvocationStarted.create = function create(properties) {
                    return new InvocationStarted(properties);
                };

                /**
                 * Encodes the specified InvocationStarted message. Does not implicitly {@link plexus.interop.protocol.InvocationStarted.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.InvocationStarted
                 * @static
                 * @param {plexus.interop.protocol.IInvocationStarted} message InvocationStarted message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationStarted.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    return writer;
                };

                /**
                 * Encodes the specified InvocationStarted message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationStarted.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.InvocationStarted
                 * @static
                 * @param {plexus.interop.protocol.IInvocationStarted} message InvocationStarted message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationStarted.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InvocationStarted message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.InvocationStarted
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.InvocationStarted} InvocationStarted
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationStarted.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.InvocationStarted();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an InvocationStarted message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.InvocationStarted
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.InvocationStarted} InvocationStarted
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationStarted.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an InvocationStarted message.
                 * @function verify
                 * @memberof plexus.interop.protocol.InvocationStarted
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                InvocationStarted.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    return null;
                };

                /**
                 * Creates an InvocationStarted message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.InvocationStarted
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.InvocationStarted} InvocationStarted
                 */
                InvocationStarted.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.InvocationStarted)
                        return object;
                    return new $root.plexus.interop.protocol.InvocationStarted();
                };

                /**
                 * Creates a plain object from an InvocationStarted message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.InvocationStarted
                 * @static
                 * @param {plexus.interop.protocol.InvocationStarted} message InvocationStarted
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                InvocationStarted.toObject = function toObject() {
                    return {};
                };

                /**
                 * Converts this InvocationStarted to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.InvocationStarted
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InvocationStarted.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return InvocationStarted;
            })();

            protocol.InvocationMessageHeader = (function() {

                /**
                 * Properties of an InvocationMessageHeader.
                 * @memberof plexus.interop.protocol
                 * @interface IInvocationMessageHeader
                 */

                /**
                 * Constructs a new InvocationMessageHeader.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents an InvocationMessageHeader.
                 * @constructor
                 * @param {plexus.interop.protocol.IInvocationMessageHeader=} [properties] Properties to set
                 */
                function InvocationMessageHeader(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Creates a new InvocationMessageHeader instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.InvocationMessageHeader
                 * @static
                 * @param {plexus.interop.protocol.IInvocationMessageHeader=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.InvocationMessageHeader} InvocationMessageHeader instance
                 */
                InvocationMessageHeader.create = function create(properties) {
                    return new InvocationMessageHeader(properties);
                };

                /**
                 * Encodes the specified InvocationMessageHeader message. Does not implicitly {@link plexus.interop.protocol.InvocationMessageHeader.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.InvocationMessageHeader
                 * @static
                 * @param {plexus.interop.protocol.IInvocationMessageHeader} message InvocationMessageHeader message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationMessageHeader.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    return writer;
                };

                /**
                 * Encodes the specified InvocationMessageHeader message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationMessageHeader.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.InvocationMessageHeader
                 * @static
                 * @param {plexus.interop.protocol.IInvocationMessageHeader} message InvocationMessageHeader message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationMessageHeader.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InvocationMessageHeader message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.InvocationMessageHeader
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.InvocationMessageHeader} InvocationMessageHeader
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationMessageHeader.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.InvocationMessageHeader();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an InvocationMessageHeader message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.InvocationMessageHeader
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.InvocationMessageHeader} InvocationMessageHeader
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationMessageHeader.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an InvocationMessageHeader message.
                 * @function verify
                 * @memberof plexus.interop.protocol.InvocationMessageHeader
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                InvocationMessageHeader.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    return null;
                };

                /**
                 * Creates an InvocationMessageHeader message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.InvocationMessageHeader
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.InvocationMessageHeader} InvocationMessageHeader
                 */
                InvocationMessageHeader.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.InvocationMessageHeader)
                        return object;
                    return new $root.plexus.interop.protocol.InvocationMessageHeader();
                };

                /**
                 * Creates a plain object from an InvocationMessageHeader message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.InvocationMessageHeader
                 * @static
                 * @param {plexus.interop.protocol.InvocationMessageHeader} message InvocationMessageHeader
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                InvocationMessageHeader.toObject = function toObject() {
                    return {};
                };

                /**
                 * Converts this InvocationMessageHeader to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.InvocationMessageHeader
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InvocationMessageHeader.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return InvocationMessageHeader;
            })();

            protocol.InvocationMessageReceived = (function() {

                /**
                 * Properties of an InvocationMessageReceived.
                 * @memberof plexus.interop.protocol
                 * @interface IInvocationMessageReceived
                 */

                /**
                 * Constructs a new InvocationMessageReceived.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents an InvocationMessageReceived.
                 * @constructor
                 * @param {plexus.interop.protocol.IInvocationMessageReceived=} [properties] Properties to set
                 */
                function InvocationMessageReceived(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Creates a new InvocationMessageReceived instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.InvocationMessageReceived
                 * @static
                 * @param {plexus.interop.protocol.IInvocationMessageReceived=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.InvocationMessageReceived} InvocationMessageReceived instance
                 */
                InvocationMessageReceived.create = function create(properties) {
                    return new InvocationMessageReceived(properties);
                };

                /**
                 * Encodes the specified InvocationMessageReceived message. Does not implicitly {@link plexus.interop.protocol.InvocationMessageReceived.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.InvocationMessageReceived
                 * @static
                 * @param {plexus.interop.protocol.IInvocationMessageReceived} message InvocationMessageReceived message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationMessageReceived.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    return writer;
                };

                /**
                 * Encodes the specified InvocationMessageReceived message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationMessageReceived.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.InvocationMessageReceived
                 * @static
                 * @param {plexus.interop.protocol.IInvocationMessageReceived} message InvocationMessageReceived message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationMessageReceived.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InvocationMessageReceived message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.InvocationMessageReceived
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.InvocationMessageReceived} InvocationMessageReceived
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationMessageReceived.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.InvocationMessageReceived();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an InvocationMessageReceived message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.InvocationMessageReceived
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.InvocationMessageReceived} InvocationMessageReceived
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationMessageReceived.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an InvocationMessageReceived message.
                 * @function verify
                 * @memberof plexus.interop.protocol.InvocationMessageReceived
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                InvocationMessageReceived.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    return null;
                };

                /**
                 * Creates an InvocationMessageReceived message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.InvocationMessageReceived
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.InvocationMessageReceived} InvocationMessageReceived
                 */
                InvocationMessageReceived.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.InvocationMessageReceived)
                        return object;
                    return new $root.plexus.interop.protocol.InvocationMessageReceived();
                };

                /**
                 * Creates a plain object from an InvocationMessageReceived message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.InvocationMessageReceived
                 * @static
                 * @param {plexus.interop.protocol.InvocationMessageReceived} message InvocationMessageReceived
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                InvocationMessageReceived.toObject = function toObject() {
                    return {};
                };

                /**
                 * Converts this InvocationMessageReceived to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.InvocationMessageReceived
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InvocationMessageReceived.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return InvocationMessageReceived;
            })();

            protocol.InvocationSendCompletion = (function() {

                /**
                 * Properties of an InvocationSendCompletion.
                 * @memberof plexus.interop.protocol
                 * @interface IInvocationSendCompletion
                 */

                /**
                 * Constructs a new InvocationSendCompletion.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents an InvocationSendCompletion.
                 * @constructor
                 * @param {plexus.interop.protocol.IInvocationSendCompletion=} [properties] Properties to set
                 */
                function InvocationSendCompletion(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Creates a new InvocationSendCompletion instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.InvocationSendCompletion
                 * @static
                 * @param {plexus.interop.protocol.IInvocationSendCompletion=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.InvocationSendCompletion} InvocationSendCompletion instance
                 */
                InvocationSendCompletion.create = function create(properties) {
                    return new InvocationSendCompletion(properties);
                };

                /**
                 * Encodes the specified InvocationSendCompletion message. Does not implicitly {@link plexus.interop.protocol.InvocationSendCompletion.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.InvocationSendCompletion
                 * @static
                 * @param {plexus.interop.protocol.IInvocationSendCompletion} message InvocationSendCompletion message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationSendCompletion.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    return writer;
                };

                /**
                 * Encodes the specified InvocationSendCompletion message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationSendCompletion.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.InvocationSendCompletion
                 * @static
                 * @param {plexus.interop.protocol.IInvocationSendCompletion} message InvocationSendCompletion message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationSendCompletion.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InvocationSendCompletion message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.InvocationSendCompletion
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.InvocationSendCompletion} InvocationSendCompletion
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationSendCompletion.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.InvocationSendCompletion();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an InvocationSendCompletion message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.InvocationSendCompletion
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.InvocationSendCompletion} InvocationSendCompletion
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationSendCompletion.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an InvocationSendCompletion message.
                 * @function verify
                 * @memberof plexus.interop.protocol.InvocationSendCompletion
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                InvocationSendCompletion.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    return null;
                };

                /**
                 * Creates an InvocationSendCompletion message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.InvocationSendCompletion
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.InvocationSendCompletion} InvocationSendCompletion
                 */
                InvocationSendCompletion.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.InvocationSendCompletion)
                        return object;
                    return new $root.plexus.interop.protocol.InvocationSendCompletion();
                };

                /**
                 * Creates a plain object from an InvocationSendCompletion message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.InvocationSendCompletion
                 * @static
                 * @param {plexus.interop.protocol.InvocationSendCompletion} message InvocationSendCompletion
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                InvocationSendCompletion.toObject = function toObject() {
                    return {};
                };

                /**
                 * Converts this InvocationSendCompletion to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.InvocationSendCompletion
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InvocationSendCompletion.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return InvocationSendCompletion;
            })();

            protocol.InvocationMessageEnvelope = (function() {

                /**
                 * Properties of an InvocationMessageEnvelope.
                 * @memberof plexus.interop.protocol
                 * @interface IInvocationMessageEnvelope
                 * @property {plexus.interop.protocol.IInvocationMessageHeader} [message] InvocationMessageEnvelope message
                 * @property {plexus.interop.protocol.IInvocationMessageReceived} [confirmation] InvocationMessageEnvelope confirmation
                 * @property {plexus.interop.protocol.IInvocationSendCompletion} [sendCompletion] InvocationMessageEnvelope sendCompletion
                 */

                /**
                 * Constructs a new InvocationMessageEnvelope.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents an InvocationMessageEnvelope.
                 * @constructor
                 * @param {plexus.interop.protocol.IInvocationMessageEnvelope=} [properties] Properties to set
                 */
                function InvocationMessageEnvelope(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * InvocationMessageEnvelope message.
                 * @member {(plexus.interop.protocol.IInvocationMessageHeader|null|undefined)}message
                 * @memberof plexus.interop.protocol.InvocationMessageEnvelope
                 * @instance
                 */
                InvocationMessageEnvelope.prototype.message = null;

                /**
                 * InvocationMessageEnvelope confirmation.
                 * @member {(plexus.interop.protocol.IInvocationMessageReceived|null|undefined)}confirmation
                 * @memberof plexus.interop.protocol.InvocationMessageEnvelope
                 * @instance
                 */
                InvocationMessageEnvelope.prototype.confirmation = null;

                /**
                 * InvocationMessageEnvelope sendCompletion.
                 * @member {(plexus.interop.protocol.IInvocationSendCompletion|null|undefined)}sendCompletion
                 * @memberof plexus.interop.protocol.InvocationMessageEnvelope
                 * @instance
                 */
                InvocationMessageEnvelope.prototype.sendCompletion = null;

                // OneOf field names bound to virtual getters and setters
                var $oneOfFields;

                /**
                 * InvocationMessageEnvelope payload.
                 * @member {string|undefined} payload
                 * @memberof plexus.interop.protocol.InvocationMessageEnvelope
                 * @instance
                 */
                Object.defineProperty(InvocationMessageEnvelope.prototype, "payload", {
                    get: $util.oneOfGetter($oneOfFields = ["message", "confirmation", "sendCompletion"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new InvocationMessageEnvelope instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.InvocationMessageEnvelope
                 * @static
                 * @param {plexus.interop.protocol.IInvocationMessageEnvelope=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.InvocationMessageEnvelope} InvocationMessageEnvelope instance
                 */
                InvocationMessageEnvelope.create = function create(properties) {
                    return new InvocationMessageEnvelope(properties);
                };

                /**
                 * Encodes the specified InvocationMessageEnvelope message. Does not implicitly {@link plexus.interop.protocol.InvocationMessageEnvelope.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.InvocationMessageEnvelope
                 * @static
                 * @param {plexus.interop.protocol.IInvocationMessageEnvelope} message InvocationMessageEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationMessageEnvelope.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.message != null && message.hasOwnProperty("message"))
                        $root.plexus.interop.protocol.InvocationMessageHeader.encode(message.message, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.confirmation != null && message.hasOwnProperty("confirmation"))
                        $root.plexus.interop.protocol.InvocationMessageReceived.encode(message.confirmation, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.sendCompletion != null && message.hasOwnProperty("sendCompletion"))
                        $root.plexus.interop.protocol.InvocationSendCompletion.encode(message.sendCompletion, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified InvocationMessageEnvelope message, length delimited. Does not implicitly {@link plexus.interop.protocol.InvocationMessageEnvelope.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.InvocationMessageEnvelope
                 * @static
                 * @param {plexus.interop.protocol.IInvocationMessageEnvelope} message InvocationMessageEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InvocationMessageEnvelope.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InvocationMessageEnvelope message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.InvocationMessageEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.InvocationMessageEnvelope} InvocationMessageEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationMessageEnvelope.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.InvocationMessageEnvelope();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.message = $root.plexus.interop.protocol.InvocationMessageHeader.decode(reader, reader.uint32());
                            break;
                        case 2:
                            message.confirmation = $root.plexus.interop.protocol.InvocationMessageReceived.decode(reader, reader.uint32());
                            break;
                        case 3:
                            message.sendCompletion = $root.plexus.interop.protocol.InvocationSendCompletion.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an InvocationMessageEnvelope message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.InvocationMessageEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.InvocationMessageEnvelope} InvocationMessageEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InvocationMessageEnvelope.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an InvocationMessageEnvelope message.
                 * @function verify
                 * @memberof plexus.interop.protocol.InvocationMessageEnvelope
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                InvocationMessageEnvelope.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    var properties = {};
                    if (message.message != null && message.hasOwnProperty("message")) {
                        properties.payload = 1;
                        var error = $root.plexus.interop.protocol.InvocationMessageHeader.verify(message.message);
                        if (error)
                            return "message." + error;
                    }
                    if (message.confirmation != null && message.hasOwnProperty("confirmation")) {
                        if (properties.payload === 1)
                            return "payload: multiple values";
                        properties.payload = 1;
                        error = $root.plexus.interop.protocol.InvocationMessageReceived.verify(message.confirmation);
                        if (error)
                            return "confirmation." + error;
                    }
                    if (message.sendCompletion != null && message.hasOwnProperty("sendCompletion")) {
                        if (properties.payload === 1)
                            return "payload: multiple values";
                        properties.payload = 1;
                        error = $root.plexus.interop.protocol.InvocationSendCompletion.verify(message.sendCompletion);
                        if (error)
                            return "sendCompletion." + error;
                    }
                    return null;
                };

                /**
                 * Creates an InvocationMessageEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.InvocationMessageEnvelope
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.InvocationMessageEnvelope} InvocationMessageEnvelope
                 */
                InvocationMessageEnvelope.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.InvocationMessageEnvelope)
                        return object;
                    var message = new $root.plexus.interop.protocol.InvocationMessageEnvelope();
                    if (object.message != null) {
                        if (typeof object.message !== "object")
                            throw TypeError(".plexus.interop.protocol.InvocationMessageEnvelope.message: object expected");
                        message.message = $root.plexus.interop.protocol.InvocationMessageHeader.fromObject(object.message);
                    }
                    if (object.confirmation != null) {
                        if (typeof object.confirmation !== "object")
                            throw TypeError(".plexus.interop.protocol.InvocationMessageEnvelope.confirmation: object expected");
                        message.confirmation = $root.plexus.interop.protocol.InvocationMessageReceived.fromObject(object.confirmation);
                    }
                    if (object.sendCompletion != null) {
                        if (typeof object.sendCompletion !== "object")
                            throw TypeError(".plexus.interop.protocol.InvocationMessageEnvelope.sendCompletion: object expected");
                        message.sendCompletion = $root.plexus.interop.protocol.InvocationSendCompletion.fromObject(object.sendCompletion);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from an InvocationMessageEnvelope message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.InvocationMessageEnvelope
                 * @static
                 * @param {plexus.interop.protocol.InvocationMessageEnvelope} message InvocationMessageEnvelope
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                InvocationMessageEnvelope.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (message.message != null && message.hasOwnProperty("message")) {
                        object.message = $root.plexus.interop.protocol.InvocationMessageHeader.toObject(message.message, options);
                        if (options.oneofs)
                            object.payload = "message";
                    }
                    if (message.confirmation != null && message.hasOwnProperty("confirmation")) {
                        object.confirmation = $root.plexus.interop.protocol.InvocationMessageReceived.toObject(message.confirmation, options);
                        if (options.oneofs)
                            object.payload = "confirmation";
                    }
                    if (message.sendCompletion != null && message.hasOwnProperty("sendCompletion")) {
                        object.sendCompletion = $root.plexus.interop.protocol.InvocationSendCompletion.toObject(message.sendCompletion, options);
                        if (options.oneofs)
                            object.payload = "sendCompletion";
                    }
                    return object;
                };

                /**
                 * Converts this InvocationMessageEnvelope to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.InvocationMessageEnvelope
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InvocationMessageEnvelope.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return InvocationMessageEnvelope;
            })();

            /**
             * DiscoveryMode enum.
             * @enum {string}
             * @property {number} Offline=0 Offline value
             * @property {number} Online=1 Online value
             */
            protocol.DiscoveryMode = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "Offline"] = 0;
                values[valuesById[1] = "Online"] = 1;
                return values;
            })();

            /**
             * MethodType enum.
             * @enum {string}
             * @property {number} Unary=0 Unary value
             * @property {number} ServerStreaming=1 ServerStreaming value
             * @property {number} ClientStreaming=2 ClientStreaming value
             * @property {number} DuplexStreaming=3 DuplexStreaming value
             */
            protocol.MethodType = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "Unary"] = 0;
                values[valuesById[1] = "ServerStreaming"] = 1;
                values[valuesById[2] = "ClientStreaming"] = 2;
                values[valuesById[3] = "DuplexStreaming"] = 3;
                return values;
            })();

            protocol.ServiceDiscoveryRequest = (function() {

                /**
                 * Properties of a ServiceDiscoveryRequest.
                 * @memberof plexus.interop.protocol
                 * @interface IServiceDiscoveryRequest
                 * @property {plexus.interop.protocol.IConsumedServiceReference} [consumedService] ServiceDiscoveryRequest consumedService
                 * @property {plexus.interop.protocol.DiscoveryMode} [discoveryMode] ServiceDiscoveryRequest discoveryMode
                 */

                /**
                 * Constructs a new ServiceDiscoveryRequest.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a ServiceDiscoveryRequest.
                 * @constructor
                 * @param {plexus.interop.protocol.IServiceDiscoveryRequest=} [properties] Properties to set
                 */
                function ServiceDiscoveryRequest(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ServiceDiscoveryRequest consumedService.
                 * @member {(plexus.interop.protocol.IConsumedServiceReference|null|undefined)}consumedService
                 * @memberof plexus.interop.protocol.ServiceDiscoveryRequest
                 * @instance
                 */
                ServiceDiscoveryRequest.prototype.consumedService = null;

                /**
                 * ServiceDiscoveryRequest discoveryMode.
                 * @member {plexus.interop.protocol.DiscoveryMode}discoveryMode
                 * @memberof plexus.interop.protocol.ServiceDiscoveryRequest
                 * @instance
                 */
                ServiceDiscoveryRequest.prototype.discoveryMode = 0;

                /**
                 * Creates a new ServiceDiscoveryRequest instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.ServiceDiscoveryRequest
                 * @static
                 * @param {plexus.interop.protocol.IServiceDiscoveryRequest=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.ServiceDiscoveryRequest} ServiceDiscoveryRequest instance
                 */
                ServiceDiscoveryRequest.create = function create(properties) {
                    return new ServiceDiscoveryRequest(properties);
                };

                /**
                 * Encodes the specified ServiceDiscoveryRequest message. Does not implicitly {@link plexus.interop.protocol.ServiceDiscoveryRequest.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.ServiceDiscoveryRequest
                 * @static
                 * @param {plexus.interop.protocol.IServiceDiscoveryRequest} message ServiceDiscoveryRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ServiceDiscoveryRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.consumedService != null && message.hasOwnProperty("consumedService"))
                        $root.plexus.interop.protocol.ConsumedServiceReference.encode(message.consumedService, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.discoveryMode != null && message.hasOwnProperty("discoveryMode"))
                        writer.uint32(/* id 2, wireType 0 =*/16).int32(message.discoveryMode);
                    return writer;
                };

                /**
                 * Encodes the specified ServiceDiscoveryRequest message, length delimited. Does not implicitly {@link plexus.interop.protocol.ServiceDiscoveryRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.ServiceDiscoveryRequest
                 * @static
                 * @param {plexus.interop.protocol.IServiceDiscoveryRequest} message ServiceDiscoveryRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ServiceDiscoveryRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ServiceDiscoveryRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.ServiceDiscoveryRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.ServiceDiscoveryRequest} ServiceDiscoveryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ServiceDiscoveryRequest.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.ServiceDiscoveryRequest();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.consumedService = $root.plexus.interop.protocol.ConsumedServiceReference.decode(reader, reader.uint32());
                            break;
                        case 2:
                            message.discoveryMode = reader.int32();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ServiceDiscoveryRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.ServiceDiscoveryRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.ServiceDiscoveryRequest} ServiceDiscoveryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ServiceDiscoveryRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ServiceDiscoveryRequest message.
                 * @function verify
                 * @memberof plexus.interop.protocol.ServiceDiscoveryRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ServiceDiscoveryRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.consumedService != null && message.hasOwnProperty("consumedService")) {
                        var error = $root.plexus.interop.protocol.ConsumedServiceReference.verify(message.consumedService);
                        if (error)
                            return "consumedService." + error;
                    }
                    if (message.discoveryMode != null && message.hasOwnProperty("discoveryMode"))
                        switch (message.discoveryMode) {
                        default:
                            return "discoveryMode: enum value expected";
                        case 0:
                        case 1:
                            break;
                        }
                    return null;
                };

                /**
                 * Creates a ServiceDiscoveryRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.ServiceDiscoveryRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.ServiceDiscoveryRequest} ServiceDiscoveryRequest
                 */
                ServiceDiscoveryRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.ServiceDiscoveryRequest)
                        return object;
                    var message = new $root.plexus.interop.protocol.ServiceDiscoveryRequest();
                    if (object.consumedService != null) {
                        if (typeof object.consumedService !== "object")
                            throw TypeError(".plexus.interop.protocol.ServiceDiscoveryRequest.consumedService: object expected");
                        message.consumedService = $root.plexus.interop.protocol.ConsumedServiceReference.fromObject(object.consumedService);
                    }
                    switch (object.discoveryMode) {
                    case "Offline":
                    case 0:
                        message.discoveryMode = 0;
                        break;
                    case "Online":
                    case 1:
                        message.discoveryMode = 1;
                        break;
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ServiceDiscoveryRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.ServiceDiscoveryRequest
                 * @static
                 * @param {plexus.interop.protocol.ServiceDiscoveryRequest} message ServiceDiscoveryRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ServiceDiscoveryRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.consumedService = null;
                        object.discoveryMode = options.enums === String ? "Offline" : 0;
                    }
                    if (message.consumedService != null && message.hasOwnProperty("consumedService"))
                        object.consumedService = $root.plexus.interop.protocol.ConsumedServiceReference.toObject(message.consumedService, options);
                    if (message.discoveryMode != null && message.hasOwnProperty("discoveryMode"))
                        object.discoveryMode = options.enums === String ? $root.plexus.interop.protocol.DiscoveryMode[message.discoveryMode] : message.discoveryMode;
                    return object;
                };

                /**
                 * Converts this ServiceDiscoveryRequest to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.ServiceDiscoveryRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ServiceDiscoveryRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return ServiceDiscoveryRequest;
            })();

            protocol.ServiceDiscoveryResponse = (function() {

                /**
                 * Properties of a ServiceDiscoveryResponse.
                 * @memberof plexus.interop.protocol
                 * @interface IServiceDiscoveryResponse
                 * @property {Array.<plexus.interop.protocol.IDiscoveredService>} [services] ServiceDiscoveryResponse services
                 */

                /**
                 * Constructs a new ServiceDiscoveryResponse.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a ServiceDiscoveryResponse.
                 * @constructor
                 * @param {plexus.interop.protocol.IServiceDiscoveryResponse=} [properties] Properties to set
                 */
                function ServiceDiscoveryResponse(properties) {
                    this.services = [];
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ServiceDiscoveryResponse services.
                 * @member {Array.<plexus.interop.protocol.IDiscoveredService>}services
                 * @memberof plexus.interop.protocol.ServiceDiscoveryResponse
                 * @instance
                 */
                ServiceDiscoveryResponse.prototype.services = $util.emptyArray;

                /**
                 * Creates a new ServiceDiscoveryResponse instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.ServiceDiscoveryResponse
                 * @static
                 * @param {plexus.interop.protocol.IServiceDiscoveryResponse=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.ServiceDiscoveryResponse} ServiceDiscoveryResponse instance
                 */
                ServiceDiscoveryResponse.create = function create(properties) {
                    return new ServiceDiscoveryResponse(properties);
                };

                /**
                 * Encodes the specified ServiceDiscoveryResponse message. Does not implicitly {@link plexus.interop.protocol.ServiceDiscoveryResponse.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.ServiceDiscoveryResponse
                 * @static
                 * @param {plexus.interop.protocol.IServiceDiscoveryResponse} message ServiceDiscoveryResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ServiceDiscoveryResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.services != null && message.services.length)
                        for (var i = 0; i < message.services.length; ++i)
                            $root.plexus.interop.protocol.DiscoveredService.encode(message.services[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ServiceDiscoveryResponse message, length delimited. Does not implicitly {@link plexus.interop.protocol.ServiceDiscoveryResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.ServiceDiscoveryResponse
                 * @static
                 * @param {plexus.interop.protocol.IServiceDiscoveryResponse} message ServiceDiscoveryResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ServiceDiscoveryResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ServiceDiscoveryResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.ServiceDiscoveryResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.ServiceDiscoveryResponse} ServiceDiscoveryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ServiceDiscoveryResponse.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.ServiceDiscoveryResponse();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            if (!(message.services && message.services.length))
                                message.services = [];
                            message.services.push($root.plexus.interop.protocol.DiscoveredService.decode(reader, reader.uint32()));
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ServiceDiscoveryResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.ServiceDiscoveryResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.ServiceDiscoveryResponse} ServiceDiscoveryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ServiceDiscoveryResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ServiceDiscoveryResponse message.
                 * @function verify
                 * @memberof plexus.interop.protocol.ServiceDiscoveryResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ServiceDiscoveryResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.services != null && message.hasOwnProperty("services")) {
                        if (!Array.isArray(message.services))
                            return "services: array expected";
                        for (var i = 0; i < message.services.length; ++i) {
                            var error = $root.plexus.interop.protocol.DiscoveredService.verify(message.services[i]);
                            if (error)
                                return "services." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a ServiceDiscoveryResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.ServiceDiscoveryResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.ServiceDiscoveryResponse} ServiceDiscoveryResponse
                 */
                ServiceDiscoveryResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.ServiceDiscoveryResponse)
                        return object;
                    var message = new $root.plexus.interop.protocol.ServiceDiscoveryResponse();
                    if (object.services) {
                        if (!Array.isArray(object.services))
                            throw TypeError(".plexus.interop.protocol.ServiceDiscoveryResponse.services: array expected");
                        message.services = [];
                        for (var i = 0; i < object.services.length; ++i) {
                            if (typeof object.services[i] !== "object")
                                throw TypeError(".plexus.interop.protocol.ServiceDiscoveryResponse.services: object expected");
                            message.services[i] = $root.plexus.interop.protocol.DiscoveredService.fromObject(object.services[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ServiceDiscoveryResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.ServiceDiscoveryResponse
                 * @static
                 * @param {plexus.interop.protocol.ServiceDiscoveryResponse} message ServiceDiscoveryResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ServiceDiscoveryResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.arrays || options.defaults)
                        object.services = [];
                    if (message.services && message.services.length) {
                        object.services = [];
                        for (var j = 0; j < message.services.length; ++j)
                            object.services[j] = $root.plexus.interop.protocol.DiscoveredService.toObject(message.services[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this ServiceDiscoveryResponse to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.ServiceDiscoveryResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ServiceDiscoveryResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return ServiceDiscoveryResponse;
            })();

            protocol.DiscoveredService = (function() {

                /**
                 * Properties of a DiscoveredService.
                 * @memberof plexus.interop.protocol
                 * @interface IDiscoveredService
                 * @property {plexus.interop.protocol.IConsumedServiceReference} [consumedService] DiscoveredService consumedService
                 * @property {plexus.interop.protocol.IProvidedServiceReference} [providedService] DiscoveredService providedService
                 * @property {string} [serviceTitle] DiscoveredService serviceTitle
                 * @property {Array.<plexus.interop.protocol.IDiscoveredServiceMethod>} [methods] DiscoveredService methods
                 */

                /**
                 * Constructs a new DiscoveredService.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a DiscoveredService.
                 * @constructor
                 * @param {plexus.interop.protocol.IDiscoveredService=} [properties] Properties to set
                 */
                function DiscoveredService(properties) {
                    this.methods = [];
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * DiscoveredService consumedService.
                 * @member {(plexus.interop.protocol.IConsumedServiceReference|null|undefined)}consumedService
                 * @memberof plexus.interop.protocol.DiscoveredService
                 * @instance
                 */
                DiscoveredService.prototype.consumedService = null;

                /**
                 * DiscoveredService providedService.
                 * @member {(plexus.interop.protocol.IProvidedServiceReference|null|undefined)}providedService
                 * @memberof plexus.interop.protocol.DiscoveredService
                 * @instance
                 */
                DiscoveredService.prototype.providedService = null;

                /**
                 * DiscoveredService serviceTitle.
                 * @member {string}serviceTitle
                 * @memberof plexus.interop.protocol.DiscoveredService
                 * @instance
                 */
                DiscoveredService.prototype.serviceTitle = "";

                /**
                 * DiscoveredService methods.
                 * @member {Array.<plexus.interop.protocol.IDiscoveredServiceMethod>}methods
                 * @memberof plexus.interop.protocol.DiscoveredService
                 * @instance
                 */
                DiscoveredService.prototype.methods = $util.emptyArray;

                /**
                 * Creates a new DiscoveredService instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.DiscoveredService
                 * @static
                 * @param {plexus.interop.protocol.IDiscoveredService=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.DiscoveredService} DiscoveredService instance
                 */
                DiscoveredService.create = function create(properties) {
                    return new DiscoveredService(properties);
                };

                /**
                 * Encodes the specified DiscoveredService message. Does not implicitly {@link plexus.interop.protocol.DiscoveredService.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.DiscoveredService
                 * @static
                 * @param {plexus.interop.protocol.IDiscoveredService} message DiscoveredService message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DiscoveredService.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.consumedService != null && message.hasOwnProperty("consumedService"))
                        $root.plexus.interop.protocol.ConsumedServiceReference.encode(message.consumedService, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.providedService != null && message.hasOwnProperty("providedService"))
                        $root.plexus.interop.protocol.ProvidedServiceReference.encode(message.providedService, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.serviceTitle != null && message.hasOwnProperty("serviceTitle"))
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.serviceTitle);
                    if (message.methods != null && message.methods.length)
                        for (var i = 0; i < message.methods.length; ++i)
                            $root.plexus.interop.protocol.DiscoveredServiceMethod.encode(message.methods[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified DiscoveredService message, length delimited. Does not implicitly {@link plexus.interop.protocol.DiscoveredService.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.DiscoveredService
                 * @static
                 * @param {plexus.interop.protocol.IDiscoveredService} message DiscoveredService message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DiscoveredService.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a DiscoveredService message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.DiscoveredService
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.DiscoveredService} DiscoveredService
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DiscoveredService.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.DiscoveredService();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.consumedService = $root.plexus.interop.protocol.ConsumedServiceReference.decode(reader, reader.uint32());
                            break;
                        case 2:
                            message.providedService = $root.plexus.interop.protocol.ProvidedServiceReference.decode(reader, reader.uint32());
                            break;
                        case 3:
                            message.serviceTitle = reader.string();
                            break;
                        case 4:
                            if (!(message.methods && message.methods.length))
                                message.methods = [];
                            message.methods.push($root.plexus.interop.protocol.DiscoveredServiceMethod.decode(reader, reader.uint32()));
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a DiscoveredService message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.DiscoveredService
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.DiscoveredService} DiscoveredService
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DiscoveredService.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a DiscoveredService message.
                 * @function verify
                 * @memberof plexus.interop.protocol.DiscoveredService
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                DiscoveredService.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.consumedService != null && message.hasOwnProperty("consumedService")) {
                        var error = $root.plexus.interop.protocol.ConsumedServiceReference.verify(message.consumedService);
                        if (error)
                            return "consumedService." + error;
                    }
                    if (message.providedService != null && message.hasOwnProperty("providedService")) {
                        error = $root.plexus.interop.protocol.ProvidedServiceReference.verify(message.providedService);
                        if (error)
                            return "providedService." + error;
                    }
                    if (message.serviceTitle != null && message.hasOwnProperty("serviceTitle"))
                        if (!$util.isString(message.serviceTitle))
                            return "serviceTitle: string expected";
                    if (message.methods != null && message.hasOwnProperty("methods")) {
                        if (!Array.isArray(message.methods))
                            return "methods: array expected";
                        for (var i = 0; i < message.methods.length; ++i) {
                            error = $root.plexus.interop.protocol.DiscoveredServiceMethod.verify(message.methods[i]);
                            if (error)
                                return "methods." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a DiscoveredService message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.DiscoveredService
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.DiscoveredService} DiscoveredService
                 */
                DiscoveredService.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.DiscoveredService)
                        return object;
                    var message = new $root.plexus.interop.protocol.DiscoveredService();
                    if (object.consumedService != null) {
                        if (typeof object.consumedService !== "object")
                            throw TypeError(".plexus.interop.protocol.DiscoveredService.consumedService: object expected");
                        message.consumedService = $root.plexus.interop.protocol.ConsumedServiceReference.fromObject(object.consumedService);
                    }
                    if (object.providedService != null) {
                        if (typeof object.providedService !== "object")
                            throw TypeError(".plexus.interop.protocol.DiscoveredService.providedService: object expected");
                        message.providedService = $root.plexus.interop.protocol.ProvidedServiceReference.fromObject(object.providedService);
                    }
                    if (object.serviceTitle != null)
                        message.serviceTitle = String(object.serviceTitle);
                    if (object.methods) {
                        if (!Array.isArray(object.methods))
                            throw TypeError(".plexus.interop.protocol.DiscoveredService.methods: array expected");
                        message.methods = [];
                        for (var i = 0; i < object.methods.length; ++i) {
                            if (typeof object.methods[i] !== "object")
                                throw TypeError(".plexus.interop.protocol.DiscoveredService.methods: object expected");
                            message.methods[i] = $root.plexus.interop.protocol.DiscoveredServiceMethod.fromObject(object.methods[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a DiscoveredService message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.DiscoveredService
                 * @static
                 * @param {plexus.interop.protocol.DiscoveredService} message DiscoveredService
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                DiscoveredService.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.arrays || options.defaults)
                        object.methods = [];
                    if (options.defaults) {
                        object.consumedService = null;
                        object.providedService = null;
                        object.serviceTitle = "";
                    }
                    if (message.consumedService != null && message.hasOwnProperty("consumedService"))
                        object.consumedService = $root.plexus.interop.protocol.ConsumedServiceReference.toObject(message.consumedService, options);
                    if (message.providedService != null && message.hasOwnProperty("providedService"))
                        object.providedService = $root.plexus.interop.protocol.ProvidedServiceReference.toObject(message.providedService, options);
                    if (message.serviceTitle != null && message.hasOwnProperty("serviceTitle"))
                        object.serviceTitle = message.serviceTitle;
                    if (message.methods && message.methods.length) {
                        object.methods = [];
                        for (var j = 0; j < message.methods.length; ++j)
                            object.methods[j] = $root.plexus.interop.protocol.DiscoveredServiceMethod.toObject(message.methods[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this DiscoveredService to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.DiscoveredService
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                DiscoveredService.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return DiscoveredService;
            })();

            protocol.DiscoveredServiceMethod = (function() {

                /**
                 * Properties of a DiscoveredServiceMethod.
                 * @memberof plexus.interop.protocol
                 * @interface IDiscoveredServiceMethod
                 * @property {string} [methodId] DiscoveredServiceMethod methodId
                 * @property {string} [methodTitle] DiscoveredServiceMethod methodTitle
                 * @property {string} [inputMessageId] DiscoveredServiceMethod inputMessageId
                 * @property {string} [outputMessageId] DiscoveredServiceMethod outputMessageId
                 * @property {plexus.interop.protocol.MethodType} [methodType] DiscoveredServiceMethod methodType
                 */

                /**
                 * Constructs a new DiscoveredServiceMethod.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a DiscoveredServiceMethod.
                 * @constructor
                 * @param {plexus.interop.protocol.IDiscoveredServiceMethod=} [properties] Properties to set
                 */
                function DiscoveredServiceMethod(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * DiscoveredServiceMethod methodId.
                 * @member {string}methodId
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @instance
                 */
                DiscoveredServiceMethod.prototype.methodId = "";

                /**
                 * DiscoveredServiceMethod methodTitle.
                 * @member {string}methodTitle
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @instance
                 */
                DiscoveredServiceMethod.prototype.methodTitle = "";

                /**
                 * DiscoveredServiceMethod inputMessageId.
                 * @member {string}inputMessageId
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @instance
                 */
                DiscoveredServiceMethod.prototype.inputMessageId = "";

                /**
                 * DiscoveredServiceMethod outputMessageId.
                 * @member {string}outputMessageId
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @instance
                 */
                DiscoveredServiceMethod.prototype.outputMessageId = "";

                /**
                 * DiscoveredServiceMethod methodType.
                 * @member {plexus.interop.protocol.MethodType}methodType
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @instance
                 */
                DiscoveredServiceMethod.prototype.methodType = 0;

                /**
                 * Creates a new DiscoveredServiceMethod instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @static
                 * @param {plexus.interop.protocol.IDiscoveredServiceMethod=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.DiscoveredServiceMethod} DiscoveredServiceMethod instance
                 */
                DiscoveredServiceMethod.create = function create(properties) {
                    return new DiscoveredServiceMethod(properties);
                };

                /**
                 * Encodes the specified DiscoveredServiceMethod message. Does not implicitly {@link plexus.interop.protocol.DiscoveredServiceMethod.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @static
                 * @param {plexus.interop.protocol.IDiscoveredServiceMethod} message DiscoveredServiceMethod message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DiscoveredServiceMethod.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.methodId != null && message.hasOwnProperty("methodId"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.methodId);
                    if (message.methodTitle != null && message.hasOwnProperty("methodTitle"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.methodTitle);
                    if (message.inputMessageId != null && message.hasOwnProperty("inputMessageId"))
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.inputMessageId);
                    if (message.outputMessageId != null && message.hasOwnProperty("outputMessageId"))
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.outputMessageId);
                    if (message.methodType != null && message.hasOwnProperty("methodType"))
                        writer.uint32(/* id 5, wireType 0 =*/40).int32(message.methodType);
                    return writer;
                };

                /**
                 * Encodes the specified DiscoveredServiceMethod message, length delimited. Does not implicitly {@link plexus.interop.protocol.DiscoveredServiceMethod.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @static
                 * @param {plexus.interop.protocol.IDiscoveredServiceMethod} message DiscoveredServiceMethod message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DiscoveredServiceMethod.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a DiscoveredServiceMethod message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.DiscoveredServiceMethod} DiscoveredServiceMethod
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DiscoveredServiceMethod.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.DiscoveredServiceMethod();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.methodId = reader.string();
                            break;
                        case 2:
                            message.methodTitle = reader.string();
                            break;
                        case 3:
                            message.inputMessageId = reader.string();
                            break;
                        case 4:
                            message.outputMessageId = reader.string();
                            break;
                        case 5:
                            message.methodType = reader.int32();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a DiscoveredServiceMethod message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.DiscoveredServiceMethod} DiscoveredServiceMethod
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DiscoveredServiceMethod.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a DiscoveredServiceMethod message.
                 * @function verify
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                DiscoveredServiceMethod.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.methodId != null && message.hasOwnProperty("methodId"))
                        if (!$util.isString(message.methodId))
                            return "methodId: string expected";
                    if (message.methodTitle != null && message.hasOwnProperty("methodTitle"))
                        if (!$util.isString(message.methodTitle))
                            return "methodTitle: string expected";
                    if (message.inputMessageId != null && message.hasOwnProperty("inputMessageId"))
                        if (!$util.isString(message.inputMessageId))
                            return "inputMessageId: string expected";
                    if (message.outputMessageId != null && message.hasOwnProperty("outputMessageId"))
                        if (!$util.isString(message.outputMessageId))
                            return "outputMessageId: string expected";
                    if (message.methodType != null && message.hasOwnProperty("methodType"))
                        switch (message.methodType) {
                        default:
                            return "methodType: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                            break;
                        }
                    return null;
                };

                /**
                 * Creates a DiscoveredServiceMethod message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.DiscoveredServiceMethod} DiscoveredServiceMethod
                 */
                DiscoveredServiceMethod.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.DiscoveredServiceMethod)
                        return object;
                    var message = new $root.plexus.interop.protocol.DiscoveredServiceMethod();
                    if (object.methodId != null)
                        message.methodId = String(object.methodId);
                    if (object.methodTitle != null)
                        message.methodTitle = String(object.methodTitle);
                    if (object.inputMessageId != null)
                        message.inputMessageId = String(object.inputMessageId);
                    if (object.outputMessageId != null)
                        message.outputMessageId = String(object.outputMessageId);
                    switch (object.methodType) {
                    case "Unary":
                    case 0:
                        message.methodType = 0;
                        break;
                    case "ServerStreaming":
                    case 1:
                        message.methodType = 1;
                        break;
                    case "ClientStreaming":
                    case 2:
                        message.methodType = 2;
                        break;
                    case "DuplexStreaming":
                    case 3:
                        message.methodType = 3;
                        break;
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a DiscoveredServiceMethod message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @static
                 * @param {plexus.interop.protocol.DiscoveredServiceMethod} message DiscoveredServiceMethod
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                DiscoveredServiceMethod.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.methodId = "";
                        object.methodTitle = "";
                        object.inputMessageId = "";
                        object.outputMessageId = "";
                        object.methodType = options.enums === String ? "Unary" : 0;
                    }
                    if (message.methodId != null && message.hasOwnProperty("methodId"))
                        object.methodId = message.methodId;
                    if (message.methodTitle != null && message.hasOwnProperty("methodTitle"))
                        object.methodTitle = message.methodTitle;
                    if (message.inputMessageId != null && message.hasOwnProperty("inputMessageId"))
                        object.inputMessageId = message.inputMessageId;
                    if (message.outputMessageId != null && message.hasOwnProperty("outputMessageId"))
                        object.outputMessageId = message.outputMessageId;
                    if (message.methodType != null && message.hasOwnProperty("methodType"))
                        object.methodType = options.enums === String ? $root.plexus.interop.protocol.MethodType[message.methodType] : message.methodType;
                    return object;
                };

                /**
                 * Converts this DiscoveredServiceMethod to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.DiscoveredServiceMethod
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                DiscoveredServiceMethod.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return DiscoveredServiceMethod;
            })();

            protocol.MethodDiscoveryRequest = (function() {

                /**
                 * Properties of a MethodDiscoveryRequest.
                 * @memberof plexus.interop.protocol
                 * @interface IMethodDiscoveryRequest
                 * @property {string} [inputMessageId] MethodDiscoveryRequest inputMessageId
                 * @property {string} [outputMessageId] MethodDiscoveryRequest outputMessageId
                 * @property {plexus.interop.protocol.IConsumedMethodReference} [consumedMethod] MethodDiscoveryRequest consumedMethod
                 * @property {plexus.interop.protocol.DiscoveryMode} [discoveryMode] MethodDiscoveryRequest discoveryMode
                 */

                /**
                 * Constructs a new MethodDiscoveryRequest.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a MethodDiscoveryRequest.
                 * @constructor
                 * @param {plexus.interop.protocol.IMethodDiscoveryRequest=} [properties] Properties to set
                 */
                function MethodDiscoveryRequest(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * MethodDiscoveryRequest inputMessageId.
                 * @member {string}inputMessageId
                 * @memberof plexus.interop.protocol.MethodDiscoveryRequest
                 * @instance
                 */
                MethodDiscoveryRequest.prototype.inputMessageId = "";

                /**
                 * MethodDiscoveryRequest outputMessageId.
                 * @member {string}outputMessageId
                 * @memberof plexus.interop.protocol.MethodDiscoveryRequest
                 * @instance
                 */
                MethodDiscoveryRequest.prototype.outputMessageId = "";

                /**
                 * MethodDiscoveryRequest consumedMethod.
                 * @member {(plexus.interop.protocol.IConsumedMethodReference|null|undefined)}consumedMethod
                 * @memberof plexus.interop.protocol.MethodDiscoveryRequest
                 * @instance
                 */
                MethodDiscoveryRequest.prototype.consumedMethod = null;

                /**
                 * MethodDiscoveryRequest discoveryMode.
                 * @member {plexus.interop.protocol.DiscoveryMode}discoveryMode
                 * @memberof plexus.interop.protocol.MethodDiscoveryRequest
                 * @instance
                 */
                MethodDiscoveryRequest.prototype.discoveryMode = 0;

                /**
                 * Creates a new MethodDiscoveryRequest instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.MethodDiscoveryRequest
                 * @static
                 * @param {plexus.interop.protocol.IMethodDiscoveryRequest=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.MethodDiscoveryRequest} MethodDiscoveryRequest instance
                 */
                MethodDiscoveryRequest.create = function create(properties) {
                    return new MethodDiscoveryRequest(properties);
                };

                /**
                 * Encodes the specified MethodDiscoveryRequest message. Does not implicitly {@link plexus.interop.protocol.MethodDiscoveryRequest.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.MethodDiscoveryRequest
                 * @static
                 * @param {plexus.interop.protocol.IMethodDiscoveryRequest} message MethodDiscoveryRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MethodDiscoveryRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.inputMessageId != null && message.hasOwnProperty("inputMessageId"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.inputMessageId);
                    if (message.outputMessageId != null && message.hasOwnProperty("outputMessageId"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.outputMessageId);
                    if (message.consumedMethod != null && message.hasOwnProperty("consumedMethod"))
                        $root.plexus.interop.protocol.ConsumedMethodReference.encode(message.consumedMethod, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.discoveryMode != null && message.hasOwnProperty("discoveryMode"))
                        writer.uint32(/* id 4, wireType 0 =*/32).int32(message.discoveryMode);
                    return writer;
                };

                /**
                 * Encodes the specified MethodDiscoveryRequest message, length delimited. Does not implicitly {@link plexus.interop.protocol.MethodDiscoveryRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.MethodDiscoveryRequest
                 * @static
                 * @param {plexus.interop.protocol.IMethodDiscoveryRequest} message MethodDiscoveryRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MethodDiscoveryRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a MethodDiscoveryRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.MethodDiscoveryRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.MethodDiscoveryRequest} MethodDiscoveryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MethodDiscoveryRequest.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.MethodDiscoveryRequest();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.inputMessageId = reader.string();
                            break;
                        case 2:
                            message.outputMessageId = reader.string();
                            break;
                        case 3:
                            message.consumedMethod = $root.plexus.interop.protocol.ConsumedMethodReference.decode(reader, reader.uint32());
                            break;
                        case 4:
                            message.discoveryMode = reader.int32();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a MethodDiscoveryRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.MethodDiscoveryRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.MethodDiscoveryRequest} MethodDiscoveryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MethodDiscoveryRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a MethodDiscoveryRequest message.
                 * @function verify
                 * @memberof plexus.interop.protocol.MethodDiscoveryRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                MethodDiscoveryRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.inputMessageId != null && message.hasOwnProperty("inputMessageId"))
                        if (!$util.isString(message.inputMessageId))
                            return "inputMessageId: string expected";
                    if (message.outputMessageId != null && message.hasOwnProperty("outputMessageId"))
                        if (!$util.isString(message.outputMessageId))
                            return "outputMessageId: string expected";
                    if (message.consumedMethod != null && message.hasOwnProperty("consumedMethod")) {
                        var error = $root.plexus.interop.protocol.ConsumedMethodReference.verify(message.consumedMethod);
                        if (error)
                            return "consumedMethod." + error;
                    }
                    if (message.discoveryMode != null && message.hasOwnProperty("discoveryMode"))
                        switch (message.discoveryMode) {
                        default:
                            return "discoveryMode: enum value expected";
                        case 0:
                        case 1:
                            break;
                        }
                    return null;
                };

                /**
                 * Creates a MethodDiscoveryRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.MethodDiscoveryRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.MethodDiscoveryRequest} MethodDiscoveryRequest
                 */
                MethodDiscoveryRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.MethodDiscoveryRequest)
                        return object;
                    var message = new $root.plexus.interop.protocol.MethodDiscoveryRequest();
                    if (object.inputMessageId != null)
                        message.inputMessageId = String(object.inputMessageId);
                    if (object.outputMessageId != null)
                        message.outputMessageId = String(object.outputMessageId);
                    if (object.consumedMethod != null) {
                        if (typeof object.consumedMethod !== "object")
                            throw TypeError(".plexus.interop.protocol.MethodDiscoveryRequest.consumedMethod: object expected");
                        message.consumedMethod = $root.plexus.interop.protocol.ConsumedMethodReference.fromObject(object.consumedMethod);
                    }
                    switch (object.discoveryMode) {
                    case "Offline":
                    case 0:
                        message.discoveryMode = 0;
                        break;
                    case "Online":
                    case 1:
                        message.discoveryMode = 1;
                        break;
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a MethodDiscoveryRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.MethodDiscoveryRequest
                 * @static
                 * @param {plexus.interop.protocol.MethodDiscoveryRequest} message MethodDiscoveryRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                MethodDiscoveryRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.inputMessageId = "";
                        object.outputMessageId = "";
                        object.consumedMethod = null;
                        object.discoveryMode = options.enums === String ? "Offline" : 0;
                    }
                    if (message.inputMessageId != null && message.hasOwnProperty("inputMessageId"))
                        object.inputMessageId = message.inputMessageId;
                    if (message.outputMessageId != null && message.hasOwnProperty("outputMessageId"))
                        object.outputMessageId = message.outputMessageId;
                    if (message.consumedMethod != null && message.hasOwnProperty("consumedMethod"))
                        object.consumedMethod = $root.plexus.interop.protocol.ConsumedMethodReference.toObject(message.consumedMethod, options);
                    if (message.discoveryMode != null && message.hasOwnProperty("discoveryMode"))
                        object.discoveryMode = options.enums === String ? $root.plexus.interop.protocol.DiscoveryMode[message.discoveryMode] : message.discoveryMode;
                    return object;
                };

                /**
                 * Converts this MethodDiscoveryRequest to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.MethodDiscoveryRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                MethodDiscoveryRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return MethodDiscoveryRequest;
            })();

            protocol.MethodDiscoveryResponse = (function() {

                /**
                 * Properties of a MethodDiscoveryResponse.
                 * @memberof plexus.interop.protocol
                 * @interface IMethodDiscoveryResponse
                 * @property {Array.<plexus.interop.protocol.IDiscoveredMethod>} [methods] MethodDiscoveryResponse methods
                 */

                /**
                 * Constructs a new MethodDiscoveryResponse.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a MethodDiscoveryResponse.
                 * @constructor
                 * @param {plexus.interop.protocol.IMethodDiscoveryResponse=} [properties] Properties to set
                 */
                function MethodDiscoveryResponse(properties) {
                    this.methods = [];
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * MethodDiscoveryResponse methods.
                 * @member {Array.<plexus.interop.protocol.IDiscoveredMethod>}methods
                 * @memberof plexus.interop.protocol.MethodDiscoveryResponse
                 * @instance
                 */
                MethodDiscoveryResponse.prototype.methods = $util.emptyArray;

                /**
                 * Creates a new MethodDiscoveryResponse instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.MethodDiscoveryResponse
                 * @static
                 * @param {plexus.interop.protocol.IMethodDiscoveryResponse=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.MethodDiscoveryResponse} MethodDiscoveryResponse instance
                 */
                MethodDiscoveryResponse.create = function create(properties) {
                    return new MethodDiscoveryResponse(properties);
                };

                /**
                 * Encodes the specified MethodDiscoveryResponse message. Does not implicitly {@link plexus.interop.protocol.MethodDiscoveryResponse.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.MethodDiscoveryResponse
                 * @static
                 * @param {plexus.interop.protocol.IMethodDiscoveryResponse} message MethodDiscoveryResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MethodDiscoveryResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.methods != null && message.methods.length)
                        for (var i = 0; i < message.methods.length; ++i)
                            $root.plexus.interop.protocol.DiscoveredMethod.encode(message.methods[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified MethodDiscoveryResponse message, length delimited. Does not implicitly {@link plexus.interop.protocol.MethodDiscoveryResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.MethodDiscoveryResponse
                 * @static
                 * @param {plexus.interop.protocol.IMethodDiscoveryResponse} message MethodDiscoveryResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MethodDiscoveryResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a MethodDiscoveryResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.MethodDiscoveryResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.MethodDiscoveryResponse} MethodDiscoveryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MethodDiscoveryResponse.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.MethodDiscoveryResponse();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            if (!(message.methods && message.methods.length))
                                message.methods = [];
                            message.methods.push($root.plexus.interop.protocol.DiscoveredMethod.decode(reader, reader.uint32()));
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a MethodDiscoveryResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.MethodDiscoveryResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.MethodDiscoveryResponse} MethodDiscoveryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MethodDiscoveryResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a MethodDiscoveryResponse message.
                 * @function verify
                 * @memberof plexus.interop.protocol.MethodDiscoveryResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                MethodDiscoveryResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.methods != null && message.hasOwnProperty("methods")) {
                        if (!Array.isArray(message.methods))
                            return "methods: array expected";
                        for (var i = 0; i < message.methods.length; ++i) {
                            var error = $root.plexus.interop.protocol.DiscoveredMethod.verify(message.methods[i]);
                            if (error)
                                return "methods." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a MethodDiscoveryResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.MethodDiscoveryResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.MethodDiscoveryResponse} MethodDiscoveryResponse
                 */
                MethodDiscoveryResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.MethodDiscoveryResponse)
                        return object;
                    var message = new $root.plexus.interop.protocol.MethodDiscoveryResponse();
                    if (object.methods) {
                        if (!Array.isArray(object.methods))
                            throw TypeError(".plexus.interop.protocol.MethodDiscoveryResponse.methods: array expected");
                        message.methods = [];
                        for (var i = 0; i < object.methods.length; ++i) {
                            if (typeof object.methods[i] !== "object")
                                throw TypeError(".plexus.interop.protocol.MethodDiscoveryResponse.methods: object expected");
                            message.methods[i] = $root.plexus.interop.protocol.DiscoveredMethod.fromObject(object.methods[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a MethodDiscoveryResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.MethodDiscoveryResponse
                 * @static
                 * @param {plexus.interop.protocol.MethodDiscoveryResponse} message MethodDiscoveryResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                MethodDiscoveryResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.arrays || options.defaults)
                        object.methods = [];
                    if (message.methods && message.methods.length) {
                        object.methods = [];
                        for (var j = 0; j < message.methods.length; ++j)
                            object.methods[j] = $root.plexus.interop.protocol.DiscoveredMethod.toObject(message.methods[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this MethodDiscoveryResponse to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.MethodDiscoveryResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                MethodDiscoveryResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return MethodDiscoveryResponse;
            })();

            protocol.DiscoveredMethod = (function() {

                /**
                 * Properties of a DiscoveredMethod.
                 * @memberof plexus.interop.protocol
                 * @interface IDiscoveredMethod
                 * @property {plexus.interop.protocol.IProvidedMethodReference} [providedMethod] DiscoveredMethod providedMethod
                 * @property {string} [methodTitle] DiscoveredMethod methodTitle
                 * @property {string} [inputMessageId] DiscoveredMethod inputMessageId
                 * @property {string} [outputMessageId] DiscoveredMethod outputMessageId
                 * @property {plexus.interop.protocol.MethodType} [methodType] DiscoveredMethod methodType
                 */

                /**
                 * Constructs a new DiscoveredMethod.
                 * @memberof plexus.interop.protocol
                 * @classdesc Represents a DiscoveredMethod.
                 * @constructor
                 * @param {plexus.interop.protocol.IDiscoveredMethod=} [properties] Properties to set
                 */
                function DiscoveredMethod(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * DiscoveredMethod providedMethod.
                 * @member {(plexus.interop.protocol.IProvidedMethodReference|null|undefined)}providedMethod
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @instance
                 */
                DiscoveredMethod.prototype.providedMethod = null;

                /**
                 * DiscoveredMethod methodTitle.
                 * @member {string}methodTitle
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @instance
                 */
                DiscoveredMethod.prototype.methodTitle = "";

                /**
                 * DiscoveredMethod inputMessageId.
                 * @member {string}inputMessageId
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @instance
                 */
                DiscoveredMethod.prototype.inputMessageId = "";

                /**
                 * DiscoveredMethod outputMessageId.
                 * @member {string}outputMessageId
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @instance
                 */
                DiscoveredMethod.prototype.outputMessageId = "";

                /**
                 * DiscoveredMethod methodType.
                 * @member {plexus.interop.protocol.MethodType}methodType
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @instance
                 */
                DiscoveredMethod.prototype.methodType = 0;

                /**
                 * Creates a new DiscoveredMethod instance using the specified properties.
                 * @function create
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @static
                 * @param {plexus.interop.protocol.IDiscoveredMethod=} [properties] Properties to set
                 * @returns {plexus.interop.protocol.DiscoveredMethod} DiscoveredMethod instance
                 */
                DiscoveredMethod.create = function create(properties) {
                    return new DiscoveredMethod(properties);
                };

                /**
                 * Encodes the specified DiscoveredMethod message. Does not implicitly {@link plexus.interop.protocol.DiscoveredMethod.verify|verify} messages.
                 * @function encode
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @static
                 * @param {plexus.interop.protocol.IDiscoveredMethod} message DiscoveredMethod message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DiscoveredMethod.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.providedMethod != null && message.hasOwnProperty("providedMethod"))
                        $root.plexus.interop.protocol.ProvidedMethodReference.encode(message.providedMethod, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.methodTitle != null && message.hasOwnProperty("methodTitle"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.methodTitle);
                    if (message.inputMessageId != null && message.hasOwnProperty("inputMessageId"))
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.inputMessageId);
                    if (message.outputMessageId != null && message.hasOwnProperty("outputMessageId"))
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.outputMessageId);
                    if (message.methodType != null && message.hasOwnProperty("methodType"))
                        writer.uint32(/* id 5, wireType 0 =*/40).int32(message.methodType);
                    return writer;
                };

                /**
                 * Encodes the specified DiscoveredMethod message, length delimited. Does not implicitly {@link plexus.interop.protocol.DiscoveredMethod.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @static
                 * @param {plexus.interop.protocol.IDiscoveredMethod} message DiscoveredMethod message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DiscoveredMethod.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a DiscoveredMethod message from the specified reader or buffer.
                 * @function decode
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {plexus.interop.protocol.DiscoveredMethod} DiscoveredMethod
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DiscoveredMethod.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.plexus.interop.protocol.DiscoveredMethod();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.providedMethod = $root.plexus.interop.protocol.ProvidedMethodReference.decode(reader, reader.uint32());
                            break;
                        case 2:
                            message.methodTitle = reader.string();
                            break;
                        case 3:
                            message.inputMessageId = reader.string();
                            break;
                        case 4:
                            message.outputMessageId = reader.string();
                            break;
                        case 5:
                            message.methodType = reader.int32();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a DiscoveredMethod message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {plexus.interop.protocol.DiscoveredMethod} DiscoveredMethod
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DiscoveredMethod.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a DiscoveredMethod message.
                 * @function verify
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                DiscoveredMethod.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.providedMethod != null && message.hasOwnProperty("providedMethod")) {
                        var error = $root.plexus.interop.protocol.ProvidedMethodReference.verify(message.providedMethod);
                        if (error)
                            return "providedMethod." + error;
                    }
                    if (message.methodTitle != null && message.hasOwnProperty("methodTitle"))
                        if (!$util.isString(message.methodTitle))
                            return "methodTitle: string expected";
                    if (message.inputMessageId != null && message.hasOwnProperty("inputMessageId"))
                        if (!$util.isString(message.inputMessageId))
                            return "inputMessageId: string expected";
                    if (message.outputMessageId != null && message.hasOwnProperty("outputMessageId"))
                        if (!$util.isString(message.outputMessageId))
                            return "outputMessageId: string expected";
                    if (message.methodType != null && message.hasOwnProperty("methodType"))
                        switch (message.methodType) {
                        default:
                            return "methodType: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                            break;
                        }
                    return null;
                };

                /**
                 * Creates a DiscoveredMethod message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {plexus.interop.protocol.DiscoveredMethod} DiscoveredMethod
                 */
                DiscoveredMethod.fromObject = function fromObject(object) {
                    if (object instanceof $root.plexus.interop.protocol.DiscoveredMethod)
                        return object;
                    var message = new $root.plexus.interop.protocol.DiscoveredMethod();
                    if (object.providedMethod != null) {
                        if (typeof object.providedMethod !== "object")
                            throw TypeError(".plexus.interop.protocol.DiscoveredMethod.providedMethod: object expected");
                        message.providedMethod = $root.plexus.interop.protocol.ProvidedMethodReference.fromObject(object.providedMethod);
                    }
                    if (object.methodTitle != null)
                        message.methodTitle = String(object.methodTitle);
                    if (object.inputMessageId != null)
                        message.inputMessageId = String(object.inputMessageId);
                    if (object.outputMessageId != null)
                        message.outputMessageId = String(object.outputMessageId);
                    switch (object.methodType) {
                    case "Unary":
                    case 0:
                        message.methodType = 0;
                        break;
                    case "ServerStreaming":
                    case 1:
                        message.methodType = 1;
                        break;
                    case "ClientStreaming":
                    case 2:
                        message.methodType = 2;
                        break;
                    case "DuplexStreaming":
                    case 3:
                        message.methodType = 3;
                        break;
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a DiscoveredMethod message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @static
                 * @param {plexus.interop.protocol.DiscoveredMethod} message DiscoveredMethod
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                DiscoveredMethod.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.providedMethod = null;
                        object.methodTitle = "";
                        object.inputMessageId = "";
                        object.outputMessageId = "";
                        object.methodType = options.enums === String ? "Unary" : 0;
                    }
                    if (message.providedMethod != null && message.hasOwnProperty("providedMethod"))
                        object.providedMethod = $root.plexus.interop.protocol.ProvidedMethodReference.toObject(message.providedMethod, options);
                    if (message.methodTitle != null && message.hasOwnProperty("methodTitle"))
                        object.methodTitle = message.methodTitle;
                    if (message.inputMessageId != null && message.hasOwnProperty("inputMessageId"))
                        object.inputMessageId = message.inputMessageId;
                    if (message.outputMessageId != null && message.hasOwnProperty("outputMessageId"))
                        object.outputMessageId = message.outputMessageId;
                    if (message.methodType != null && message.hasOwnProperty("methodType"))
                        object.methodType = options.enums === String ? $root.plexus.interop.protocol.MethodType[message.methodType] : message.methodType;
                    return object;
                };

                /**
                 * Converts this DiscoveredMethod to JSON.
                 * @function toJSON
                 * @memberof plexus.interop.protocol.DiscoveredMethod
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                DiscoveredMethod.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return DiscoveredMethod;
            })();

            return protocol;
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
