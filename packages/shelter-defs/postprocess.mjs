import { readdir, readFile, writeFile, stat } from "fs/promises";
import { join } from "path";

const replace = async (path, from, to) => await writeFile(path, (await readFile(path)).toString().replaceAll(from, to));

// we have more than one reference to shelter-ui, so just apply a blanket fix to future proof it a bit.
async function fixShelterUi(currentDir, depth = 0) {
  for (const entry of await readdir(currentDir)) {
    const statted = await stat(join(currentDir, entry));

    if (statted.isDirectory()) await fixShelterUi(join(currentDir, entry), depth + 1);
    else if (entry.endsWith(".d.ts")) {
      await replace(join(currentDir, entry), '"@uwu/shelter-ui/dist/', `"${"../".repeat(depth)}shelter-ui/src/`);
      await replace(join(currentDir, entry), '"@uwu/shelter-ui', `"${"../".repeat(depth)}shelter-ui/src/index`);
    }
  }
}

await fixShelterUi("dist");

await replace("dist/shelter-defs/rootdefs.d.ts", '"shelter', '"../shelter');

await replace("dist/shelter/src/storage.d.ts", '"@uwu/shelter-storage"', '"../../shelter-storage/index"');
