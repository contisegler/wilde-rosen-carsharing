<script setup lang="ts">
  import { updateProfile } from "firebase/auth"

  definePageMeta({
    middleware: "auth",
  })

  const route = useRoute()
  const userId = route.params.userId as string
  const user = useCurrentUser()
  const username = useUsername()

  // Check if user is viewing their own settings
  const isOwnSettings = computed(() => user.value?.uid === userId)

  // Redirect if not own settings
  if (!isOwnSettings.value && user.value) {
    navigateTo(`/users/${user.value.uid}/settings`)
  }

  if (!user.value) navigateTo("/login")

  const error = ref<Error | null | undefined>(null)

  const changeName = ref("")
  const nameChangeAnswer = ref<string | null>(null)
  async function changeUserName() {
    if (!user.value) return
    await updateProfile(user.value, { displayName: changeName.value }).then(
      () => {
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

</script>

<template>
  <DefaultPageStructure>
    <template #title>Einstellungen</template>
    <HalfWidth>
      <div v-if="!user">
        Melde dich an, um deine Einstellungen zu verwalten. Zur
        <NuxtLink to="/login">Anmeldung</NuxtLink>
        .
      </div>
      <div v-else>
        <div class="mb-5">
          Moin {{ user?.displayName }}, hier kannst du dein Profil und deine Einstellungen
          verwalten.
        </div>
        <div class="mb-6">
          <div class="mb-3">
            <div class="text-sm font-semibold text-gray-600">Name</div>
            <div class="text-lg">{{ user?.displayName || "Nicht angegeben" }}</div>
          </div>
          <div>
            <div class="text-sm font-semibold text-gray-600">E-Mail</div>
            <div class="text-lg">{{ user?.email || "Nicht angegeben" }}</div>
          </div>
        </div>
        <form class="flex flex-col gap-2" @submit.prevent="changeUserName">
          <Input
            v-model="changeName"
            type="text"
            autocomplete="nickname"
            class="w-full"
            :placeholder="user?.displayName"
          />
          <Button type="submit" variant="outline" size="lg" class="w-full font-bold">
            Namen ändern
          </Button>
          <div v-if="nameChangeAnswer" class="text-sm mt-1">
            {{ nameChangeAnswer }}
          </div>
        </form>
      </div>
    </HalfWidth>
  </DefaultPageStructure>
</template>
