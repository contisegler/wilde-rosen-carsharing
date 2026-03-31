<script setup lang="ts">
const route = useRoute()
const carId = route.params.carId as string
const user = useCurrentUser()

// Check if user is a damage reporter
const { isDamageReporter } = user.value?.uid
  ? useUserData({ userId: user.value.uid })
  : { isDamageReporter: ref(false) }

function reportDamage() {
  navigateTo(`/cars/${carId}/damages/add`)
}
</script>

<template>
  <DefaultPageStructure>
    <CarPageNavigation :car-id="carId" current-view="damages" />
    <Button
      v-if="isDamageReporter"
      variant="default"
      size="lg"
      class="w-full font-bold mb-4"
      @click="reportDamage"
    >
      <LucideAlertTriangle class="w-4 h-4 mr-2" />
      Schaden melden
    </Button>
    <CarViewer :car-id="carId" />
  </DefaultPageStructure>
</template>
