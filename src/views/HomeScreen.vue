<script setup lang="ts">
import IfcViewingBlock from '@/features/ifc-viewing/components/IfcViewingBlock.vue'
</script>

<template>
  <div class="home-screen">
    <IfcViewingBlock />
  </div>
</template>

<style scoped lang="sass">
.home-screen
  flex: 1
  min-height: 0
  display: flex
  flex-direction: column
</style>
