<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed((): string => (route?.meta?.title as string) || '')
</script>

<template>
  <div class="default-layout">
    <el-container>
      <el-header>
        <el-text>{{ title }}</el-text>
      </el-header>
      <el-main>
        <slot />
      </el-main>
    </el-container>
  </div>
</template>

<style scoped lang="sass">
.default-layout
  background-color: $color-bg-light
  height: 100VH
  border-radius: 5px
  .el-header
    margin-bottom: 20px
    display: flex
    background-color: $color-bg-brand
    border-radius: 5px
    .el-text
      color: $color-text-light
</style>
