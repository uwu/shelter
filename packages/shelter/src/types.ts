import type * as SuperAgent from "superagent";
import { intercept } from "./http";

export interface Dispatcher {
  // not typing this lol
  _actionHandlers: unknown;

  _currentDispatchActionType: undefined | string;
  _interceptors?: ((payload: any) => void | boolean)[];
  _processingWaitQueue: boolean;
  _subscriptions: Record<string, Set<(payload: any) => void>>;
  _waitQueue: unknown[];

  addDependencies(node1: any, node2: any): void;

  dispatch(payload: any): Promise<void>;

  flushWaitQueue(): void;

  isDispatching(): boolean;

  register(name: string, actionHandler: Record<string, (e: any) => void>, storeDidChange: (e: any) => boolean): string;

  setInterceptor(interceptor?: (payload: any) => void | boolean): void;

  subscribe(actionType: string, callback: (payload: any) => void);

  unsubscribe(actionType: string, callback: (payload: any) => void);

  wait(cb: () => void): void;

  _dispatch(payload: any, t: unknown): Promise<void>;

  _dispatchWithDevtools(payload: any): void;

  _dispatchWithLogging(payload: any): void;
}

type FluxStoreChangeCallbacks = {
  add(cb: () => void): void;

  addConditional(cb: () => boolean): void;

  listeners: Set<() => void>;

  remove(cb: () => void): void;

  has(cb: () => void): boolean;

  hasAny(): boolean;

  invokeAll(): void;
};

// T = any has desired DX, but flattens FluxStore to any, killing IDE support
// T = unknown retains the shape of the object, but has bad DX
// T = Record<string, any> mimics behaviour of any, but doesn't flatten the type away to any.
export type FluxStore<T = Record<string, any>> = T & {
  addChangeListener(cb: () => void): void;
  removeChangeListener(cb: () => void): void;
  addReactChangeListener(cb: () => void): void;
  removeReactChangeListener(cb: () => void): void;
  addConditionalChangeListener(cb: () => boolean): void;

  callback(cb: () => void): void;
  throttledCallback(): unknown; // idk what the hell this does

  getName(): string;

  __getLocalVars?(): object;

  _changeCallbacks: FluxStoreChangeCallbacks;
  _isInitialized: boolean;
  _version: number;
  _reactChangeCallbacks: FluxStoreChangeCallbacks;
};

// TODO: Test if these are all correct.
export interface HTTPRequest {
  url: string;
  /**
   * Supports arrays as well, see:
   * https://github.com/ladjs/superagent/blob/1c8338b2e0a3b8f604d08acc7f3cbe305be1e571/src/client.js#L577
   */
  query?: string | object;

  headers?: Record<string, string>;

  /** X-Audit-Log-Reason */
  reason?: string;
  /** X-Context-Properties */
  context?: any;

  /** Number of times this request should be retried. */
  retries?: number;

  /**
   * If this is an object, it's encoded as JSON,
   * if it's a string, it's encoded as x-www-form-urlencoded data unless
   * otherwise specified in the headers.
   */
  body?: any;
  /** Cannot be used together with {@link body} */
  attachments?: {
    name: string;
    file: Blob | File;
    filename: string;
  }[];
  /**
   * Sets the fields for "multipart/form-data" request bodies,
   * cannot be used together with {@link body};
   */
  fields?: {
    name: string;
    value: string | Blob | File;
  }[];

  /** Timeout in milliseconds */
  timeout?: number;

  /** Parses the response as a {@link Blob} */
  binary?: boolean;

  oldFormErrors: boolean;

  onRequestCreated?: (request: SuperAgent.Request) => void;
  onRequestProgress?: (this: SuperAgent.Request, event: SuperAgent.ProgressEvent) => void;
}

export interface HTTPResponse {
  ok: boolean;
  headers: Record<string, string>;
  body: any;
  text: string;
  status: number;
}

export interface HTTPErrorCallback {
  ok: false;
  hasErr: true;
  err: any;
}

export type HTTPSuccessCallback = {
  hasErr: false;
} & HTTPResponse;

export type HTTPCallback = (response: HTTPErrorCallback | HTTPSuccessCallback) => void;

export type HTTPFunction = (request: string | HTTPRequest, callback?: HTTPCallback) => Promise<HTTPResponse>;

export interface DiscordHTTP {
  get: HTTPFunction;
  post: HTTPFunction;
  put: HTTPFunction;
  patch: HTTPFunction;
  del: HTTPFunction;
  getAPIBaseURL: string;
  V6OrEarlierAPIError: Error;
  V8APIError: Error;
}

export type HTTPApi = {
  intercept: typeof intercept;
  ready: Promise<void>;
  _raw?: DiscordHTTP;
} & Partial<DiscordHTTP>;

export interface Fiber {
  // Instance
  tag: number;
  key: string | null;
  elementType: Function | string | null;
  type: Function | string | null;
  stateNode: FiberOwner | Element | null;

  // Fiber
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  index: number;

  ref: null | unknown;

  pendingProps: any;
  memoizedProps: any;
  updateQueue: null | unknown;
  memoizedState: null | unknown;
  dependencies: null | unknown;

  mode: number;

  // Effects
  flags: number;
  //subtreeFlags: number;
  //deletions: number;
  lastEffect: unknown;

  lanes: number;
  childLanes: number;

  alternate: Fiber | null;
}

// reference: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts
export interface FiberOwner {
  context: unknown;
  props: any;
  refs: object;
  state: object;
  updater: object;
  _reactInternals: Fiber;

  setState(state: object, callback?: () => void): void;
  forceUpdate(callback?: () => void): void;

  // returns ReactNode
  render(): any;
}
