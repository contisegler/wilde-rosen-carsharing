export default defineNuxtRouteMiddleware(async (to, _) => {
  const user = await getCurrentUser()

  // redirect the user to the login page if not logged in
  if (!user) {
    return navigateTo({
      path: "/login",
      query: {
        redirect: to.fullPath,
      },
    })
  }
})
