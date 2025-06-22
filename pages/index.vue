<script setup lang="ts">
import { ref as storageRef } from 'firebase/storage'
//import { useFirebaseStorage, useStorageFileUrl } from 'vuefire'

// console.log(JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG || "")?.apiKey)

const storage = useFirebaseStorage()
const mountainFileRef = storageRef(storage, 'test.jpeg')
const {
  url,
  // refresh the url if the file changes
  // refresh,
} = useStorageFileUrl(mountainFileRef)
console.log(url.value)
</script>


<template>
  <div class="text-center pt-6">
    <div class="flex flex-col gap-3 items-center">
      <NuxtLink to="/kangoo" class="w-1/2">
        <Button variant="outline" size="lg" class="w-full font-bold">Kangoo</Button>
      </NuxtLink>
      <NuxtLink to="/kona" class="w-1/2">
        <Button variant="outline" size="lg" class="w-full font-bold">Kona</Button>
      </NuxtLink>
      <NuxtLink to="/zoe" class="w-1/2">
        <Button variant="outline" size="lg" class="w-full font-bold">Zoe</Button>
      </NuxtLink>

      <img v-if="url" :src="url" >

      <NuxtImg  
        v-if="url"
              :src="url"
              class="w-full h-auto max-w-full max-h-[600px] object-contain cursor-pointer transition-all duration-300 group-hover:brightness-90"
              :alt="'Car damage: test'"
              sizes="sm:80vw md:70vw lg:736px"
              format="webp"
              quality="70"
              loading="lazy"
              fit="inside"
              placeholder
            />
      <!-- <div class="mt-4 pt-3 border-t w-1/2">
        <div class="flex flex-col gap-3">
          <NuxtLink to="/zoe-damage-entry" class="w-full">
            <Button variant="outline" size="lg" class="w-full">Create Zoe Damage Report</Button>
          </NuxtLink>
          <NuxtLink to="/kangoo-damage-entry" class="w-full">
            <Button variant="outline" size="lg" class="w-full">Create Kangoo Damage Report</Button>
          </NuxtLink>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped></style>
