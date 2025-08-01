<script setup lang="ts">
  import { signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider } from "firebase/auth"

  const route = useRoute()
  const redirectTo = route.query.redirect as string || '/'
  const auth = useFirebaseAuth()! // only exists on client side
  const user = useCurrentUser()
  const username = useUsername()

  const email = ref("")
  const password = ref("")

  // display errors if any
  const error = useLoginError()

  function signInWithGoogle() {
    signInWithPopup(auth, new GoogleAuthProvider()).then(
      ({ user: newUser }) => {
        console.log("Signed in with Google")
        username.value = newUser.displayName ?? ""
        error.value = null
        navigateTo(redirectTo)
      },
      reason => {
        console.error("Failed signinRedirect", reason)
        error.value = reason
      }
    )
  }

  function signInWithEmail() {
    signInWithEmailAndPassword(auth, email.value, password.value).then(
      ({ user: newUser }) => {
        console.log("Signed in with email")
        username.value = newUser.displayName ?? ""
        error.value = null
        navigateTo(redirectTo)
      },
      reason => {
        console.error("Failed signinRedirect", reason)
        error.value = reason
      }
    )
  }
</script>

<template>
  <DefaultPageStructure title="Anmelden">
    <HalfWidth>
      <div v-if="!user">
        <Button variant="outline" size="lg" class="w-full font-bold" @click="signInWithGoogle()">
          Anmelden mit Google
        </Button>
        <div class="flex items-center my-1 w-full">
          <hr class="flex-grow border-gray-300" />
          <span class="mx-3 text-gray-500 font-medium">oder</span>
          <hr class="flex-grow border-gray-300" />
        </div>
        <form class="flex flex-col gap-1" @submit.prevent="signInWithEmail">
          <Input
            v-model="email"
            type="email"
            placeholder="E-Mail"
            autocomplete="username"
            class="w-full"
          />
          <Input
            v-model="password"
            type="password"
            placeholder="Passwort"
            autocomplete="current-password"
            class="w-full"
          />
          <Button type="submit" variant="outline" size="lg" class="w-full font-bold">
            Anmelden mit E-Mail/Passwort
          </Button>
        </form>
        <div class="flex items-center my-4 w-full">
          <hr class="flex-grow border-gray-300" />
          <span class="mx-3 text-gray-500 font-medium">Noch kein Konto?</span>
          <hr class="flex-grow border-gray-300" />
        </div>
        <NuxtLink to="/register" class="w-full">
          <Button variant="outline" size="lg" class="w-full font-bold">
            Mit E-Mail/Passwort Registrieren
          </Button>
        </NuxtLink>
      </div>
      <div v-else>
        Moin {{ user?.displayName }}, hier geht es zurück zur
        <NuxtLink to="/">Startseite</NuxtLink>
        .
      </div>
    </HalfWidth>
  </DefaultPageStructure>
</template>
