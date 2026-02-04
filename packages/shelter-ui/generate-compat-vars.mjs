import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const srcDir = new URL("./src", import.meta.url).pathname;

const INTERNAL_SLIDER_VARS = new Set(["--bar-offset", "--bar-size", "--grabber-size", "--track-bg", "--upper-half"]);

function getAllFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".scss") || entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractCssVariables(files) {
  const variables = new Set();

  // regex to extract var(--my-var) and --my-var
  const varFunctionPattern = /var\(\s*(--[\w-]+)\s*(?:,\s*[^)]+)?\)/g;
  const standaloneVarPattern = /["'`]\s*(--[\w-]+)\s*["'`]/g;

  for (const file of files) {
    const content = readFileSync(file, "utf-8");

    let match;
    while ((match = varFunctionPattern.exec(content)) !== null) {
      variables.add(match[1]);
    }

    while ((match = standaloneVarPattern.exec(content)) !== null) {
      if (match[1].startsWith("--")) {
        variables.add(match[1]);
      }
    }
  }

  // filter out shelter and slider vars
  const filteredVars = [...variables].filter((v) => !v.startsWith("--shltr-") && !INTERNAL_SLIDER_VARS.has(v));

  return filteredVars.sort();
}

const files = getAllFiles(srcDir);
const cssVariables = extractCssVariables(files);

const consoleScript = `
(function() {
  const styles = getComputedStyle(document.documentElement);
  const variables = ${JSON.stringify(cssVariables, null, 2)};

  const results = {};
  const notFound = [];

  variables.forEach(varName => {
    const value = styles.getPropertyValue(varName).trim();
    if (value) {
      results[varName] = value;
    } else {
      notFound.push(varName);
    }
  });

  let cssOutput = ':root {\\n';

  variables.forEach(varName => {
    if (results[varName]) {
      cssOutput += '  ' + varName + ': ' + results[varName] + ';\\n';
    } else {
      cssOutput += '  /* ' + varName + ': NOT FOUND */\\n';
    }
  });

  cssOutput += \`}
/* discord fonts */
@font-face {
  font-style: normal;
  font-weight: 800;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/fad1e8f9791cde986c61.woff2)
    format("woff2");
  font-family: "ABC Ginto Nord";
}

@font-face {
  font-style: italic;
  font-weight: 800;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/1dae98f83a4f199a9aee.woff2)
    format("woff2");
  font-family: "ABC Ginto Nord";
}

@font-face {
  font-style: normal;
  font-weight: 400;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/b9811218b3a54ad59fb2.woff2)
    format("woff2");
  font-family: "gg sans";
}

@font-face {
  font-style: italic;
  font-weight: 400;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/15551c6c9d4d1a96ba76.woff2)
    format("woff2");
  font-family: "gg sans";
}

@font-face {
  font-style: normal;
  font-weight: 500;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/f84e3e81b8d0718cd917.woff2)
    format("woff2");
  font-family: "gg sans";
}

@font-face {
  font-style: italic;
  font-weight: 500;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/099b34f1948afe9d15e4.woff2)
    format("woff2");
  font-family: "gg sans";
}

@font-face {
  font-style: normal;
  font-weight: 600;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/20ac37ed2576dd48d7dc.woff2)
    format("woff2");
  font-family: "gg sans";
}

@font-face {
  font-style: italic;
  font-weight: 600;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/36a7c3603a9c96bce18d.woff2)
    format("woff2");
  font-family: "gg sans";
}

@font-face {
  font-style: normal;
  font-weight: 700;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/3f46bbecb4287c0a829f.woff2)
    format("woff2");
  font-family: "gg sans";
}

@font-face {
  font-style: italic;
  font-weight: 700;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/6191b2ecd48873bed773.woff2)
    format("woff2");
  font-family: "gg sans";
}

@font-face {
  font-style: normal;
  font-weight: 800;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/f65e087dae83a0fdc637.woff2)
    format("woff2");
  font-family: "gg sans";
}

@font-face {
  font-style: italic;
  font-weight: 800;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/d5c9d3b86fab5ccc8ef2.woff2)
    format("woff2");
  font-family: "gg sans";
}

@font-face {
  font-style: normal;
  font-weight: 400;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/25f1e66664a140ac84c9.woff2)
    format("woff2");
  font-family: "Noto Sans";
}

@font-face {
  font-style: italic;
  font-weight: 400;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/9f0adc4ecabddcd298dc.woff2)
    format("woff2");
  font-family: "Noto Sans";
}

@font-face {
  font-style: normal;
  font-weight: 500;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/e0ece3c23b33d18f4d00.woff2)
    format("woff2");
  font-family: "Noto Sans";
}

@font-face {
  font-style: italic;
  font-weight: 500;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/818e8d4d506064aa57a3.woff2)
    format("woff2");
  font-family: "Noto Sans";
}

@font-face {
  font-style: normal;
  font-weight: 600;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/9a02726c2f8410020238.woff2)
    format("woff2");
  font-family: "Noto Sans";
}

@font-face {
  font-style: italic;
  font-weight: 600;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/08b2e52c725dc0d1a24a.woff2)
    format("woff2");
  font-family: "Noto Sans";
}

@font-face {
  font-style: normal;
  font-weight: 700;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/ee6b51adb64f6365352c.woff2)
    format("woff2");
  font-family: "Noto Sans";
}

@font-face {
  font-style: italic;
  font-weight: 700;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/4167dc814806444a69a5.woff2)
    format("woff2");
  font-family: "Noto Sans";
}

@font-face {
  font-style: normal;
  font-weight: 800;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/2850dd7b145576e8d7c7.woff2)
    format("woff2");
  font-family: "Noto Sans";
}

@font-face {
  font-style: italic;
  font-weight: 800;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/8318c9f278405382203e.woff2)
    format("woff2");
  font-family: "Noto Sans";
}

@font-face {
  font-style: normal;
  font-weight: 400;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/7645cb75533b9a614c7a.woff2)
    format("woff2");
  font-family: "Source Code Pro";
}

@font-face {
  font-style: normal;
  font-weight: 600;
  src: url(https://cdn.jsdelivr.net/gh/uwu/shelter@main/packages/shelter-assets/discord-fonts-mirror/cbb17c40dc4d56e70d10.woff2)
    format("woff2");
  font-family: "Source Code Pro";
}\`;


  if (notFound.length > 0) {
    console.warn("Variables not found:\\n", notFound.join('\\n'));
  }

  console.log(cssOutput);
})();
`;

console.log(consoleScript);
