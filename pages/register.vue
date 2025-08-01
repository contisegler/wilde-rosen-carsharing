<script setup lang="ts">
  import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider,
  } from "firebase/auth"

  const auth = useFirebaseAuth()! // only exists on client side
  const user = useCurrentUser()
  const username = useUsername() // Registration state and logic

  const error = useLoginError()

  function signInWithGoogle() {
    signInWithPopup(auth, new GoogleAuthProvider()).then(
      ({ user: newUser }) => {
        console.log("Signed in with Google")
        username.value = newUser.displayName ?? ""
        error.value = null
        navigateTo("/")
      },
      reason => {
        console.error("Failed signinRedirect", reason)
        error.value = reason
      }
    )
  }

  const registerName = ref("")
  const registerEmail = ref("")
  const registerPassword = ref("")
  function registerWithEmail() {
    createUserWithEmailAndPassword(auth, registerEmail.value, registerPassword.value).then(
      ({ user: newUser }) => {
        updateProfile(newUser, { displayName: registerName.value }).then(
          () => {
            console.log("Name changed")
            error.value = null
            username.value = registerName.value
          },
          reason => {
            console.error("Failed name change", reason)
            error.value = reason
          }
        )
        console.log("Registered with email")
        error.value = null
        user.value = newUser
        navigateTo("/")
      },
      reason => {
        console.error("Failed registration", reason)
        error.value = reason
      }
    )
  }
</script>

<template>
  <DefaultPageStructure title="Registrieren">
    <HalfWidth>
      <div v-if="!user">
        <Button variant="outline" size="lg" class="w-full font-bold" @click="signInWithGoogle()">
          Registrieren mit Google
        </Button>
        <div class="flex items-center my-1 w-full">
          <hr class="flex-grow border-gray-300" />
          <span class="mx-3 text-gray-500 font-medium">oder</span>
          <hr class="flex-grow border-gray-300" />
        </div>
        <form class="flex flex-col gap-1" @submit.prevent="registerWithEmail">
          <Input
            v-model="registerName"
            type="text"
            placeholder="Name"
            autocomplete="nickname"
            class="w-full"
          />
          <Input
            v-model="registerEmail"
            type="email"
            placeholder="E-Mail"
            autocomplete="username"
            class="w-full"
          />
          <Input
            v-model="registerPassword"
            type="password"
            placeholder="Passwort"
            autocomplete="new-password"
            class="w-full"
          />
          <Button type="submit" variant="outline" size="lg" class="w-full font-bold">
            Registrieren mit E-Mail/Passwort
          </Button>
        </form>
      </div>
    </HalfWidth>
  </DefaultPageStructure>
</template>
