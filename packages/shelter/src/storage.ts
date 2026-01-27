import { createShelterStorage as storage } from "@uwu/shelter-storage";

export { storage };
export {
  isShelterStorage,
  flush,
  createUnbackedStorage as unbacked,
  getSnapshotSignal as signalOf,
  defaults,
  isInited,
  waitInit,
} from "@uwu/shelter-storage";

export const dbStore: Record<string, any> = storage("dbstore");
