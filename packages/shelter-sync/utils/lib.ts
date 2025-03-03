import { uint8ArrayToHex } from "uint8array-extras";
import type { DataExport } from "../../shelter/src/data";
export type { DataExport };

export function generateSecret() {
  const randValues = new Uint8Array(64);
  crypto.getRandomValues(randValues);

  return uint8ArrayToHex(randValues);
}
