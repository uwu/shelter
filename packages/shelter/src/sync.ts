import { stores } from "./flux";
import { storage, defaults } from "./storage";

// TODO: Update to a real instance
// NOTE: This needs a real backend hosted with https.
export const defaultApiUrl = "http://localhost:3000";
export const getSyncURL = () => new URL(store.syncApiUrl);

export const store = storage("sync");
defaults(store, {
  syncIsAuthed: false,
  syncApiUrl: defaultApiUrl,
  syncLastUpdated: null,
});

const getUser = () => {
  // @ts-expect-error
  const user = stores.UserStore.getCurrentUser();
  if (!user) throw new Error("User not yet logged in");
  return user;
};

export function getAuthCode() {
  const key = `${getSyncURL().origin}:${getUser().id}`;
  const secret = store[key];
  if (!secret) return undefined;
  return window.btoa(`${secret}:${getUser().id}`);
}

export const authorize = (secret: string) => {
  const key = `${getSyncURL().origin}:${getUser().id}`;
  store[key] = secret;
  store.syncIsAuthed = true;
};

export const unauthorize = () => {
  const key = `${getSyncURL().origin}:${getUser().id}`;
  delete store[key];
  store.syncIsAuthed = false;
  store.syncLastUpdated = null;
};
