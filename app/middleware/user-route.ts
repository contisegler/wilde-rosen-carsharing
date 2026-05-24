export default defineNuxtRouteMiddleware((to) => {
  const user = useUser()

  if (!user.isLogged) {
    return navigateTo('/')
  }

  if (to.params.uid && to.params.uid !== user.uid) {
    return navigateTo('/')
  }
})
