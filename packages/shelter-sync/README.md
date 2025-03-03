# Shelter Sync

A data synchronization service for Shelter, built with Nitro and Cloudflare Workers.

## API Endpoints

### Base Endpoint
- `GET /` - Health check endpoint that returns a status indicating if the service is running

### OAuth Endpoints
- `GET /oauth/callback` - Discord OAuth callback endpoint
  - Query Parameters:
    - `code` (required): The authorization code from Discord
  - Response:
    - Success (200): Returns `{ secret: string }` - User's unique synchronization secret
    - Error (400): Missing code
    - Error (500): Failed to get access token or user data

### Settings Endpoints
- `GET /settings` - Retrieve user settings
  - Headers:
    - Authorization: Required for user authentication
  - Response:
    - Success (200): Returns compressed settings data as octet-stream
    - Headers:
      - content-type: application/octet-stream
      - etag: Last update timestamp
    - Returns null if no changes since last update

- `PUT /settings` - Update user settings
  - Headers:
    - Authorization: Required for user authentication
  - Body: Compressed settings data
  - Response:
    - Success (200): Settings updated successfully

- `DELETE /settings` - Delete user settings
  - Headers:
    - Authorization: Required for user authentication
  - Response:
    - Success (200): Settings deleted successfully

Note: All settings endpoints require user authentication via the Authorization header obtained through the OAuth flow.