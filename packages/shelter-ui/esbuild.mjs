import { build } from "esbuild";
import { postcssModules, sassPlugin } from "esbuild-sass-plugin-ysink";

build({
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outfile: "dist/index.jsx",
  format: "esm",
  sourcemap: "external",
  minify: false,
  external: ["solid-js"],
  jsx: "preserve",
  plugins: [
    sassPlugin({
      style: "compressed",
      sourceMap: false,
      transform: postcssModules({ localsConvention: "camelCaseOnly", inject: false }),
    }),
  ],
});
