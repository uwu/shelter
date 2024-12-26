import type { Plugin } from "rolldown";

export const ShelterSolidResolver = (): Plugin => {
  const resolverRoots = {
    "solid-js": "solid",
  };

  return {
    name: "lune:rolldown:shelter-solid-resolver",
    async resolveId(source) {
      if (/solid-js(?:\/web|\/store)?/.test(source)) {
        return {
          id: source,
          // Use Rolldown's virtual module marker
          external: false,
          meta: {
            isShelterSolid: true,
          },
        };
      }
      return null;
    },

    load: (id) => {
      // TODO: Use `meta` once it's supported, unless i can do this better
      if (/solid-js(?:\/web|\/store)?/.test(id)) {
        const pathSplit = id.split("/");
        const resolvedPath =
          resolverRoots[pathSplit[0]] +
          pathSplit
            .slice(1)
            .map((s) => s[0].toUpperCase() + s.slice(1))
            .join("");
        return {
          moduleType: "js",
          code: `module.exports = shelter.${resolvedPath}`,
        };
      }

      return null;
    },
  };
};
