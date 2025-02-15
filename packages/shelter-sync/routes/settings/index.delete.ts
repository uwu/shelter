export default eventHandlerWithUser(async (event, user) => {
  await useDrizzle()
    .update(tables.users)
    .set({
      settings: null,
      lastUpdated: new Date(Date.now()),
    })
    .where(eq(tables.users.id, user.id));

  return {
    message: "User settings deleted successfully",
  };
});
