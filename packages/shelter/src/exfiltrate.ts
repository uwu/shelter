const current = new Set<string>();

export default function (prop: string, filter?: (t: any) => boolean) {
  if (current[prop]) throw new Error(`Already exfiltrating ${prop}!`);

  const protoKey = Symbol(prop);
  let hitProto = false;

  return new Promise<any>((res) => {
    Object.defineProperty(Object.prototype, prop, {
      configurable: true,
      enumerable: false,
      set(v: any) {
        debugger;
        if (this === Object.prototype) {
          hitProto = true;
          Object.prototype[protoKey] = v;
          return;
        }

        Object.defineProperty(this, prop, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: v,
        });

        if (!filter || filter(this)) {
          res(this);
          if (!hitProto) delete Object.prototype[prop];
        }
      },

      get() {
        debugger;
        return this[protoKey];
      },
    });
  });
}
