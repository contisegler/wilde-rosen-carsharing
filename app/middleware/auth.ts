export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUser()
  
  if (!user.isLogged) {
    return navigateTo('/login')
  }
})
