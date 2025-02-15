import { uint8ArrayToHex } from "uint8array-extras";
import { type InferOutput, array, boolean, date, literal, number, object, record, string, union } from "valibot";

export const UserDataSchema = object({
  id: string(),
  updatedAt: date(),
  settings: object({
    plugins: record(
      string(),
      object({
        js: string(),
        on: boolean(),
        src: string(),
        update: boolean(),
        manifest: object({
          name: string(),
          author: string(),
          description: string(),
          hash: string(),
        }),
        settings: record(string(), union([string(), number(), boolean(), literal(null), array(string())])),
      }),
    ),
  }),
});

export type UserData = InferOutput<typeof UserDataSchema>;

export function generateSecret() {
  const randValues = new Uint8Array(64);
  crypto.getRandomValues(randValues);

  return uint8ArrayToHex(randValues);
}
