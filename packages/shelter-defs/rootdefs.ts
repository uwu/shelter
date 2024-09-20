import { ShelterApi } from "shelter/src/windowApi";
import { ShelterPluginApi } from "shelter/src/plugins";

export type { ShelterApi };
export type { ShelterPluginApi };

export * from "shelter/src/types";

declare global {
  const shelter: ShelterApi & { plugin: ShelterPluginApi };

  // noinspection JSUnusedGlobalSymbols
  interface Window {
    shelter: ShelterApi;
  }
}
