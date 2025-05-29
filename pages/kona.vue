<script setup lang="ts">
// Page for displaying Kona damage images with schematics

// Import damage images
import frontDamage30_100 from '~/assets/damages/kona/kona_front_30_100.jpg'
import frontDamage100_100 from '~/assets/damages/kona/kona_front_100_100.jpg'
import backDamage100_150 from '~/assets/damages/kona/kona_back_100_150.jpg'
import rightDamage20_120 from '~/assets/damages/kona/kona_right_20_120.jpg'

// Import schematic images
import frontSchematic from '~/assets/car_line_drawings/kona_front.png'
import backSchematic from '~/assets/car_line_drawings/kona_back.png'
import rightSchematic from '~/assets/car_line_drawings/kona_right.png'

const konaDamageImages = [
  { 
    damagePath: frontDamage30_100,
    schematicPath: frontSchematic, 
    title: 'Front Damage',
    description: 'Damage on the front side at 30% from left, 70% from top',
    x: 30,
    y: 70,
    side: 'front'
  },
  { 
    damagePath: frontDamage100_100,
    schematicPath: frontSchematic, 
    title: 'Front Damage',
    description: 'Damage on the front side at 100% from left, 100% from top',
    x: 100,
    y: 100,
    side: 'front'
  },
  { 
    damagePath: backDamage100_150,
    schematicPath: backSchematic, 
    title: 'Back Damage',
    description: 'Damage on the back side at 100% from left, 50% from top',
    x: 100,
    y: 50,
    side: 'back'
  },
  { 
    damagePath: rightDamage20_120,
    schematicPath: rightSchematic, 
    title: 'Right Side Damage',
    description: 'Damage on the right side at 20% from left, 80% from top',
    x: 20,
    y: 80,
    side: 'right'
  }
];
</script>

<template>
  <div>
    <CarDamageViewer :damage-images="konaDamageImages" title="Kona - Damage Inspection" />
    
    <div class="text-center mt-4 mb-5">
      <NuxtLink to="/" class="btn btn-outline-secondary">Back to Home</NuxtLink>
    </div>
  </div>
</template>
