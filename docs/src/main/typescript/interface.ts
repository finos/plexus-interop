type Context = Object;
type Result = Object;
type IntentName = String;
type TopicName = String;
type AppIdentifier = String;
type AppInstanceIdentifier = String;

enum InvokationErrorType {
  AppNotFound = "AppNotFound",
  ErrorOnLaunch = "ErrorOnLaunch",
  AppTimeout = "AppTimeout",  
  HandlerInternalError = "HandlerInternalError",
  ResolverUnavailable = "ResolverUnavailable",
  ResolverInternalError = "ResolverInternalError"
}

interface InvokationError extends Error {
  type: InvokationErrorType;
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
 * Specified whether the target app is already running or it can be launched by invokation.
 */
enum AppState {
  Launchable = 0,
  Running = 1
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
 * Specifies intent resolved by Agent. 
 * Can be casted to Target and invoked.
 */
interface Intent {
  intentName: IntentName,
  applicationName: AppIdentifier,   // Resolved application name.  
  state: AppState,                  // Resolved application state.
  instance?: AppInstanceIdentifier, // Optional. Undefined if application is not running (i.e. its state = Launchable).
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
 * Specifies invokation target. Can be resolved from Agent or constructed directly.
 * Caller can specify the concrete instance of app which should handle the invokation.
 * Caller can specify if he want to route the invokation to already running or launchable instance.
 */
interface Target {
  intentName: IntentName,           
  applicationName?: AppIdentifier,  // Optional. Can be undefined when constructed directly if target app is unknown and caller let Agent decide which app should handle the invokation.
  instance?: AppInstanceIdentifier, // Optional. Can be undefined when constructed directly if target app instance is unknown and caller let Agent decide which instance should handle the invokation. If specified then Agent will route the context to this exact app instance.
  state?: AppState                  // Optional. Can be undefined when constructed directly if target app state doesn't matter for caller. If state=Launchable then Agent will launch new instance of target app. If state=Running then Agent will route context to the already running instance.
}

// Intent can be casted to Target.
var intent: Intent;
var target: Target;
target = intent;

/**
 * Allows cancelling asynchronous operation.
 */
interface Cancellable {
  cancel(): void;
}

/**
 * Allows to subscribe to invokation result (successful or not).
 */
interface InvokationObserver {
  onError(error: InvokationError): void;
  onCompleted(result: Result): void;
}

/**
 * Allows to subscribe to streaming invokation.
 */
interface StreamObserver {
  onNext(result: Result): void;
  onError(error: InvokationError): void;
  onCompleted(): void;
}

/**
 * A Desktop Agent is a desktop component (or aggregate of components) that serves as a
 * launcher and message router (broker) for applications in its domain.
 * 
 * A Desktop Agent can be connected to one or more App Directories and will use directories for application
 * identity and discovery. Typically, a Desktop Agent will contain the proprietary logic of
 * a given platform, handling functionality like explicit application interop workflows where
 * security, consistency, and implementation requirements are proprietary.
 */
interface DesktopAgent {
  /**
   * Sends the given context to the given target. 
   * 
   * Specified observer receives either result object or error object after invokation completed.
   * For fire-and-forget cases observer can be omited.
   */
  invoke(target: Target, context: Context, observer?: InvokationObserver): Cancellable;

  /**
   * Sends the given context to the given target and listens for stream of responses.
   */
  invokeStream(target: Target, context: Context, observer: StreamObserver): Cancellable;  

  /**
   * Listens to incoming Intents from the Agent.
   * 
   * Handler function returns promise to allow asynchornous execution.
   */
  listen(intent: IntentName, handler: (context: Context) => Promise<Result>): Cancellable;  

  /**
   * Resolves a list of potential invokation targets by the given parameters.
   *
   * Resolve is effectively granting programmatic access to the Desktop Agent's resolver.
   * Returns a promise that resolves to an Array. The resolved dataset & metadata is Desktop Agent-specific.
   * If the resolution errors, it returns error of type `ResolveError`.
   */
  resolve(resolveParameters: ResolveParameters): Promise<Intent[]>;

  /**
   * Broadcasts context to all the listeners of the specified topic.
   */
  broadcast(topic: TopicName, context: Context): void;

  /**
   * Subscribes for incoming context broadcast on the specified topic.
   */
  subscribe(topic: TopicName, handler: (context: Context) => void): Cancellable;
}