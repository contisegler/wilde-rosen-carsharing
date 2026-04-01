import { doc, getDoc } from "firebase/firestore"

export default defineNuxtRouteMiddleware(async (to, _) => {
  // Only run on client side where Firebase auth is available
  if (process.server) {
    return
  }

  const user = await getCurrentUser()

  if (!user) {
    return navigateTo({
      path: "/login",
      query: {
        redirect: to.fullPath,
      },
    })
  }

  const db = useFirestore()
  const userDocRef = doc(db, "users", user.uid)
  const userDocSnap = await getDoc(userDocRef)
  
  const isDeveloper = userDocSnap.exists() && userDocSnap.data()?.developer === true
  
  console.log('Developer middleware check:', {
    userId: user.uid,
    exists: userDocSnap.exists(),
    developer: userDocSnap.data()?.developer,
    isDeveloper
  })
  
  if (!isDeveloper) {
    
    useLoginError().value = new Error("You are not a developer")
    return navigateTo("/")
  }
})
