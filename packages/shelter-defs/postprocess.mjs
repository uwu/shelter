import { readFile, writeFile } from "fs/promises";

const replace = async (path, from, to) => await writeFile(path, (await readFile(path)).toString().replaceAll(from, to));

await replace("dist/shelter/src/windowApi.d.ts", '"shelter-ui', '"../../shelter-ui/src');

await replace("dist/shelter-defs/rootdefs.d.ts", '"shelter', '"../shelter');
