// settings syncing

import { dbStore, waitInit } from "./storage";
import { log, sleep } from "./util";

export const isEnabled = () => !!dbStore.doSync;

const DEFAULT_SERVER = "http://localhost:8787/"; //"https://sheltersync.uwunet.workers.dev/";

export const serverUrl = () => dbStore.syncServer ?? DEFAULT_SERVER;
const route = (path: string) => new URL(path, serverUrl().endsWith("/") ? serverUrl() : serverUrl() + "/").href;

const pollRoute = (state?: string) => route("api/poll") + (state ? `?state=${state}` : "");
const refreshRoute = (tok: string) => route("api/refresh") + `?tok=${tok}`;
const upRoute = () => route("api/upload");
const downRoute = () => route("api/download");
const delRoute = () => route("api/delete");

const POLL_TIMEOUT = 5 * 60 * 1000; // 5 mins
const POLL_INTERVAL = 3 * 1000; // 5 secs

const processTokenResp = (res: string) => {
  const obj = JSON.parse(atob(res));
  if (!obj?.access_token || !obj.expires_in || !obj.refresh_token) throw new Error("invalid response obj");
  return {
    access_token: obj.access_token,
    refresh_token: obj.refresh_token,
    expiry: ~~(Date.now() / 1000) + obj.expires_in,
  };
};

function pollForCompletion(state: string) {
  let cancel = false;
  const cancelFn = () => {
    cancel = true;
  };

  return [
    cancelFn,
    (async () => {
      setTimeout(cancelFn, POLL_TIMEOUT);

      while (!cancel) {
        const res = await fetch(pollRoute(state));
        if (res.ok) return res.text();

        await sleep(POLL_INTERVAL);
      }
    })(),
  ] as const;
}

// returns false if not authed, true if authed or successfully refreshed
export async function updateAuth() {
  if (!dbStore.auth?.access_token || !dbStore.auth.expiry || !dbStore.auth.refresh_token) return false;

  // refresh
  if (Date.now() / 1000 > dbStore.auth.expiry) {
    const res = await fetch(refreshRoute(dbStore.auth.refresh_token), { method: "POST" });
    if (res.ok) {
      dbStore.auth = processTokenResp(await res.text());
      return true;
    } else return false;
  }

  // test current token just to be sure
  return (
    await fetch("https://discord.com/api/v6/users/@me", {
      headers: { Authorization: `Bearer ${dbStore.auth.access_token}` },
    })
  ).ok;
}

function handleLogin(state?: string) {
  let res: (s: string) => void;
  const promise = new Promise<string>((r) => (res = r));

  let receiveResp = res;

  if (state) {
    const [stopPolling, pollProm] = pollForCompletion(state);
    receiveResp = (r: string) => {
      stopPolling();
      res(r);
    };

    pollProm.then(res);
  } else {
    setTimeout(res, POLL_TIMEOUT);
  }

  return [
    receiveResp,
    promise.then((auth) => {
      if (auth) dbStore.auth = processTokenResp(auth);
    }),
  ] as const;
}

export async function sync() {
  await waitInit(dbStore);
  if (!isEnabled()) return;
  try {
    new URL(serverUrl());
  } catch (e) {
    log(["Could not sync due to invalid server URL", e], "error");
    return;
  }
}
