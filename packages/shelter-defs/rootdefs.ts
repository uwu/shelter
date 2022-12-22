import { ShelterApi } from "shelter/src/windowApi";

export { ShelterApi };

export * from "shelter/src/types";

declare global {
  const shelter: ShelterApi;

  // noinspection JSUnusedGlobalSymbols
  interface Window {
    shelter: ShelterApi;
  }
}
