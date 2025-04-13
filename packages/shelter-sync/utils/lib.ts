import { uint8ArrayToHex } from "uint8array-extras";
import type { DataExport } from "../../shelter/src/data";
export type { DataExport };
import { inflateSync as inflate, deflateSync as deflate } from "fflate";

export function generateSecret() {
  const randValues = new Uint8Array(64);
  crypto.getRandomValues(randValues);

  return uint8ArrayToHex(randValues);
}

export function compressData(data: string): Uint8Array {
  const encoded = new TextEncoder().encode(data);
  const compressed = deflate(encoded);
  return compressed;
}

export function decompressData(data: Uint8Array): string {
  const decompressed = inflate(new Uint8Array(data));
  const value = new TextDecoder().decode(decompressed);
  return value;
}
