# Backend for shelter settings sync

This worker stores the data, and handles the role of intermediary for OAuth2.

## Logging in

1. Go to the Discord auth page (opening the worker's URL directly in a browser redirects you automatically)
2. Log in and authorize shelter sync
3. You will be sent the Discord OAuth & refresh tokens, and token expiration time. It is the client's responsibility to refresh the token.

## Syncing

The settings data is JSON that looks like this:

```json
{
  "timestamp": 1684138719,
  "db": {
    "logDispatch": false
  },
  "plugins": {
    "plugin-id": {
      "js": "<javascript code>",
      "on": true,
      "update": true,
      "src": "https://author.github.io/plugins/plugin-name/",
      "manifest": {
        "name": "My Plugin",
        "description": "A cool plugin!",
        "hash": "7f006b90417ec750f770a18bf752e9fb",
        "author": "A cool person"
      }
    }
  }
}
```

To be more specific, `plugins` is the output of `shelter.plugins.installedPlugins()`,
and `db` is the contents of the internal `dbStore`.

`timestamp` is the time (UNIX timestamp, seconds, UTC), when the last upload happened.
It is suggested that you offer the user a prompt when a conflict occurs.

To use any of these endpoints, a valid Discord OAuth token for your account (see above) must be included in the `Authorization` header, like so:
`Authorization: Bearer TRVQ2uNOln7QIYoFrc5AtE********` (last 8 characters redacted).

To download your synced settings, `GET /api/download`.

To upload new settings, `PUT /api/upload`, with the JSON in the payload.

To delete ALL of your data from shelter-sync immediately, `DELETE /api/delete`.
