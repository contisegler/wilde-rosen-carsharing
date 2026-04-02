<script setup lang="ts">
import type { DropdownMenuItem } from '#ui/types'

const user = useUser()

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: user.userData?.fullName || 'Mein Konto',
      type: 'label',
    },
  ],
  [
    {
      label: 'Autos',
      icon: 'i-lucide-car',
      to: '/',
    },
    {
      label: 'Fahrtenbuch',
      icon: 'i-lucide-notebook',
      to: user.userData?.id ? `/users/${user.userData.id}/log` : '#',
    },
    {
      label: 'Einstellungen',
      icon: 'i-lucide-settings',
      to: user.userData?.id ? `/users/${user.userData.id}/settings` : '#',
    },
  ],
  [
    {
      label: 'Abmelden',
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: handleLogout,
    },
  ],
])

async function handleLogout() {
  await user.logout()
}
</script>

<template>
  <UDropdownMenu :items="items">
    <UButton
      variant="outline"
      square
      class="shrink-0"
      icon="i-lucide-menu"
    />
  </UDropdownMenu>
</template>
