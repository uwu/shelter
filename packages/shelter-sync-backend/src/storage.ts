const ALLOWED_CLIENTS = [
  // shelter
  "s",
  // our good frens over at Vendetta :)
  "vd",
] as const;

type AllowedClientsT = typeof ALLOWED_CLIENTS[number];
type KVRecord = Record<AllowedClientsT, Record<string, any>>;

const isClientAllowed = (c: any): c is AllowedClientsT => ALLOWED_CLIENTS.includes(c);

export async function delete_(kv: KVNamespace, uid: string, client: undefined | string, all: boolean) {
  client ??= ALLOWED_CLIENTS[0];
  if (!isClientAllowed(client)) return new Error("disallowed client");

  if (all) await kv.delete(uid);
  else {
    const existing = await kv.get(uid);
    const kvParsed: KVRecord = existing ? JSON.parse(existing) : {};

    delete kvParsed[client];

    await kv.put(uid, JSON.stringify(kvParsed));
  }
}

export async function upload(kv: KVNamespace, uid: string, client: undefined | string, data: string) {
  client ??= ALLOWED_CLIENTS[0];
  if (!isClientAllowed(client)) return new Error("disallowed client");

  let modParsed: any;
  try {
    modParsed = JSON.parse(data);
  } catch (e) {
    return e as SyntaxError;
  }

  const existing = await kv.get(uid);
  const kvParsed: KVRecord = existing ? JSON.parse(existing) : {};

  kvParsed[client] = {
    ...modParsed,
    timestamp: ~~(Date.now() / 1000),
  };

  await kv.put(uid, JSON.stringify(kvParsed));
}
