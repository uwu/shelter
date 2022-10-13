export interface Dispatcher {
  // not typing this lol
  _actionHandlers: unknown;

  _currentDispatchActionType: undefined | string;
  _interceptor: (payload: any) => undefined | boolean;
  _processingWaitQueue: boolean;
  _subscriptions: Record<string, Set<(payload: any) => void>>;
  _waitQueue: unknown[];

  addDependencies(node1: any, node2: any): void;

  dispatch(payload: any): Promise<void>;

  flushWaitQueue(): void;

  isDispatching(): boolean;

  register(name: string, actionHandler: Record<string, (e: any) => void>, storeDidChange: (e: any) => boolean): string;

  setInterceptor(interceptor: (payload: any) => undefined | boolean): void;

  subscribe(actionType: string, callback: (payload: any) => void);

  unsubscribe(actionType: string, callback: (payload: any) => void);

  wait(cb: () => void): void;

  _dispatch(payload: any, t: unknown): Promise<void>;

  _dispatchWithDevtools(payload: any): void;

  _dispatchWithLogging(payload: any): void;
}

interface FluxStoreChangeCallbacks {
  add(cb: () => void): void;

  addConditional(cb: () => boolean): void;

  listeners: Set<() => void>;

  remove(cb: () => void): void;

  has(cb: () => void): boolean;

  hasAny(): boolean;

  invokeAll(): void;
}

export type FluxStore<T = any> = T & {
  addChangeListener(cb: () => void): void;
  removeChangeListener(cb: () => void): void;
  addReactChangeListener(cb: () => void): void;
  removeReactChangeListener(cb: () => void): void;
  addConditionalChangeListener(cb: () => boolean): void;

  callback(cb: () => void): void;
  throttledCallback(): unknown; // idk what the hell this does

  _changeCallbacks: FluxStoreChangeCallbacks;
  _isInitialized: true;
  _version: number;
  _reactChangeCallbacks: FluxStoreChangeCallbacks;
};

export interface Fiber {
  // Instance
  tag: number;
  key: string | null;
  elementType: Function | string | null;
  type: Function | string | null;
  stateNode:
    | Element
    | null
    | {
        context: object;
        props: any;
        refs: object;
        state: object;
        updater: object;
        _reactInternals: Fiber;
      };

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
