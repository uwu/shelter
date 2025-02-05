import { createClient } from "@libsql/client";
import { consola } from "consola";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../database/schema";

export default defineNitroPlugin((nitroApp) => {
  try {
    // @ts-ignore: type not inherited
    nitroApp.$drizzle = drizzle(createClient({ url: "file:dev.sqlite" }), {
      schema,
    });
  } catch (error) {
    consola.withTag("drizzle").withTag("dev").error("Drizzle failed", error);
  }
});
