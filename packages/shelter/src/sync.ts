import { stores } from "./flux";
import { storage, defaults } from "./storage";

// TODO: Update to a real instance
export const defaultApiUrl = "http://localhost:3000";

export const syncStore = storage("sync");
defaults(syncStore, {
  syncIsAuthed: false,
  syncApiUrl: defaultApiUrl,
  syncLastUpdated: null,
});

export const getSyncURL = () => new URL(syncStore.syncApiUrl);

const getUser = () => {
  // @ts-expect-error
  const user = stores.UserStore.getCurrentUser();
  if (!user) throw new Error("User not yet logged in");
  return user;
};

export function getAuthCode() {
  const key = `${getSyncURL().origin}:${getUser().id}`;
  const secret = syncStore[key];
  if (!secret) return undefined;
  return window.btoa(`${secret}:${getUser().id}`);
}

export const authorize = (secret: string) => {
  const key = `${getSyncURL().origin}:${getUser().id}`;
  syncStore[key] = secret;
  syncStore.syncIsAuthed = true;
};

export const unauthorize = () => {
  const key = `${getSyncURL().origin}:${getUser().id}`;
  delete syncStore[key];
  syncStore.syncIsAuthed = false;
  syncStore.syncLastUpdated = null;
};
