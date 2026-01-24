import { promisify } from "util";
import { execFile } from "child_process";
import { formatISO9075 } from "date-fns";
import pkg from "../../package.json" assert { type: "json" };

async function tryGetGitHash() {
  try {
    const res = await promisify(execFile)("git", ["rev-parse", "--short", "HEAD"]);
    return res.stdout.trim();
  } catch {}
}

export const buildMetadata = async () => ({
  build: {
    time: formatISO9075(new Date()),
    version: pkg.version,
    commit: await tryGetGitHash(),
  },
});
