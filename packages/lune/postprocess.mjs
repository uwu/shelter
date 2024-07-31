// @ts-check

import { readFile, writeFile } from "fs/promises";

const builtIndex = "dist/src/index.js";
await writeFile(
  builtIndex,
  "#!/usr/bin/env node --no-warnings=ExperimentalWarning\n" + (await readFile(builtIndex)).toString(),
);
