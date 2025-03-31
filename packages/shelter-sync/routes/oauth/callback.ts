import { createUser, getUser } from "~/utils/drizzle";

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event);

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing code",
    });
  }

  const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI } = useRuntimeConfig(event);

  const formData = new FormData();
  formData.append("client_id", DISCORD_CLIENT_ID);
  formData.append("client_secret", DISCORD_CLIENT_SECRET);
  formData.append("grant_type", "authorization_code");
  formData.append("code", code.toString());
  formData.append("redirect_uri", DISCORD_REDIRECT_URI);
  formData.append("scope", "identify");

  const response = await $fetch<{ access_token: string }>("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: formData,
  });

  if (!response.access_token) {
    console.error(response);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get access token",
    });
  }

  const { access_token } = response;

  const userResponse = await $fetch<{ id: string }>("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!userResponse.id) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get user data",
    });
  }

  const { id: userId } = userResponse;

  // see if user already exists
  const user = await getUser(event, userId);
  let secret = user?.secret;

  if (!secret) {
    secret = generateSecret();

    await createUser(event, {
      id: userId,
      secret,
    });
  }

  // Set content type to HTML
  event.node.res.setHeader("Content-Type", "text/html");

  return /* html */ `
<!DOCTYPE html>
<html>
  <head>
    <title>Your Secret Key</title>
    <style>
    :root {
      --background: #18191b;
      --foreground: #b0b4ba;
      --accent: #3dd68c;
      --border: #2a2d31;
      --secret-bg: #232529;
      --button-bg: #18191b;
      --card-title: #edeef0;
      --card-bg: #d8f4f609;
      --font-sans:
        system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
        "Droid Sans", "Helvetica Neue", Arial, sans-serif;
      --font-mono:
        ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace",
        "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
      --radius: 6px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      min-height: 100vh;
      background-color: var(--background);
      color: var(--foreground);
      line-height: 1.2;
      font-family: var(--font-sans);
    }

    #layout {
      display: flex;
      flex-direction: column;
      max-width: 1280px;
      margin: auto;
      padding: 40px;
      gap: 24px;
    }

    .card {
      display: flex;
      flex-direction: column;
      padding: 22px 30px;
      gap: 12px;
      border-radius: var(--radius);
      background: var(--card-bg);
    }

    .card-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card-title {
      color: var(--card-title);
      font-size: 18px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .secret-container {
      margin: 1.5rem 0;
      padding: 1rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--secret-bg);
      font-family: var(--font-mono);
      word-break: break-all;
    }

    .copy-button {
      padding: .75rem 1.5rem;
      border: none;
      border-radius: var(--radius);
      background: var(--accent);
      color: var(--button-bg);
      font-weight: 500;
      font-size: 1rem;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: opacity .2s;
    }

    .copy-button:hover {
      opacity: .9;
    }

    .success-message {
      display: none;
      margin-top: 1rem;
      color: var(--accent);
      font-size: .875rem;
    }
    </style>
  </head>
  <body>
    <div id="layout">
      <section>
        <div class="card">
          <div class="card-heading">
            <div>
              <h3 class="card-title">
                Shelter Sync
              </h3>
            </div>
          </div>
          <div class="class-body">
            <div>Please save this secret key securely in the Authorize modal. You'll need it to authenticate Shelter Sync.</div>
            <div class="secret-container" id="secret">${secret}</div>
            <button class="copy-button" onclick="copySecret()">Copy to Clipboard</button>
            <p class="success-message" id="success">Copied to clipboard!</p>
          </div>
        </div>
      </section>
    </div>

    <script>
    function copySecret() {
      const secret = document.getElementById("secret").textContent;
      navigator.clipboard.writeText(secret).then(() => {
        const successMsg = document.getElementById("success");
        successMsg.style.display = "block";
        setTimeout(() => {
          successMsg.style.display = "none";
        }, 2000);
      });
    }
    </script>
  </body>
</html>
  `;
});
