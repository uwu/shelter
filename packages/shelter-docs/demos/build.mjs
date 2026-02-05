import { build } from "esbuild";
import { sassPlugin, postcssModules } from "esbuild-sass-plugin-ysink";
import { solidPlugin } from "esbuild-plugin-solid";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read compat.css from shelter-ui
const compatCss = readFileSync(resolve(__dirname, "../node_modules/@uwu/shelter-ui/compat.css"), "utf-8");

await build({
  entryPoints: [resolve(__dirname, "src/index.tsx")],
  bundle: true,
  outfile: resolve(__dirname, "dist/demos.js"),
  format: "esm",
  minify: true,
  sourcemap: true,
  target: "es2020",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  plugins: [
    {
      name: "inject-compat-css",
      setup(build) {
        build.onResolve({ filter: /^virtual:compat-css$/ }, () => ({
          path: "compat-css",
          namespace: "virtual",
        }));
        build.onLoad({ filter: /.*/, namespace: "virtual" }, () => ({
          contents: `export default ${JSON.stringify(compatCss)};`,
          loader: "js",
        }));
      },
    },
    sassPlugin({
      style: "compressed",
      sourceMap: false,
      transform: postcssModules({ localsConvention: "camelCaseOnly", inject: false }),
    }),
    solidPlugin(),
  ],
});

console.log("Demos built successfully!");
