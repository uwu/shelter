import { consola } from "consola";
import { migrate } from "drizzle-orm/d1/migrator";

// TODO: figure out what way to go for this
export default defineNitroPlugin(async () => {
  await migrate(useDrizzle(), {
    migrationsFolder: "database/migrations",
  })
    .then(() => {
      consola.withTag("migrations").withTag("d1").success("Database migrations done");
    })
    .catch((err) => {
      consola.withTag("migrations").withTag("d1").error("Database migrations failed", err);
    });
});
