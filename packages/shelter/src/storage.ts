import { createShelterStorage as storage } from "@uwu/shelter-storage";

export { storage };
export {
  isShelterStorage,
  flush,
  createUnbackedStorage as unbacked,
  getSnapshotSignal as signalOf,
} from "@uwu/shelter-storage";

export let dbStore: Record<string, any>;
// TODO: this isn't great, bring back init buffering or something? maybe?
export let dbStoreInited = storage("dbstore").then((store) => {
  dbStore = store;
});
