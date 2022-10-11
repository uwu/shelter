import { build } from "esbuild";
//import { postcssModules, sassPlugin } from "esbuild-sass-plugin";
import { solidPlugin } from "esbuild-plugin-solid";
import cssModules from "esbuild-css-modules-plugin";

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/shelter.js",
  sourcemap: "external",
  minify: true,
  loader: {
    ".png": "dataurl",
    ".jpg": "dataurl",
    ".svg": "text",
  },
  plugins: [
    solidPlugin(),
    //sassPlugin({  style: "compressed", type: "css", sourceMap: false }),
    cssModules({
      inject: false,
      filter: /.+\.[tj]sx?\.css/g
    })
  ],
});

