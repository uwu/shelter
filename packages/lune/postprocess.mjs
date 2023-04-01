import { readFile, writeFile } from "fs/promises";

await writeFile("dist/index.js", "#!/usr/bin/env node\n" + (await readFile("dist/index.js")).toString());
