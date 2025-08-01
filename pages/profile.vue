<script setup lang="ts">
  import { updateProfile, signOut } from "firebase/auth"

  const user = useCurrentUser()
  const username = useUsername()
  const auth = useFirebaseAuth && useFirebaseAuth()
  const loginError = useLoginError()

  if (!user.value) navigateTo("/login")

  // display errors if any
  const error = ref<Error | null | undefined>(null)

  // Change name state and logic
  const changeName = ref("")
  const nameChangeAnswer = ref<string | null>(null)
  async function changeUserName() {
    if (!user.value) return
    await updateProfile(user.value, { displayName: changeName.value }).then(
      () => {
        console.log("Name changed")
        nameChangeAnswer.value = "Name erfolgreich geändert!"
        setTimeout(() => (nameChangeAnswer.value = null), 2000)
        error.value = null
        username.value = changeName.value
        changeName.value = ""
      },
      reason => {
        console.error("Failed name change", reason)
        nameChangeAnswer.value = "Name konnte nicht geändert werden!"
        setTimeout(() => (nameChangeAnswer.value = null), 2000)
        error.value = reason
        changeName.value = ""
      }
    )
  }

  function handleLogout() {
    if (!auth) return
    signOut(auth).then(
      () => {
        console.log("Signed out")
        loginError.value = null
        navigateTo("/")
      },
      reason => {
        console.error("Failed signOut", reason)
        loginError.value = reason
      }
    )
  }
</script>

<template>
  <DefaultPageStructure title="Profil">
    <HalfWidth>
    <div v-if="!user">
      Melde dich an, um dein Profil zu verwalten. Zur
      <NuxtLink to="/login">Anmeldung</NuxtLink>
      .
    </div>
    <div v-else>
      <div class="mb-5">Moin {{ user?.displayName }}, hier kannst du dein Profil und deine Einstellungen verwalten.</div>
      <form class="flex flex-col gap-2" @submit.prevent="changeUserName">
        <Input
          v-model="changeName"
          type="text"
          autocomplete="nickname"
          class="w-full"
          :placeholder="username"
        />
        <Button type="submit" variant="outline" size="lg" class="w-full font-bold">
          Namen ändern
        </Button>
        <div v-if="nameChangeAnswer" class="text-sm mt-1">
          {{ nameChangeAnswer }}
        </div>
      </form>
      <hr class="my-6">
      <Button variant="outline" size="lg" class="w-full font-bold" @click="handleLogout">
        Abmelden
      </Button>
    </div>
    </HalfWidth>
  </DefaultPageStructure>
</template>
