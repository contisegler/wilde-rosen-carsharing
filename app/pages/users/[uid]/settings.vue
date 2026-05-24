<script setup lang="ts">
import { updateProfile } from 'firebase/auth'

definePageMeta({
  middleware: 'user-route',
})

const user = useUser()
const { $auth } = useNuxtApp()

const changeName = ref(user.userData?.displayName || '')
const nameChangeAnswer = ref<string | null>(null)
const nameChangeError = ref<Error | null>(null)

async function changeUserName() {
  if (!$auth.currentUser) return
  try {
    await updateProfile($auth.currentUser, { displayName: changeName.value })
    await user.patch({ displayName: changeName.value })
    nameChangeAnswer.value = 'Name erfolgreich geändert!'
    nameChangeError.value = null
  } catch (reason: any) {
    console.error('Failed name change', reason)
    nameChangeAnswer.value = 'Name konnte nicht geändert werden!'
    nameChangeError.value = reason
  } finally {
    setTimeout(() => (nameChangeAnswer.value = null), 2000)
  }
}

async function handleLogout() {
  await user.logout()
  navigateTo('/')
}
</script>

<template>
  <div>
    <h2 class="text-xl font-bold mb-5">Einstellungen</h2>
    <div class="mb-6">
      <p class="mb-5">
        Moin {{ user.userData?.displayName }}, hier kannst du dein Profil und deine Einstellungen verwalten.
      </p>
      <div class="mb-3">
        <div class="text-sm font-semibold text-gray-600">Name</div>
        <div class="text-lg">{{ user.userData?.displayName || 'Nicht angegeben' }}</div>
      </div>
      <div>
        <div class="text-sm font-semibold text-gray-600">E-Mail</div>
        <div class="text-lg">{{ user.userData?.email || 'Nicht angegeben' }}</div>
      </div>
    </div>

    <form class="flex flex-col gap-2 mb-6" @submit.prevent="changeUserName">
      <UInput
        v-model="changeName"
        type="text"
        autocomplete="nickname"
      />
      <UButton type="submit" variant="outline" block>
        Namen ändern
      </UButton>
      <p v-if="nameChangeAnswer" class="text-sm mt-1" :class="nameChangeError ? 'text-red-500' : 'text-green-600'">
        {{ nameChangeAnswer }}
      </p>
    </form>

    <USeparator class="my-6" />

    <UButton variant="outline" block @click="handleLogout">
      Abmelden
    </UButton>
  </div>
</template>
