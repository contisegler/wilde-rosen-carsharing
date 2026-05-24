export function useAuthHeaders() {
  const user = useUser()
  const { $auth } = useNuxtApp()

  // Reactive headers ref
  const authHeaders = ref<Record<string, string>>({})

  // Update headers when auth state changes
  watch(() => user.isLogged, async (isLogged) => {
    if (isLogged && $auth.currentUser) {
      try {
        const token = await $auth.currentUser.getIdToken()
        authHeaders.value = { Authorization: `Bearer ${token}` }
      } catch (error) {
        console.error('Error getting ID token:', error)
        authHeaders.value = {}
      }
    } else {
      authHeaders.value = {}
    }
  }, { immediate: true })

  return {
    authHeaders
  }
}
