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

export function open(db: string, store: string): DbStore {
  const req = indexedDB.open(db);
  req.onupgradeneeded = () => req.result.createObjectStore(store);
  const prom = promisifyIdbReq(req);

  return (txm, cb) => prom.then((db) => cb(db.transaction(store, txm).objectStore(store)));
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
