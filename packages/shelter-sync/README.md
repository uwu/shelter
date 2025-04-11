# Shelter Sync

A data synchronization service for Shelter, built with Nitro and Cloudflare Workers.

## Development

```bash
pnpm install

pnpm -F shelter-sync dev
```

## Deployment

```bash
cd packages/shelter-sync
node --env-file-if-exists=.env --run build
node --env-file-if-exists=.env --run deploy
```
