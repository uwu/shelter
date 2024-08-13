// written using idb-keyval by jake archibald as a guide, code is not copied from there
// to be on the safe side, idb-keyval license:
/*
Copyright 2016, Jake Archibald

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

function promisifyIdbReq<T>(request: IDBRequest<T> | IDBTransaction): Promise<T> {
  return new Promise((res, rej) => {
    if ("oncomplete" in request) request.oncomplete = () => res(undefined);
    else request.onsuccess = () => res(request.result);

    request.onerror = () => rej(request.error);
  });
}

export type DbStore = <T>(txm: IDBTransactionMode, cb: (s: IDBObjectStore) => T | PromiseLike<T>) => Promise<T>;

// all DBs must have their open()s start before the db actually opens
let storesToAdd: string[] = [];
let openProm: Promise<IDBDatabase>;
export async function open(store: string): Promise<DbStore> {
  const makeDbStore =
    (db: Promise<IDBDatabase>): DbStore =>
    (txm, cb) =>
      db.then((d) => cb(d.transaction(store, txm).objectStore(store)));

  storesToAdd.push(store);

  if (storesToAdd.length <= 1) {
    let res, rej;
    openProm = new Promise<IDBDatabase>((r, j) => ((res = r), (rej = j)));

    // check if we *need* to upgrade:
    const req1 = indexedDB.open("shelter");
    const sns = (await promisifyIdbReq(req1)).objectStoreNames;
    let needUpgrade = false;
    for (const store of storesToAdd) if (!sns.contains(store)) needUpgrade = true;

    //if (needUpgrade)
    const req = indexedDB.open("shelter", Date.now());
    req.onupgradeneeded = () => {
      for (const s of storesToAdd) if (!req.result.objectStoreNames.contains(s)) req.result.createObjectStore(s);

      storesToAdd = [];
    };
    openProm = promisifyIdbReq(req);
  }

  await openProm;
  return makeDbStore(promisifyIdbReq(indexedDB.open("shelter")));
}

export function get<T>(key: IDBValidKey, store: DbStore): Promise<T> {
  return store("readonly", (st) => promisifyIdbReq(st.get(key)));
}

export function getMult<T>(keys: IDBValidKey[], store: DbStore): Promise<T[]> {
  return store("readonly", (st) => Promise.all(keys.map((k) => promisifyIdbReq(st.get(k)))));
}

export function set<T>(key: IDBValidKey, value: T, store: DbStore): Promise<void> {
  return store("readwrite", (st) => promisifyIdbReq((st.put(value, key), st.transaction)));
}

export function setMult(entries: [IDBValidKey, any][], store: DbStore): Promise<void> {
  return store("readwrite", (st) => promisifyIdbReq((entries.forEach((e) => st.put(e[1], e[0])), st.transaction)));
}

export function remove(key: IDBValidKey, store: DbStore): Promise<void> {
  return store("readwrite", (st) => promisifyIdbReq((st.delete(key), st.transaction)));
}

export function removeMult(keys: IDBValidKey[], store: DbStore): Promise<void> {
  return store("readwrite", (st) => promisifyIdbReq((keys.forEach((e) => st.delete(e)), st.transaction)));
}

export function keys(store: DbStore) {
  return store("readonly", (st) => promisifyIdbReq(st.getAllKeys()));
}

export function entries(store: DbStore) {
  return store("readonly", (st) =>
    Promise.all([promisifyIdbReq(st.getAllKeys()), promisifyIdbReq(st.getAll())]).then(([k, v]) =>
      k.map((key, i) => [key, v[i]] as const),
    ),
  );
}
