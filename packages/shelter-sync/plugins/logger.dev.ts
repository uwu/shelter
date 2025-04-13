import { consola } from "consola";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    consola.start(`${event.method} ${event.path}`);
  });

  nitroApp.hooks.hook("error", (event, { body }) => {
    consola.error(event.message, event.message, body);
  });

  nitroApp.hooks.hook("afterResponse", (event) => {
    consola.success(`${event.method} ${event.path}`);
  });
});
