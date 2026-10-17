<script setup lang="ts">
import { ref } from 'vue'
import IfcViewing from '@/features/ifc-viewing/components/IfcViewing.vue'
import IfcViewingTools from '@/features/ifc-viewing/components/IfcViewingTools.vue'
import IfcViewingRequisites from '@/features/ifc-viewing/components/IfcViewingRequisites.vue'
import { useFullscreen } from '@/features/ifc-viewing/composables/useFullscreen'
import type { IModelLevels, IDataLevelHide } from '@/features/ifc-viewing/types/ifc'

const activeTool = ref('')
const modelLevels = ref<IModelLevels[]>([])
const levelHighlight = ref<number[] | null>(null)
const levelVisibility = ref<IDataLevelHide | null>(null)
const toolCommand = ref<{ key: number; name: string } | null>(null)
let toolCommandKey = 0
const { isFullscreen, toggle: openFullscreen, close: closeButtonFullscreen } = useFullscreen()

const onToolSelection = (tool: string): void => {
  toolCommandKey += 1
  toolCommand.value = { key: toolCommandKey, name: tool }
}
const onTransferLevel = (level: number[]): void => {
  levelHighlight.value = level
}
const onLevelHide = (data: IDataLevelHide): void => {
  levelVisibility.value = data
}
const onSetModel = (model: IModelLevels[]): void => {
  modelLevels.value = model
}
</script>

<template>
  <div class="ifc-viewing-block" :class="{ 'ifc-viewing-block__fullscreen': isFullscreen }">
    <IfcViewing
      v-model:active-tool="activeTool"
      :is-fullscreen="isFullscreen"
      :tool-command="toolCommand"
      :level-highlight="levelHighlight"
      :level-visibility="levelVisibility"
      @set-model="onSetModel"
    />
    <div
      class="ifc-viewing-block__control-panel"
      :class="{ 'ifc-viewing-block__control-panel_fullscreen': isFullscreen }"
    >
      <IfcViewingTools
        :active-tool="activeTool"
        @tool-selection="onToolSelection"
        @open-fullscreen="openFullscreen"
      />
      <IfcViewingRequisites
        v-show="!isFullscreen"
        :model-levels="modelLevels"
        @transfer-level="onTransferLevel"
        @level-hide="onLevelHide"
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
