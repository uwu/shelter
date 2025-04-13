import { eventHandlerWithUser } from "~/utils/auth";
import type { DataExport } from "~/utils/lib";

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

  setHeader(event, "Content-Type", "application/json");
  setHeader(event, "etag", user.lastUpdated);

  return user.settings;
});
