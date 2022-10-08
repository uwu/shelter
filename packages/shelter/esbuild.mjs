import {build} from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";

build({
	entryPoints: ["src/index.ts"],
	bundle: true,
	outfile: "dist/shelter.js",
	sourcemap: "external",
	minify: true,
	plugins: [
		solidPlugin()
	]
})