<script setup lang="ts">
import { reactive, computed, watch, onUnmounted } from 'vue'
import { TOOLS } from '@/components/IfcViewing/dataIfcViewing'
import type { ITools } from '@/types/tools'
import { IFC_VIEWING_TOOLS } from '@/constants/ifcViewingTools'

const props = withDefaults(
  defineProps<{
    activeTool?: string
  }>(),
  { activeTool: '' },
)
const emits = defineEmits<{
  (e: 'open-fullscreen'): void
  (e: 'tool-selection', value: string): void
}>()

const toolsButton = reactive<ITools[]>(TOOLS)
const isCancelAction = computed((): boolean => props.activeTool === IFC_VIEWING_TOOLS.createPlane)

watch(
  () => props.activeTool,
  (tool) => {
    toolsButton.forEach((el) => {
      el.active = el.tool === tool
    })
  },
  { immediate: true },
)

const startStateTools = (): void => {
  emits('tool-selection', '')
}
const setTools = (tool: string): void => {
  if (tool === props.activeTool) {
    startStateTools()
    return
  }
  if (tool === IFC_VIEWING_TOOLS.fullScreen) {
    emits('open-fullscreen')
    return
  }
  emits('tool-selection', tool)
}

const cancelTool = (): void => {
  emits('tool-selection', IFC_VIEWING_TOOLS.cancelPlane)
}

const setFullScreen = (): void => {
  emits('open-fullscreen')
}

defineExpose({ startStateTools, setTools, cancelTool, setFullScreen })
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
