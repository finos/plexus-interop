type Context = Object;
type Result = Object;
type IntentName = String;
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

enum ResolveError {
  NoAppsFound = "NoAppsFound",
  ResolverUnavailable = "ResolverUnavailable",
  ResolverTimeout = "ResolverTimeout"
}

/**
 * Specified whether the target app is already running or it can be launched by invokation.
 */
enum AppState {
  Launchable = 0,
  Running = 1
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
   * Listens to incoming Intents from the Agent.
   * 
   * Handler function returns promise to allow asynchornous execution.
   */
  listen(intent: IntentName, handler: (context: Context) => Promise<Result>): Cancellable;  

  /**
   * Resolves a intent & context pair to a list of App names/metadata.
   *
   * Resolve is effectively granting programmatic access to the Desktop Agent's resolver. 
   * Returns a promise that resolves to an Array. The resolved dataset & metadata is Desktop Agent-specific.
   * If the resolution errors, it returns an `Error` with a string from the `ResolveError` enumeration.
   */
  resolve(intent: IntentName, context: Context): Promise<Array<Target>>;

  /**
   * Publishes context to other apps on the desktop.
   */
  broadcast(context: Context): void;

  /**
   * Listens to incoming context broadcast from the Desktop Agent.
   */
  contextListener(handler: (context: Context) => void): Cancellable;
}