<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ILevelVisibility, IModelElement, IModelLevel } from '@/features/ifc-viewing/types/ifc'
import { dictionaryIfcViewing, DEFAULT_KEY } from '@/features/ifc-viewing/constants/dictionaryIfcViewing'
import { collectHighlightIds } from '@/features/ifc-viewing/utils/spatialStructure'

const props = defineProps<{
  modelLevels: IModelLevel[]
}>()
const levelActive = ref<number | null>(null)
const shown = ref<Record<string, boolean>>({})

watch(
  () => props.modelLevels,
  (levels) => {
    levelActive.value = null
    const next: Record<string, boolean> = {}
    for (const level of levels) next[level.customID] = level.visible
    shown.value = next
  },
  { immediate: true },
)

const emits = defineEmits<{
  (e: 'level-highlight', value: number[]): void
  (e: 'level-visibility', value: ILevelVisibility): void
}>()

const containsExpressID = (nodes: IModelElement[] | undefined, id: number): boolean =>
  (nodes ?? []).some((node) => node.expressID === id || containsExpressID(node.children, id))

const highlightIds = (element: IModelLevel | IModelElement): number[] =>
  'ids' in element && Array.isArray(element.ids) ? element.ids : collectHighlightIds(element)

const isShown = (element: IModelLevel): boolean => shown.value[element.customID] ?? element.visible

const setLevelHighlight = (element: IModelLevel | IModelElement): void => {
  if (levelActive.value === element.expressID) {
    levelActive.value = null
    emits('level-highlight', [])
    return
  }
  levelActive.value = element.expressID
  emits('level-highlight', highlightIds(element))
}

const setLevelVisibility = (element: IModelLevel, visible: boolean): void => {
  shown.value = { ...shown.value, [element.customID]: visible }
  emits('level-visibility', { customID: element.customID, visible })
  if (visible || levelActive.value == null) return
  const activeID = levelActive.value
  if (activeID !== element.expressID && !containsExpressID(element.children, activeID)) return
  levelActive.value = null
  emits('level-highlight', [])
}

const setElementName = (name: string): string => {
  const key = dictionaryIfcViewing[name] ? name : DEFAULT_KEY
  return dictionaryIfcViewing[key]
}

const PROPS_TREE = {
  value: 'expressID',
  label: 'type',
  children: 'children',
}
</script>

<template>
  <div v-if="modelLevels.length" class="ifc-requisites">
    <el-text size="large" tag="b" type="primary">Реквизиты</el-text>
    <el-tree-v2
      style="max-width: 100%"
      :expand-on-click-node="false"
      :data="modelLevels"
      :props="PROPS_TREE"
      :height="400"
    >
      <template #default="{ data }">
        <el-tooltip
          v-if="data?.customID"
          effect="dark"
          :content="isShown(data) ? 'Скрыть' : 'Показать'"
          placement="bottom"
        >
          <el-checkbox
            :model-value="isShown(data)"
            size="large"
            @change="setLevelVisibility(data, $event === true)"
          />
        </el-tooltip>
        <el-tooltip
          effect="dark"
          :content="data.expressID === levelActive ? 'Убрать выделение' : 'Выделить элемент'"
          placement="bottom"
        >
          <button
            type="button"
            class="ifc-requisites__label"
            :class="{ 'ifc-requisites__label_active': data.expressID === levelActive }"
            @click="setLevelHighlight(data)"
          >
            {{ setElementName(data?.type?.toString() || DEFAULT_KEY) }}
          </button>
        </el-tooltip>
      </template>
    </el-tree-v2>
  </div>
</template>

<style scoped lang="sass">
.ifc-requisites
  margin-top: 20px
  .el-tree
    background-color: $color-bg-light
    margin-top: 10px
  &__label
    margin: 0
    padding: 0
    border: 0
    background: none
    font: inherit
    line-height: inherit
    color: var(--el-color-primary)
    cursor: pointer
    &_active
      color: var(--el-color-danger)
</style>
