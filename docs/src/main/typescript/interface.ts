/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
type Context = Object;
type Result = Object;
type IntentName = String;
type TopicName = String;
type AppIdentifier = String;
type AppInstanceIdentifier = String;

enum InvocationErrorType {
  AppNotFound = "AppNotFound",
  ErrorOnLaunch = "ErrorOnLaunch",
  AppTimeout = "AppTimeout",
  AppInternalError = "AppInternalError",
  ResolverUnavailable = "ResolverUnavailable",
  ResolverInternalError = "ResolverInternalError"
}

interface InvocationError extends Error {
  type: InvocationErrorType;
}

enum ResolveErrorType {
  ResolverUnavailable = "ResolverUnavailable",
  ResolverTimeout = "ResolverTimeout",
  ResolverInternalError = "ResolverInternalError"
}

interface ResolveError extends Error {
  type: ResolveErrorType;
}

/**
 * Specified whether the target app is already running or it can be launched by invocation.
 */
enum AppState {
  Launchable = "Launchable",
  Running = "Running"
}

/**
 * Resolve parameters allows resolving intents either by intent name or by context or both.
 */
interface ResolveParameters {
  context?: Context,                // Optional. Can be specified for resolving intents by context.
  intentName?: IntentName,          // Optional. Can be specified for resolving intents by name.
  state?: AppState                  // Optional. Can be specified for resolving either already running app instances or launchable or both. 
}

/**
 * Indicates type of response
 */
enum IntentType {
  Simple = "Simple",
  Streaming = "Streaming"
}

/**
 * Specifies intent resolved by Agent. 
 * Can be casted to Target and invoked.
 */
interface Intent {
  intentName: IntentName,
  applicationName: AppIdentifier,   // Resolved application name.  
  state: AppState,                  // Resolved application state.
  instance?: AppInstanceIdentifier, // Optional. Undefined if application is not running (i.e. its state = Launchable).
  type: IntentType,                 // Resolved intent type  
  properties: Property[]            // Custom properties of the resolved intent, e.g. user-friendly title and icon to show on UI.
}

/**
 * Custom property.
 */
interface Property {
  name: string,
  value: object
}

/**
 * Specifies invocation target. Can be resolved from Agent or constructed directly.
 * Caller can specify the concrete instance of app which should handle the invocation.
 * Caller can specify if he want to route the invocation to already running or launchable instance.
 */
interface Target {
  intentName: IntentName,
  applicationName?: AppIdentifier,  // Optional. Can be undefined when constructed directly if target app is unknown and caller let Agent decide which app should handle the invocation.
  instance?: AppInstanceIdentifier, // Optional. Can be undefined when constructed directly if target app instance is unknown and caller let Agent decide which instance should handle the invocation. If specified then Agent will route the context to this exact app instance.
  state?: AppState                  // Optional. Can be undefined when constructed directly if target app state doesn't matter for caller. If state=Launchable then Agent will launch new instance of target app. If state=Running then Agent will route context to the already running instance.
}

// Intent can be casted to Target.
var intent: Intent;
var target: Target;
target = intent;

/**
 * Token which propogates information that operation should be cancelled.
 */
interface CancellationToken {
  isCancelled(): boolean;
  // listens for cancellation of this token 
  listen(callback: (reason: any) => void): Listener;
}

/**
 * Allows to subscribe to invocation result (successful or not).
 */
interface InvocationObserver {
  onError(error: InvocationError): void;
  onCompleted(result: Result): void;
}

/**
 * Allows to subscribe to streaming invocation.
 */
interface StreamObserver {
  onNext(result: Result): void;
  onError(error: InvocationError): void;
  onCompleted(): void;
}

interface IntentObserver {
  intentAdded(intent: Intent);
  intentRemoved(intent: Intent);
}

/**
 * Allows to dispose subscriptions.
 */
interface Listener {
  unsubscribe();
}

interface InvocationHandler { 

  intentName: IntentName, 

  /**
  * Implements logic of intent handling.
  * CancellationToken will signal when caller cancelled the request allowing intent handler to cancel long running operations.
  */  
  handle(context: Context, cancellationToken: CancellationToken): Promise<Result>;
}

interface StreamingInvocationHandler {

  intentName: IntentName, 

  /**
  * Implements logic of streaming intent handling.
  * CancellationToken will signal when caller cancelled the request allowing intent handler to cancel long running operations.
  */  
  handle(context: Context, cancellationToken: CancellationToken, observer: StreamObserver): void;
}

/**
 * Desktop Agent is a desktop component (or aggregate of components) that serves as a
 * launcher and message router (broker) for applications in its domain.
 * 
 * Desktop Agent can be connected to one or more App Directories and will use directories for application
 * identity and discovery. Typically, a Desktop agent will contain the proprietary logic of
 * a given platform, handling functionality like explicit application interop workflows where
 * security, consistency, and implementation requirements are proprietary.
 */
interface DesktopAgent {

  /**
  * Connects the current App Instance to interop, all intent handlers are provided during connect.
  * Returns InteropClient instance which can be used to interoperate with desktop agent.
  */
  connect(
    applicationName: AppIdentifier, 
    invocationHandlers?: InvocationHandler[], 
    streamingInvocationHandlers?: StreamingInvocationHandler[]): Promise<InteropClient>;
}

/**
 * InteropClient is an interface for interoperating with Desktop Agent.
 * Each instance of InteropClient reprensents a connection from app to Desktop Agent.
 */
interface InteropClient {

  /**
   * Sends the given context to the given target. 
   * 
   * Specified observer receives either result object or error object after invocation completed.
   * For fire-and-forget cases observer can be omited.
   */
  invoke(target: Target, context: Context, cancellationToken?: CancellationToken): Promise<Result>;

  /**
   * Sends the given context to the given target and listens for stream of responses.
   */
  invokeStream(target: Target, context: Context, observer: StreamObserver): Listener;

  /**
   * Resolves a list of potential invocation targets by the given parameters.
   *
   * Resolve is effectively granting programmatic access to the Desktop Agent's resolver.
   * Returns a promise that resolves to an Array. The resolved dataset & metadata is Desktop Agent-specific.
   * If the resolution errors, it returns error of type `ResolveError`.
   */
  resolve(resolveParameters: ResolveParameters): Promise<Intent[]>;

  /**
   * Listens for invocation targets for given parameters.
   */
  listenIntents(resolveParameters: ResolveParameters, IntentObserver: IntentObserver): Listener;

  /**
   * Broadcasts context to all the listeners of the specified topic.
   */
  broadcast(topic: TopicName, context: Context): void;

  /**
   * Subscribes for incoming context broadcast on the specified topic.
   */
  subscribe(topic: TopicName, handler: (context: Context) => void): Listener;

  /**
   * Disconnects client from Interop, no more actions received/all subscriptions closed/all further invocations rejected
   */
  disconnect(): Promise<void>;

}