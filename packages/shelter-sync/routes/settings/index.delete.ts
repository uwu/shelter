import { deleteUser } from "~/utils/drizzle";

export default eventHandlerWithUser(async (event, user) => {
  await deleteUser(event, user.id);

  return {
    message: "User settings deleted successfully",
  };
});
