<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import IfcViewing from '@/components/IfcViewing/IfcViewing.vue'
import IfcViewingTools from '@/components/IfcViewing/IfcViewingTools.vue'
import IfcViewingRequisites from '@/components/IfcViewing/IfcViewingRequisites.vue'
import type {
  IDocument,
  IDocumentElement,
  IModelLevels,
  IDataLevelHide,
} from '@/components/IfcViewing/interfaceIfcViewing'

const isFullscreen = ref<boolean>(false)
const childViewer = ref<InstanceType<typeof IfcViewing> | null>(null)
const toolSelection = (tool: string): void => {
  childViewer.value?.toolSelection(tool)
}

const isWebKit = ref<boolean>(true)
const setWebKit = (): void => {
  isWebKit.value = !!document.documentElement.requestFullscreen
}
const docFullscreenElement = (): Element | null | object => {
  return isWebKit.value
    ? document.fullscreenElement
    : (document as IDocument).webkitFullscreenElement
}
const docRequestFullscreen = (): Promise<void> => {
  return isWebKit.value
    ? document.documentElement.requestFullscreen()
    : (document.documentElement as IDocumentElement).webkitRequestFullscreen()
}
const docExitFullscreen = (): Promise<void> => {
  return isWebKit.value ? document.exitFullscreen() : (document as IDocument).webkitExitFullscreen()
}
const fullscreenChange = (): void => {
  isFullscreen.value = !!docFullscreenElement()
  if (!docFullscreenElement()) {
    removeFullscreen()
    nextTick(() => {
      childViewer.value?.resizeViewer()
    })
  }
}
const addFullscreen = (): void => {
  document.addEventListener('fullscreenchange', fullscreenChange)
}
const removeFullscreen = (): void => {
  document.removeEventListener('fullscreenchange', fullscreenChange)
}
const openFullscreen = (): void => {
  if (!docFullscreenElement()) {
    docRequestFullscreen()
    addFullscreen()
    isFullscreen.value = true
  } else {
    docExitFullscreen()
    removeFullscreen()
    isFullscreen.value = false
  }
}
const closeButtonFullscreen = (): void => {
  docExitFullscreen()
  removeFullscreen()
  isFullscreen.value = false
}

const highlightModelLevel = (level: number[]): void => {
  childViewer.value?.highlightModelLevel(level)
}
const setLevelHide = (data: IDataLevelHide): void => {
  childViewer.value?.setLevelHide(data)
}

const ifcViewingRequisites = ref<InstanceType<typeof IfcViewingRequisites> | null>(null)
const setModel = (model: IModelLevels[]): void => {
  ifcViewingRequisites.value?.setModel(model)
}

const managementTools = ref<InstanceType<typeof IfcViewingTools> | null>(null)
const startStateTools = (): void => {
  managementTools.value?.startStateTools()
}

onMounted(() => {
  setWebKit()
})
</script>

<template>
  <div class="ifc-viewing-block" :class="{ 'ifc-viewing-block__fullscreen': isFullscreen }">
    <IfcViewing
      ref="childViewer"
      :is-fullscreen="isFullscreen"
      @start-state-tools="startStateTools"
      @set-model="setModel"
    />
    <div
      class="ifc-viewing-block__control-panel"
      :class="{ 'ifc-viewing-block__control-panel_fullscreen': isFullscreen }"
    >
      <IfcViewingTools
        ref="managementTools"
        @tool-selection="toolSelection"
        @open-fullscreen="openFullscreen"
      />
      <IfcViewingRequisites
        v-show="!isFullscreen"
        ref="ifcViewingRequisites"
        @transfer-level="highlightModelLevel"
        @level-hide="setLevelHide"
      />
      <el-button
        v-if="isFullscreen"
        class="ifc-viewing-block__control-panel_close-btn"
        type="primary"
        plain
        @click="closeButtonFullscreen"
      >
        Закрыть
      </el-button>
    </div>
  </div>
</template>
<style scoped lang="sass">
.ifc-viewing-block
  &__fullscreen
    display: flex
    flex-direction: column
    justify-content: space-between
    position: fixed
    top: 0
    left: 0
    width: 100%
    height: 100%
    background-color: $color-bg-light
    z-index: 10
  &__control-panel
    &_fullscreen
      position: absolute
      bottom: 5%
      left: 10px
      right: 10px
      width: calc(100% - 20px)
      background-color: transparent
    &_close-btn
      position: fixed
      right: calc( 50% - 23px )
      top: 0
      margin-top: 20px
</style>
