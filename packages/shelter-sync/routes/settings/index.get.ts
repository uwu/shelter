import { deflateSync as deflate } from "fflate";

export default eventHandlerWithUser(async (event, user) => {
  const now = Date.now();

  if (user.lastUpdated && user.lastUpdated.getTime() === now) {
    return {
      settings: null,
    };
  }

  const dataString = user.settings;
  const data = new TextEncoder().encode(dataString);
  const compressed = deflate(data);

  setHeader(event, "content-type", "application/octet-stream");
  setHeader(event, "etag", user.lastUpdated.toISOString());

  // return compressed as response body
  return compressed;
});
