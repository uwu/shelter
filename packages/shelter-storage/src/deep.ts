export type ObjPath = (string | symbol)[];

export interface DeepProxyHandler {
  apply?(path: ObjPath, thisArg: any, args: any[]): any;

  construct?(path: ObjPath, args: any[], newTarget: any): any;

  defineProperty?(path: ObjPath, property: string | symbol, descriptor: PropertyDescriptor): boolean;

  deleteProperty?(path: ObjPath, property: string | symbol): boolean;

  get?(path: ObjPath, property: string | symbol): any;

  getOwnPropertyDescriptor?(path: ObjPath, prop: string | symbol): undefined | PropertyDescriptor;

  has?(path: ObjPath, prop: string | symbol): boolean;

  isExtensible?(path: ObjPath): boolean;

  ownKeys?(path: ObjPath): (string | symbol)[];

  preventExtensions?(path: ObjPath): boolean;

  set?(path: ObjPath, prop: string | symbol, value: any): boolean;

  setPrototypeof?(path: ObjPath, prototype: object | null): boolean;
}

export function makeDeepProxy<T extends {}>(handler: DeepProxyHandler, init?: T) {
  const makeProx = <T2>(init: T2, ctxt: ObjPath = []) => {
    const deepHandler = {
      get: !handler.get
        ? undefined
        : (_, p) => {
            const gotten = handler.get(ctxt, p);

            return typeof gotten === "function" || (typeof gotten === "object" && gotten !== null)
              ? makeProx(gotten, [...ctxt, p])
              : gotten;
          },
    };

    for (const k in handler) {
      deepHandler[k] ??= (_, ...args) => handler[k](ctxt, ...args);
    }

    return new Proxy(init, deepHandler);
  };

  return makeProx<T>(init ?? ({} as any)); // as any :D
}
