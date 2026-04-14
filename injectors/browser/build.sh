pnpm web-ext build -on shelter-injector.zip
cp manifest.json .manifest.json
sed -i '/"scripts":/d' manifest.json
pnpm web-ext build -on shelter-injector-chrome.zip
mv .manifest.json manifest.json