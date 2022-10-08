import {build} from "esbuild";
import pluginBabel from "esbuild-plugin-babel";

build({
	entryPoints: ["src/index.ts"],
	bundle: true,
	outfile: "dist/shelter.js",
	sourcemap: "external",
	minify: true,
	plugins: [
		pluginBabel({
			config: {
				// unfortunately babel must transform the typescript, just having it parse it is not enough.
				presets: ["@babel/preset-typescript", "solid"]
			}
		})
	]
})