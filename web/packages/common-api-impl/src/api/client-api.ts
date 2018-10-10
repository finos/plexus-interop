// tslint:disable
/**
* Copyright © 2014-2018 Tick42 BG OOD, Deutsche Bank AG
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
// tslint:disable
/**
 * Used to instantiate an InteropPeer.
 * An application will typically create one InteropPlatform instance per Platform (e.g. 'Glue42', 'Plexus Interop', etc.) that it wishes
 * to work with.
 * This API does not discuss how instances are created.
 * @todo: Consider how to deal with the authentication. Some platforms may do the user name/password prompt, it could be contained
 *        inside the config.
 *        Also the sign-on/security token that MAY be available after a successful connect() could be useful elsewhere so might belong
 *        in the InteropPeer.ApplicationInstance, but again that is not currently discussed.
 *        It is expected that as implementations are created for the API, a consensus will emerge about how to handle this and the spec
 *        might update.
 */
export interface InteropPlatform {
    type: string;                       // Specifies the platform type (e.g. 'Glue42', 'Plexus Interop', etc.).
    version: string;                    // The version of the platform.

    /**
     * @param  {InteropFeature}     feature       Identifies an interop feature.
     * 
     * @return {boolean}                          Boolean indicating whether the given feature is supported.
     */
    isFeatureSupported(feature: InteropFeature): boolean;

    /**
     * @param  {string}                       applicationName       Name of the application participating in interop.
     * @param  {string}                       apiMetadata           Publishes metadata which describes API implemented by the app
     *                                                              in proto3 syntax (https://developers.google.com/protocol-buffers/docs/proto3)
     *                                                              to help dev tools to build swagger-like API explorers.     
     * @param  {MethodImplementation[]}       methods               Methods registered on peer creation.
     *                                                              The InteropPeer can later register more methods.
     * @param  {StreamImplementation[]}       streams               Streams registered on peer creation.
     *                                                              The InteropPeer can later register more streams.
     * @return {Promise<InteropPeer>}                               The InteropPeer which represents application connection to interop platform (InteropPeerDescriptor)
     *                                                              and is used to participate in the interop communication (InteropClient, InteropServer).
     *                                                              Application can create as many connections as it wish, interop platform will assign 
     *                                                              unique id for each to distinguish them.
     */
    connect(
        applicationName: string,
        apiMetadata?: string,
        methods?: MethodImplementation[],
        streams?: StreamImplementation[]
    ): Promise<InteropPeer>;
}

export enum InteropFeature {
    InvokeMethod = "InvokeMethod",
    SubscribeStream = "SubscribeStream",
    RegisterMethod = "RegisterMethod",
    RegisterMethodOnConnect = "RegisterMethodOnConnect",
    RegisterStream = "RegisterStream",
    RegisterStreamOnConnect = "RegisterStreamOnConnect",
    DiscoverPeers = "DiscoverPeers",
    DiscoverMethods = "DiscoverMethods",
    DiscoverStreams = "DiscoverStreams",
    ListenPeerConnected = "ListenPeerConnected",
    ListenMethodRegistered = "ListenMethodRegistered",
    ListenStreamRegistered = "ListenStreamRegistered"
}

export interface InteropPeer extends InteropClient, InteropServer, InteropPeerDescriptor {

    connectionStatus: ConnectionStatus; // Shows the current connection status of the peer.

    /**
     * @param  {ConnectionStatus) => void}        callback Event listener, called whenever the connection status changes (all events get
     *                                                     replayed on subscription).
     * @return {UnsubscribeFunction}                       Function used to unsubscribe the event listener.
     */
    onConnectionStatusChanged(
        callback: (status: ConnectionStatus) => void
    ): Subscription;

    /**
     * @return {Promise<void>} Promise that resolves when the peer is disconnected.
     */
    disconnect(): Promise<void>;

    /**
     * @param  {(Error) => void}     callback     Callback which is called whenever the peer disconnected. 
     *                                            Error argument might be passed in the cases disconnect caused by an error.
     * @return {Subscription}                     Object used to unsubscribe the event listener.
     */
    onDisconnected(
        callback: (error?: Error) => void
    ): Subscription;
}

/**
 * Specifies the Peer's connection statuses.
 * State diagram:
+---------------------------------------------+
|                                             |
| Disconnected+---->Connecting+---->Connected |
|      ^                +               +     |
|      |                |               |     |
|      ^----------------+               |     |
|      |                                |     |
|      +                                |     |
| Disconnecting<------------------------+     |
|                                             |
+---------------------------------------------+
 */
export enum ConnectionStatus {
    Connecting = "Connecting",          /* A connection request has been started via a call to connect() but the connection has not
                                           yet been completed. */
    Connected = "Connected",            // Connected to the Platform. All data should be up to date.
    Disconnecting = "Disconnecting",    /* A disconnect request has been made. Methods' invocation/registration don't work, but the
                                           disconnect has not yet been completed. */
    Disconnected = "Disconnected",      // The platform is disconnected.
}

/**
 * A container for the 'Client' functionality.
 */
export interface InteropClient {
    /**
     * @param  {string                 |       Method}      method  The name of the method or the method instance to be invoked.
     * @param  {any}                                        args    An object containing the arguments to be used for the invocation.
     * @return {Promise<InvokeResult>}                              Outcome of the method invocation, containing the result, caller and
     *                                                              other information.
     */
    invoke(method: string | Method, args?: any): Promise<InvokeResult>;

    /**
     * @param  {string                         |    Stream}      stream   The name of the stream or the stream instance to subscribe to.
     * @param  {StreamObserver}                                  observer An object which will be notified on stream events.
     * @param  {any}                                             args     An object containing the arguments to be used for the subscription.
     * @return {Promise<StreamSubscription>}                     StreamSubscription containing the subscription details and unsubscribe method.
     */
    subscribe(
        stream: string | Stream,
        observer: StreamObserver,
        args?: any): Promise<StreamSubscription>;

    /**
     * @return {Promise<InteropPeerDescriptor[]>} List of all the peers currently participating in the interop communication.
     */
    discoverPeers(): Promise<InteropPeerDescriptor[]>;

    /**
     * @return {Promise<Method[]>} List of all the currently registered methods.
     *                             Can be used to discover methods.
     */
    discoverMethods(): Promise<Method[]>;

    /**
     * @return {Promise<Stream[]>} List of all the currently registered streams.
     *                             Can be used to discover streams.
     */
    discoverStreams(): Promise<Stream[]>;

    /**
     * @param  {Method)          => void}        callback Event listener, called whenever a method is registered by a server.
     * @return {Subscription}                    Subscription object which can be used to unsubscribe the event listener.
     */
    onMethodRegistered(callback: (method: Method) => void): Subscription;

    /**
     * @param  {Method)          => void}        callback Event listener, called whenever a method is unregistered by a server.
     * @return {Subscription}                    Subscription object which can be used to unsubscribe the event listener.
     */
    onMethodUnregistered(callback: (method: Method) => void): Subscription;

    /**
     * @param  {Stream)          => void}        callback Event listener, called whenever a stream is registered by a server.
     * @return {Subscription}                    Subscription object which can be used to unsubscribe the event listener.
     */
    onStreamRegistered(callback: (stream: Stream) => void): Subscription;

    /**
     * @param  {Stream)          => void}        callback Event listener, called whenever a stream is closed by a server.
     * @return {Subscription}                    Subscription object which can be used to unsubscribe the event listener.
     */
    onStreamUnregistered(callback: (stream: Stream) => void): Subscription;

    /**
     * @param  {InteropPeerDescriptor) => void}        callback Event listener, called whenever a new peer is connected.
     * @return {Subscription}                    Subscription object which can be used to unsubscribe the event listener.
     */
    onPeerConnected(callback: (peer: InteropPeerDescriptor) => void): Subscription;

    /**
     * @param  {InteropPeerDescriptor) => void}        callback Event listener, called whenever a peer is disconnected.
     * @return {Subscription}                    Subscription object which can be used to unsubscribe the event listener.
     */
    onPeerDisconnected(callback: (peer: InteropPeerDescriptor) => void): Subscription;
}

/**
 * Invocation result object returned after a successful method invocation.
 */
export interface InvokeResult {
    method: Method;                     // Identifies the method that was executed as well as the peer that registered/executed it.
    arguments?: any;                    // An object containing the arguments used for the invocation.  
    result?: any;                       // Result of the method invocation.
}

/**
 * An InteropClient's stream subscription.
 */
export interface StreamSubscription extends Subscription {
    arguments?: object;                 // An object containing the arguments used for the subscription.
    stream: Stream;                     // Reference to the stream that the subscription is to.
}

/**
 * A container for the 'Server' functionality.
 */
export interface InteropServer {
    /**
     * @param  {MethodImplementation} methodImplementation Method implementation, specifying the method's name, properties and invocation
     *                                                     handler.
     * @return {Promise<RegisteredMethod>}                 Method object containing the method's details and function to unregister the method implementation.
     */
    register(methodImplementation: MethodImplementation): Promise<RegisteredMethod>;

    /**
     * @param  {StreamImplementation} streamImplementation Stream implementation, specifying the stream's name, properties and subscription
     *                                                     handlers. The stream can be closed (unregistered) by calling close() on the
     *                                                     ServerStream instance.
     * @return {Promise<RegisteredStream>}                 RegisteredStream object containing the stream's details and function to unregisted the stream implementation.
     */
    registerStream(streamImplementation: StreamImplementation): Promise<RegisteredStream>;

    /**
     * Publishes metadata which describes API implemented by the app
     * in proto3 syntax (https://developers.google.com/protocol-buffers/docs/proto3)
     * to help dev tools to build swagger-like API explorers.
     */
    publishApiMetadata(apiMetadata: string): Promise<void>;
}

/**
 * @type Specifies an unsubscribe function used to unsubscribe event listeners.
 */
export interface Subscription {
    /**
    * @return {Promise<void>} Promise that resolves when the subscription successfully closed.
    */
    unsubscribe(): Promise<void>;
}

/**
 * Reference to a connected instance of a peer or launchable application.
 */
export interface InteropPeerDescriptor {
    isConnected: boolean;        // Shows the current connection status of the peer.
    applicationName: string;     // The name of the application.
    id: string;                  /* Platform specific id.
                                    Unique for an InteropPeerInstance connected to the platform. Null for launchable app.
                                    Some platforms may change the id following a disconnect/reconnect. */

    /**
     * Returns metadata describing API implemented by the application
     * in proto3 syntax (https://developers.google.com/protocol-buffers/docs/proto3).
     * Can be used by dev tools to implement swagger-like API explorers.
     */
    getApiMetadata(): Promise<string>;

    /**
     * Notifies when application changed the published API metadata.
     */
    onApiMetadataChanged(callback: (metadata: string) => void): void;
}

/**
 * Describes the attributes of a method.
 */
export interface MethodDefinition {
    name: string;                       // The name of the method.
    acceptType?: string,                // Optional property specifying the accepted object type ID for e.g. FINOS FDC3 Context, FINOS FInancial object and/or OpenFIGI.
    returnType?: string,                // Optional property specifying the returned object type ID for e.g. FINOS FDC3 Context, FINOS FInancial object and/or OpenFIGI.

    /**
     * @param  {any}                        context   Object containing intent data.
     *
     * @return {Promise<boolean>}                     Method object containing the method's details and function to unregister the method implementation.
     */
    accepts?(context: any): Promise<boolean>;  /* Function checks whether the method can handle the given intent context. 
                                                  Is handled by either Interop Platform or by the peer which registered the method.
                                                */

    /**
     * Hints from a method 'publisher' on how the method could be displayed in a UI.
     * This is expected to dovetail with the FINOS FDC3 Intents capability.
     */
    displayName?: string;                             // User friendly name to present the method to a user in a UI.
    tooltip?: string;                                 // Tooltip to describe the method.  
    intent?: MethodIntent[];            // MethodIntents that the Method satisfies, typically there will be 0 or 1.
}

/**
 * A reference to a method available to be invoked, i.e. it is being offered by a server.
 */
export interface Method extends MethodDefinition {
    peer: InteropPeerDescriptor;                       // Identifies the peer that registered the method.
}

export interface RegisteredMethod extends Method {
    unregister: () => Promise<void>;
}

export type StreamDefinition = MethodDefinition;
export type Stream = Method;
export type RegisteredStream = RegisteredMethod;

export interface MethodHandler {
    /**
     * @param  {any}              args                  An object containing the arguments used for the invocation.
     * @param  {InteropPeerDescriptor} caller          A reference to the peer that invoked the method.
     * @return {Promise<any>}                          Result of the method invocation, that is then sent to the client wrapped inside of
     *                                                 an InvokeResult.
     */
    onInvoke(args: any, caller: InteropPeerDescriptor): Promise<any>;
}

/**
 * Defines a method including the handler that is being registered.
 */
export interface MethodImplementation extends MethodDefinition, MethodHandler {
}

export interface StreamHandler {

    /**
     * @param  {StreamObserver} observer               Observer object subscribing to the stream.
     * @param  {InteropPeerDescriptor} caller          A reference to the peer that invoked the method.
     * @param  {any}              args                 An object containing the arguments used for the subscription.
     * @return {Promise<Subscription>}                 Subscription instance. Its unsubscribe method will be called 
     *                                                 when the caller closed subscription or disconnected.
     */
    onSubscriptionRequested(observer: StreamObserver, caller: InteropPeerDescriptor, args?: any): Promise<Subscription>;
}

/**
 * Defines a stream including the handler that is being registered.
 */
export interface StreamImplementation extends StreamDefinition, StreamHandler {
}

/**
 * Defines observer of a stream.
 * 
 * Client (stream consumer) provides implementation of this export interface to listen the called stream.
 * 
 * Server (stream producer) receives an object implementing this export interface and calls its methods 
 * to push new items or to complete the stream.
 */
export interface StreamObserver {

    /** 
     * On client side this method is called for each new received item.
     * 
     * On server side calling this method pushes new item to the stream.
     * 
     * @param  {any} data                   On client side: received stream item.
     *                                      On server side: item to push into the stream.
     * 
     * @return {Promise<void>}              Client should return promise which will be resolved as soon as item is handled.
     *                                      Server receives promise which will be resolved as soon as interop platform 
     *                                      accepted the new item (doesn't mean it was received by subscriber!).
     *                                      
    */
    next: (data: any) => Promise<void>;

    /** 
     * On client side this method is called when stream is completed.
     * 
     * On server side calling this method completes the stream. 
     * Observer won't accept any further items after calling this method.
     * 
     * @return {Promise<void>}              Client should return promise which will be resolved 
     *                                      as soon as completion notification is handled.
     *                                      Server receives promise which will be resolved as soon as all the items 
     *                                      are sent to the caller and stream completed.
     *                                      
    */
    completed: () => Promise<void>;

    /** 
     * On client side this method is called when stream is completed because of an error.
     * 
     * On server side calling this method completes the stream with an error. 
     * Stream won't accept any further items after calling this method.
     * 
     * @param  {Error} error                On client side: object representing error.
     *                                      On server side: error to send.
     * 
     * @return {Promise<void>}              Client should return promise which will be resolved 
     *                                      as soon as error notification is handled.
     *                                      Server receives promise which will be resolved as soon as all the items 
     *                                      are sent to the caller and stream completed.
     *                                      
    */
    error: (error: Error) => Promise<void>;
}

/**
 * Typically an application that implements an Intent does it by publishing an Interop method to implement the Intent.
 * This export interface provides a way that Method publishers can record the Intent capabilities of each method.
 * This is in addition to the Intent publishing capability allowed in application definitions such as the
 * FINOS FDC3 Application definition.
 */
export interface MethodIntent {
    name: string;                       // Required. The name of the Intent.
    contexts?: string;                  /* Optional 'context' which define when this method is able to implement the Intent.
                                         This should be thought of as 'restrictions' on the scope of a method.
                                         For example there might be a restriction to say the Intent can only be delivered for exchange traded equities. */
}
