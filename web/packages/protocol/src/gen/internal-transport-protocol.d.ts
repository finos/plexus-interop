import * as $protobuf from "protobufjs";

/** Namespace plexus. */
export namespace plexus {

    /** Namespace interop. */
    namespace interop {

        /** Namespace transport. */
        namespace transport {

            /** Namespace protocol. */
            namespace protocol {

                /** Properties of a MessageFrameHeader. */
                interface IMessageFrameHeader {

                    /** MessageFrameHeader channelId */
                    channelId?: plexus.IUniqueId;

                    /** MessageFrameHeader length */
                    length?: number;

                    /** MessageFrameHeader hasMore */
                    hasMore?: boolean;
                }

                /** Represents a MessageFrameHeader. */
                class MessageFrameHeader {

                    /**
                     * Constructs a new MessageFrameHeader.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: plexus.interop.transport.protocol.IMessageFrameHeader);

                    /** MessageFrameHeader channelId. */
                    public channelId?: (plexus.IUniqueId|null);

                    /** MessageFrameHeader length. */
                    public length: number;

                    /** MessageFrameHeader hasMore. */
                    public hasMore: boolean;

                    /**
                     * Creates a new MessageFrameHeader instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns MessageFrameHeader instance
                     */
                    public static create(properties?: plexus.interop.transport.protocol.IMessageFrameHeader): plexus.interop.transport.protocol.MessageFrameHeader;

                    /**
                     * Encodes the specified MessageFrameHeader message. Does not implicitly {@link plexus.interop.transport.protocol.MessageFrameHeader.verify|verify} messages.
                     * @param message MessageFrameHeader message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: plexus.interop.transport.protocol.IMessageFrameHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified MessageFrameHeader message, length delimited. Does not implicitly {@link plexus.interop.transport.protocol.MessageFrameHeader.verify|verify} messages.
                     * @param message MessageFrameHeader message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: plexus.interop.transport.protocol.IMessageFrameHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a MessageFrameHeader message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns MessageFrameHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.transport.protocol.MessageFrameHeader;

                    /**
                     * Decodes a MessageFrameHeader message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns MessageFrameHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.transport.protocol.MessageFrameHeader;

                    /**
                     * Verifies a MessageFrameHeader message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a MessageFrameHeader message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns MessageFrameHeader
                     */
                    public static fromObject(object: { [k: string]: any }): plexus.interop.transport.protocol.MessageFrameHeader;

                    /**
                     * Creates a plain object from a MessageFrameHeader message. Also converts values to other types if specified.
                     * @param message MessageFrameHeader
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: plexus.interop.transport.protocol.MessageFrameHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this MessageFrameHeader to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a ConnectionOpenHeader. */
                interface IConnectionOpenHeader {

                    /** ConnectionOpenHeader connectionId */
                    connectionId?: plexus.IUniqueId;
                }

                /** Represents a ConnectionOpenHeader. */
                class ConnectionOpenHeader {

                    /**
                     * Constructs a new ConnectionOpenHeader.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: plexus.interop.transport.protocol.IConnectionOpenHeader);

                    /** ConnectionOpenHeader connectionId. */
                    public connectionId?: (plexus.IUniqueId|null);

                    /**
                     * Creates a new ConnectionOpenHeader instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ConnectionOpenHeader instance
                     */
                    public static create(properties?: plexus.interop.transport.protocol.IConnectionOpenHeader): plexus.interop.transport.protocol.ConnectionOpenHeader;

                    /**
                     * Encodes the specified ConnectionOpenHeader message. Does not implicitly {@link plexus.interop.transport.protocol.ConnectionOpenHeader.verify|verify} messages.
                     * @param message ConnectionOpenHeader message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: plexus.interop.transport.protocol.IConnectionOpenHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ConnectionOpenHeader message, length delimited. Does not implicitly {@link plexus.interop.transport.protocol.ConnectionOpenHeader.verify|verify} messages.
                     * @param message ConnectionOpenHeader message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: plexus.interop.transport.protocol.IConnectionOpenHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ConnectionOpenHeader message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ConnectionOpenHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.transport.protocol.ConnectionOpenHeader;

                    /**
                     * Decodes a ConnectionOpenHeader message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ConnectionOpenHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.transport.protocol.ConnectionOpenHeader;

                    /**
                     * Verifies a ConnectionOpenHeader message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ConnectionOpenHeader message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ConnectionOpenHeader
                     */
                    public static fromObject(object: { [k: string]: any }): plexus.interop.transport.protocol.ConnectionOpenHeader;

                    /**
                     * Creates a plain object from a ConnectionOpenHeader message. Also converts values to other types if specified.
                     * @param message ConnectionOpenHeader
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: plexus.interop.transport.protocol.ConnectionOpenHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ConnectionOpenHeader to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a ConnectionCloseHeader. */
                interface IConnectionCloseHeader {

                    /** ConnectionCloseHeader completion */
                    completion?: plexus.ICompletion;
                }

                /** Represents a ConnectionCloseHeader. */
                class ConnectionCloseHeader {

                    /**
                     * Constructs a new ConnectionCloseHeader.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: plexus.interop.transport.protocol.IConnectionCloseHeader);

                    /** ConnectionCloseHeader completion. */
                    public completion?: (plexus.ICompletion|null);

                    /**
                     * Creates a new ConnectionCloseHeader instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ConnectionCloseHeader instance
                     */
                    public static create(properties?: plexus.interop.transport.protocol.IConnectionCloseHeader): plexus.interop.transport.protocol.ConnectionCloseHeader;

                    /**
                     * Encodes the specified ConnectionCloseHeader message. Does not implicitly {@link plexus.interop.transport.protocol.ConnectionCloseHeader.verify|verify} messages.
                     * @param message ConnectionCloseHeader message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: plexus.interop.transport.protocol.IConnectionCloseHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ConnectionCloseHeader message, length delimited. Does not implicitly {@link plexus.interop.transport.protocol.ConnectionCloseHeader.verify|verify} messages.
                     * @param message ConnectionCloseHeader message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: plexus.interop.transport.protocol.IConnectionCloseHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ConnectionCloseHeader message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ConnectionCloseHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.transport.protocol.ConnectionCloseHeader;

                    /**
                     * Decodes a ConnectionCloseHeader message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ConnectionCloseHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.transport.protocol.ConnectionCloseHeader;

                    /**
                     * Verifies a ConnectionCloseHeader message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ConnectionCloseHeader message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ConnectionCloseHeader
                     */
                    public static fromObject(object: { [k: string]: any }): plexus.interop.transport.protocol.ConnectionCloseHeader;

                    /**
                     * Creates a plain object from a ConnectionCloseHeader message. Also converts values to other types if specified.
                     * @param message ConnectionCloseHeader
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: plexus.interop.transport.protocol.ConnectionCloseHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ConnectionCloseHeader to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a ChannelOpenHeader. */
                interface IChannelOpenHeader {

                    /** ChannelOpenHeader channelId */
                    channelId?: plexus.IUniqueId;
                }

                /** Represents a ChannelOpenHeader. */
                class ChannelOpenHeader {

                    /**
                     * Constructs a new ChannelOpenHeader.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: plexus.interop.transport.protocol.IChannelOpenHeader);

                    /** ChannelOpenHeader channelId. */
                    public channelId?: (plexus.IUniqueId|null);

                    /**
                     * Creates a new ChannelOpenHeader instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ChannelOpenHeader instance
                     */
                    public static create(properties?: plexus.interop.transport.protocol.IChannelOpenHeader): plexus.interop.transport.protocol.ChannelOpenHeader;

                    /**
                     * Encodes the specified ChannelOpenHeader message. Does not implicitly {@link plexus.interop.transport.protocol.ChannelOpenHeader.verify|verify} messages.
                     * @param message ChannelOpenHeader message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: plexus.interop.transport.protocol.IChannelOpenHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ChannelOpenHeader message, length delimited. Does not implicitly {@link plexus.interop.transport.protocol.ChannelOpenHeader.verify|verify} messages.
                     * @param message ChannelOpenHeader message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: plexus.interop.transport.protocol.IChannelOpenHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ChannelOpenHeader message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ChannelOpenHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.transport.protocol.ChannelOpenHeader;

                    /**
                     * Decodes a ChannelOpenHeader message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ChannelOpenHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.transport.protocol.ChannelOpenHeader;

                    /**
                     * Verifies a ChannelOpenHeader message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ChannelOpenHeader message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ChannelOpenHeader
                     */
                    public static fromObject(object: { [k: string]: any }): plexus.interop.transport.protocol.ChannelOpenHeader;

                    /**
                     * Creates a plain object from a ChannelOpenHeader message. Also converts values to other types if specified.
                     * @param message ChannelOpenHeader
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: plexus.interop.transport.protocol.ChannelOpenHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ChannelOpenHeader to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a ChannelCloseHeader. */
                interface IChannelCloseHeader {

                    /** ChannelCloseHeader channelId */
                    channelId?: plexus.IUniqueId;

                    /** ChannelCloseHeader completion */
                    completion?: plexus.ICompletion;
                }

                /** Represents a ChannelCloseHeader. */
                class ChannelCloseHeader {

                    /**
                     * Constructs a new ChannelCloseHeader.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: plexus.interop.transport.protocol.IChannelCloseHeader);

                    /** ChannelCloseHeader channelId. */
                    public channelId?: (plexus.IUniqueId|null);

                    /** ChannelCloseHeader completion. */
                    public completion?: (plexus.ICompletion|null);

                    /**
                     * Creates a new ChannelCloseHeader instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ChannelCloseHeader instance
                     */
                    public static create(properties?: plexus.interop.transport.protocol.IChannelCloseHeader): plexus.interop.transport.protocol.ChannelCloseHeader;

                    /**
                     * Encodes the specified ChannelCloseHeader message. Does not implicitly {@link plexus.interop.transport.protocol.ChannelCloseHeader.verify|verify} messages.
                     * @param message ChannelCloseHeader message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: plexus.interop.transport.protocol.IChannelCloseHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ChannelCloseHeader message, length delimited. Does not implicitly {@link plexus.interop.transport.protocol.ChannelCloseHeader.verify|verify} messages.
                     * @param message ChannelCloseHeader message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: plexus.interop.transport.protocol.IChannelCloseHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ChannelCloseHeader message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ChannelCloseHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.transport.protocol.ChannelCloseHeader;

                    /**
                     * Decodes a ChannelCloseHeader message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ChannelCloseHeader
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.transport.protocol.ChannelCloseHeader;

                    /**
                     * Verifies a ChannelCloseHeader message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ChannelCloseHeader message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ChannelCloseHeader
                     */
                    public static fromObject(object: { [k: string]: any }): plexus.interop.transport.protocol.ChannelCloseHeader;

                    /**
                     * Creates a plain object from a ChannelCloseHeader message. Also converts values to other types if specified.
                     * @param message ChannelCloseHeader
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: plexus.interop.transport.protocol.ChannelCloseHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ChannelCloseHeader to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a Header. */
                interface IHeader {

                    /** Header messageFrame */
                    messageFrame?: plexus.interop.transport.protocol.IMessageFrameHeader;

                    /** Header channelOpen */
                    channelOpen?: plexus.interop.transport.protocol.IChannelOpenHeader;

                    /** Header channelClose */
                    channelClose?: plexus.interop.transport.protocol.IChannelCloseHeader;

                    /** Header open */
                    open?: plexus.interop.transport.protocol.IConnectionOpenHeader;

                    /** Header close */
                    close?: plexus.interop.transport.protocol.IConnectionCloseHeader;
                }

                /** Represents a Header. */
                class Header {

                    /**
                     * Constructs a new Header.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: plexus.interop.transport.protocol.IHeader);

                    /** Header messageFrame. */
                    public messageFrame?: (plexus.interop.transport.protocol.IMessageFrameHeader|null);

                    /** Header channelOpen. */
                    public channelOpen?: (plexus.interop.transport.protocol.IChannelOpenHeader|null);

                    /** Header channelClose. */
                    public channelClose?: (plexus.interop.transport.protocol.IChannelCloseHeader|null);

                    /** Header open. */
                    public open?: (plexus.interop.transport.protocol.IConnectionOpenHeader|null);

                    /** Header close. */
                    public close?: (plexus.interop.transport.protocol.IConnectionCloseHeader|null);

                    /** Header content. */
                    public content?: string;

                    /**
                     * Creates a new Header instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Header instance
                     */
                    public static create(properties?: plexus.interop.transport.protocol.IHeader): plexus.interop.transport.protocol.Header;

                    /**
                     * Encodes the specified Header message. Does not implicitly {@link plexus.interop.transport.protocol.Header.verify|verify} messages.
                     * @param message Header message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: plexus.interop.transport.protocol.IHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Header message, length delimited. Does not implicitly {@link plexus.interop.transport.protocol.Header.verify|verify} messages.
                     * @param message Header message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: plexus.interop.transport.protocol.IHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Header message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Header
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.interop.transport.protocol.Header;

                    /**
                     * Decodes a Header message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Header
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.interop.transport.protocol.Header;

                    /**
                     * Verifies a Header message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Header message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Header
                     */
                    public static fromObject(object: { [k: string]: any }): plexus.interop.transport.protocol.Header;

                    /**
                     * Creates a plain object from a Header message. Also converts values to other types if specified.
                     * @param message Header
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: plexus.interop.transport.protocol.Header, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Header to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }
            }
        }
    }

    /** Properties of an UniqueId. */
    interface IUniqueId {

        /** UniqueId lo */
        lo?: Long;

        /** UniqueId hi */
        hi?: Long;
    }

    /** Represents an UniqueId. */
    class UniqueId {

        /**
         * Constructs a new UniqueId.
         * @param [properties] Properties to set
         */
        constructor(properties?: plexus.IUniqueId);

        /** UniqueId lo. */
        public lo: Long;

        /** UniqueId hi. */
        public hi: Long;

        /**
         * Creates a new UniqueId instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UniqueId instance
         */
        public static create(properties?: plexus.IUniqueId): plexus.UniqueId;

        /**
         * Encodes the specified UniqueId message. Does not implicitly {@link plexus.UniqueId.verify|verify} messages.
         * @param message UniqueId message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: plexus.IUniqueId, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UniqueId message, length delimited. Does not implicitly {@link plexus.UniqueId.verify|verify} messages.
         * @param message UniqueId message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: plexus.IUniqueId, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UniqueId message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UniqueId
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.UniqueId;

        /**
         * Decodes an UniqueId message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UniqueId
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.UniqueId;

        /**
         * Verifies an UniqueId message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UniqueId message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UniqueId
         */
        public static fromObject(object: { [k: string]: any }): plexus.UniqueId;

        /**
         * Creates a plain object from an UniqueId message. Also converts values to other types if specified.
         * @param message UniqueId
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: plexus.UniqueId, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UniqueId to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an Error. */
    interface IError {

        /** Error message */
        message?: string;

        /** Error details */
        details?: string;
    }

    /** Represents an Error. */
    class Error {

        /**
         * Constructs a new Error.
         * @param [properties] Properties to set
         */
        constructor(properties?: plexus.IError);

        /** Error message. */
        public message: string;

        /** Error details. */
        public details: string;

        /**
         * Creates a new Error instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Error instance
         */
        public static create(properties?: plexus.IError): plexus.Error;

        /**
         * Encodes the specified Error message. Does not implicitly {@link plexus.Error.verify|verify} messages.
         * @param message Error message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: plexus.IError, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Error message, length delimited. Does not implicitly {@link plexus.Error.verify|verify} messages.
         * @param message Error message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: plexus.IError, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Error message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Error
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.Error;

        /**
         * Decodes an Error message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Error
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.Error;

        /**
         * Verifies an Error message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Error message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Error
         */
        public static fromObject(object: { [k: string]: any }): plexus.Error;

        /**
         * Creates a plain object from an Error message. Also converts values to other types if specified.
         * @param message Error
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: plexus.Error, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Error to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Completion. */
    interface ICompletion {

        /** Completion status */
        status?: plexus.Completion.Status;

        /** Completion error */
        error?: plexus.IError;
    }

    /** Represents a Completion. */
    class Completion {

        /**
         * Constructs a new Completion.
         * @param [properties] Properties to set
         */
        constructor(properties?: plexus.ICompletion);

        /** Completion status. */
        public status: plexus.Completion.Status;

        /** Completion error. */
        public error?: (plexus.IError|null);

        /**
         * Creates a new Completion instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Completion instance
         */
        public static create(properties?: plexus.ICompletion): plexus.Completion;

        /**
         * Encodes the specified Completion message. Does not implicitly {@link plexus.Completion.verify|verify} messages.
         * @param message Completion message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: plexus.ICompletion, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Completion message, length delimited. Does not implicitly {@link plexus.Completion.verify|verify} messages.
         * @param message Completion message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: plexus.ICompletion, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Completion message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Completion
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): plexus.Completion;

        /**
         * Decodes a Completion message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Completion
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): plexus.Completion;

        /**
         * Verifies a Completion message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Completion message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Completion
         */
        public static fromObject(object: { [k: string]: any }): plexus.Completion;

        /**
         * Creates a plain object from a Completion message. Also converts values to other types if specified.
         * @param message Completion
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: plexus.Completion, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Completion to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Completion {

        /** Status enum. */
        enum Status {
            Completed = 0,
            Canceled = 1,
            Failed = 2
        }
    }
}
