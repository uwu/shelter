import { eventHandlerWithUser } from "~/utils/auth";

export default eventHandlerWithUser(async (event, user) => {
  if (!user.settings || !user.lastUpdated) {
    setResponseStatus(event, 404);
    return null;
  }

  const ifNoneMatch = getHeader(event, "if-none-match");
  if (ifNoneMatch && ifNoneMatch === user.lastUpdated) {
    setResponseStatus(event, 304);
    return null;
  }

  setHeader(event, "content-type", "application/json");
  setHeader(event, "etag", user.lastUpdated);

  return user.settings;
});
