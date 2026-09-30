import { after } from "spitroast";
const origDefineProperty = Object.defineProperty;

export default function (prop: string, patchDefine: boolean, filter?: (t: any) => boolean, qmt?: boolean) {
  const protoKey = Symbol(prop);
  let hitProto = false;
  let unpatchDefine: () => void;

  const cleanup = () => {
    unpatchDefine?.();
    if (!hitProto)
      // @ts-expect-error
      delete Object.prototype[prop];
  };

  return new Promise<any>((res) => {
    origDefineProperty(Object.prototype, prop, {
      configurable: true,
      enumerable: false,
      set(v: any) {
        if (this === Object.prototype) {
          hitProto = true;
          // @ts-expect-error
          Object.prototype[protoKey] = v;
          return;
        }

        origDefineProperty(this, prop, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: v,
        });

        const run = qmt ? queueMicrotask : (c: () => void) => c();

        run(() => {
          if (!filter || filter(this)) {
            cleanup();
            res(this);
          }
        });
      },

      get() {
        return this[protoKey];
      },
    });

    if (!patchDefine) return;
    unpatchDefine = after("defineProperty", Object, (args: any) => {
      if (args[1] === prop) {
        queueMicrotask(() => {
          if (!filter || filter(args[0])) {
            cleanup();
            res(args[0]);
          }
        });
      }
    });
  });
}
