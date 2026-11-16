<script setup lang="ts">
import { computed } from 'vue'
import { TOOLS } from '@/features/ifc-viewing/constants/dataIfcViewing'
import { IFC_VIEWING_TOOLS } from '@/features/ifc-viewing/constants/ifcViewingTools'

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

const isCancelAction = computed((): boolean => props.activeTool === IFC_VIEWING_TOOLS.createPlane)

const isActive = (tool: string): boolean => props.activeTool === tool

const setTools = (tool: string): void => {
  if (tool === props.activeTool) {
    emits('tool-selection', '')
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
      <template v-for="tool in TOOLS" :key="tool.tool">
        <el-tooltip
          effect="dark"
          :content="isActive(tool.tool) ? 'Отключить инструмент' : tool.popover"
          placement="bottom"
        >
          <el-button
            type="primary"
            :class="{ 'ifc-tools__buttons_active': isActive(tool.tool) }"
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
  margin-top: 10px
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
