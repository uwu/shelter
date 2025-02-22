import { store } from "./components/DataManagement";
import { stores } from "./flux";

// TODO: Update to a real instance
// NOTE: This needs a real backend hosted with https.
export const defaultApiUrl = "http://localhost:3000";
export const getSyncURL = () => new URL(store.syncApiUrl);

const getUser = () => {
  // @ts-expect-error
  const user = stores.UserStore.getCurrentUser();
  if (!user) throw new Error("User not yet logged in");
  return user;
};

export function getAuthCode() {
  const origin = getSyncURL().origin;
  const userId = getUser().id;

  return store[`${origin}:${userId}`] ?? undefined;
}

export const authorize = (secret: string) => {
  store[`${getSyncURL().origin}:${getUser().id}`] = secret;
  store.syncIsAuthed = true;
};

export const unauthorize = () => {
  delete store[`${getSyncURL().origin}:${getUser().id}`];
  store.syncIsAuthed = false;
};
