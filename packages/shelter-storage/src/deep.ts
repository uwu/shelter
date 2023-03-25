type Path = (string | symbol)[];

export interface DeepProxyHandler {
  apply?(path: Path, thisArg: any, args: any[]): any;

  construct?(path: Path, args: any[], newTarget: any): any;

  defineProperty?(path: Path, property: string | symbol, descriptor: PropertyDescriptor): boolean;

  deleteProperty?(path: Path, property: string | symbol): boolean;

  get?(path: Path, property: string | symbol): any;

  getOwnPropertyDescriptor?(path: Path, prop: string | symbol): undefined | PropertyDescriptor;

  has?(path: Path, prop: string | symbol): boolean;

  isExtensible?(path: Path): boolean;

  ownKeys?(path: Path): (string | symbol)[];

  preventExtensions?(path: Path): boolean;

  set?(path: Path, prop: string | symbol, value: any): boolean;

  setPrototypeof?(path: Path, prototype: object | null): boolean;
}

export const makeDeepProxy = (handler: DeepProxyHandler, init: object = {}) => {
  const makeProx = (init, ctxt: Path = []) => {
    const deepHandler = {
      get: !handler.get
        ? undefined
        : (_, p) => {
            const gotten = handler.get(ctxt, p);

            return typeof gotten === "object" && gotten !== null ? makeProx(gotten, [...ctxt, p]) : gotten;
          },
    };

    for (const k in handler) if (!deepHandler[k]) deepHandler[k] = (_, ...args) => handler[k](ctxt, ...args);

    return new Proxy(init, deepHandler);
  };

  return makeProx(init);
};
