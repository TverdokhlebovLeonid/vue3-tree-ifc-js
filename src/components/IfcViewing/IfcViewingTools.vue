<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { TOOLS } from '@/components/IfcViewing/dataIfcViewing'
import type { ITools } from '@/components/IfcViewing/interfaceIfcViewing'
import { IFC_VIEWING_TOOLS } from '@/constants/ifcViewingTools'

const emits = defineEmits<{
  (e: 'open-fullscreen'): void
  (e: 'tool-selection', value: string): void
}>()

const toolsButton = reactive<ITools[]>(TOOLS)
const activeTool = ref<string>('')
const isCancelAction = computed((): boolean => activeTool.value === IFC_VIEWING_TOOLS.createPlane)

const setActiveTool = (tool: string = ''): void => {
  toolsButton.forEach((el) => {
    el.active = el.tool === tool
  })
}
const startStateTools = (): void => {
  activeTool.value = ''
  setActiveTool()
  emits('tool-selection', '')
}
const setTools = (tool: string): void => {
  if (tool === activeTool.value) {
    startStateTools()
    return
  }
  if (tool === IFC_VIEWING_TOOLS.fullScreen) {
    setFullScreen()
    return
  }
  activeTool.value = tool
  setActiveTool(tool)
  emits('tool-selection', tool)
}

const cancelTool = (): void => {
  emits('tool-selection', IFC_VIEWING_TOOLS.cancelPlane)
}

const setFullScreen = (): void => {
  emits('open-fullscreen')
}

defineExpose({ startStateTools, setTools, activeTool, cancelTool, setFullScreen })
onUnmounted(() => {
  startStateTools()
})
</script>

<template>
  <div class="ifc-tools">
    <div class="ifc-tools__cancel">
      <el-tooltip
        v-if="isCancelAction"
        effect="dark"
        content="Отменить действие инструмента"
        placement="bottom"
      >
        <el-button type="danger" size="small" plain icon="Failed" @click="cancelTool">
          Отмена
        </el-button>
      </el-tooltip>
    </div>
    <div class="ifc-tools__buttons">
      <template v-for="tool in toolsButton" :key="tool.icon">
        <el-tooltip
          effect="dark"
          :content="tool.active ? 'Отключить инструмент' : tool.popover"
          placement="bottom"
        >
          <el-button
            type="primary"
            :class="{ 'ifc-tools__buttons_active': tool.active }"
            plain
            size="small"
            :icon="tool.icon"
            @click="setTools(tool.tool)"
          >
            {{ tool.name }}
          </el-button>
        </el-tooltip>
      </template>
    </div>
  </div>
</template>

<style scoped lang="sass">
.ifc-tools
  margin-top: 80px
  display: flex
  flex-direction: row
  justify-content: space-between
  &__buttons
    display: flex
    flex-direction: row
    justify-content: flex-end
    &_active
      background-color: $color-btn-active
</style>
