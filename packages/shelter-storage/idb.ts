import { deleteDB, IDBPDatabase, openDB } from "idb";

const dbName = "shelter";

let currentDatabase: IDBPDatabase | undefined;

// used to queue / buffer operations initially and also if we need to close and reopen the db
let dbReadyPromise: Promise<void>;

// used so multiple calls to ensureDbReady immediately after each other only do one db open/close/upgrade/open cycle
// rather than having to open/close the db many times
let storesToAdd: string[] = [];

export function ensureDbReady(storeName: string) {
  if (currentDatabase?.objectStoreNames.contains(storeName)) return Promise.resolve();

  storesToAdd.push(storeName);

  if (storesToAdd.length > 1) return dbReadyPromise;

  const openProm = (async () => {
    if (currentDatabase) {
      currentDatabase.close();
    }

    const database = await openDB(dbName);

    // check if we need to upgrade
    let upgradeNeeded = false;
    for (const neededName of storesToAdd)
      if (!database.objectStoreNames.contains(neededName)) {
        upgradeNeeded = true;
        break;
      }

    if (!upgradeNeeded) return database;

    // theres missing stores, trigger an upgrade.
    const newVer = database.version + 1;
    database.close();

    return openDB(dbName, newVer, {
      upgrade(database) {
        let storeToAdd: string;
        while ((storeToAdd = storesToAdd.shift())) {
          if (!database.objectStoreNames.contains(storeToAdd)) database.createObjectStore(storeToAdd);
        }
      },
    });
  })();

  return (dbReadyPromise = openProm.then((db) => {
    currentDatabase = db;
  }));
}

const executeDbOperation = <TRet>(fn: () => TRet) => dbReadyPromise.then(() => fn());

export const get = async (storeName: string, key: string) =>
  executeDbOperation(() => currentDatabase.get(storeName, key));

export const set = async (storeName: string, key: string, value: any) =>
  executeDbOperation(() => currentDatabase.put(storeName, value, key));

export const keys = async (storeName: string) => executeDbOperation(() => currentDatabase.getAllKeys(storeName));

export const entries = async (storeName: string) =>
  executeDbOperation(async () => {
    const tx = currentDatabase.transaction(storeName, "readonly");
    const keys = await tx.store.getAllKeys();

    return Promise.all(keys.map((k) => tx.store.get(k).then((v) => [k, v] as const)));
  });

export const delete_ = async (storeName: string, key: string) =>
  executeDbOperation(() => currentDatabase.delete(storeName, key));

export const setAllFromObject = async (storeName: string, obj: object) =>
  executeDbOperation(async () => {
    const tx = currentDatabase.transaction(storeName, "readwrite");

    // copy object in
    await Promise.all(Object.keys(obj).map((k) => tx.store.put(obj[k], k)));

    // remove keys that shouldn't be there
    const keys = await tx.store.getAllKeys();
    await Promise.all(keys.filter((k) => !((k as string) in obj)).map((k) => tx.store.delete(k)));
  });

export function queueDatabaseDeletion() {
  deleteDB(dbName);
}
