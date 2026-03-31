<script setup lang="ts">
import { signOut } from "firebase/auth"

const user = useCurrentUser()
const auth = useFirebaseAuth()
const loginError = useLoginError()

function handleLogout() {
  if (!auth) return
  signOut(auth).then(
    () => {
      loginError.value = null
      navigateTo("/")
    },
    reason => {
      console.error("Failed signOut", reason)
      loginError.value = reason
    }
  )
}

function goToLog() {
  if (user.value) {
    navigateTo(`/users/${user.value.uid}/log`)
  }
}

function goToSettings() {
  if (user.value) {
    navigateTo(`/users/${user.value.uid}/settings`)
  }
}

function goToHome() {
  navigateTo("/")
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm" class="shrink-0 rounded-full w-10 h-10">
        <LucideMenu class="w-5 h-5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-48">
      <DropdownMenuLabel>
        {{ user?.displayName || "Mein Konto" }}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="goToHome">
        <LucideCar class="w-4 h-4 mr-2" />
        Autos
      </DropdownMenuItem>
      <DropdownMenuItem @click="goToLog">
        <LucideNotebook class="w-4 h-4 mr-2" />
        Fahrtenbuch
      </DropdownMenuItem>
      <DropdownMenuItem @click="goToSettings">
        <LucideSettings class="w-4 h-4 mr-2" />
        Einstellungen
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleLogout">
        <LucideLogOut class="w-4 h-4 mr-2" />
        Abmelden
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
