import type { Plugin } from "esbuild";

export const ShelterSolidResolver = (): Plugin => {
  const resolverRoots = {
    "solid-js": "solid",
  };
  return {
    name: "shelter-solid-resolver",
    setup(build) {
      build.onResolve({ filter: /solid-js(?:\/web|\/store)?/ }, ({ path }) => ({
        path,
        namespace: "shltr-res-ns",
      }));
      build.onLoad({ filter: /.*/, namespace: "shltr-res-ns" }, ({ path }) => {
        const pathSplit = path.split("/");
        const resolvedPath =
          resolverRoots[pathSplit[0]] +
          pathSplit
            .slice(1)
            .map((s) => s[0].toUpperCase() + s.slice(1))
            .join("");

        return {
          contents: `module.exports = shelter.${resolvedPath}`,
          loader: "js",
        };
      });
    },
  };
};
