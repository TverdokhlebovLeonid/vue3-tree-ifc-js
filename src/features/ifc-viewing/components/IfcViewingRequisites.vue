<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IDataLevelHide, IModelElement, IModelLevels } from '@/features/ifc-viewing/types/ifc'
import { dictionaryIfcViewing, DEFAULT_KEY } from '@/features/ifc-viewing/components/dictionaryIfcViewing'
import { collectHighlightIds } from '@/features/ifc-viewing/utils/spatialStructure'

const props = defineProps<{
  modelLevels: IModelLevels[]
}>()
const levelActive = ref<number | null>(null)

watch(
  () => props.modelLevels,
  () => {
    levelActive.value = null
  },
)

const emits = defineEmits<{
  (e: 'transfer-level', value: number[]): void
  (e: 'level-hide', value: IDataLevelHide): void
}>()

const containsExpressID = (nodes: IModelElement[] | undefined, id: number): boolean =>
  (nodes ?? []).some((node) => node.expressID === id || containsExpressID(node.children, id))

const highlightIds = (element: IModelLevels | IModelElement): number[] =>
  'ids' in element && Array.isArray(element.ids) ? element.ids : collectHighlightIds(element)

const transferLevel = (element: IModelLevels | IModelElement): void => {
  if (levelActive.value === element.expressID) {
    levelActive.value = null
    emits('transfer-level', [])
    return
  }
  levelActive.value = element.expressID
  emits('transfer-level', highlightIds(element))
}

const setLevelHide = (element: IModelLevels, visible: boolean): void => {
  emits('level-hide', { customID: element.customID, visible })
  if (visible || levelActive.value == null) return
  const activeID = levelActive.value
  if (activeID !== element.expressID && !containsExpressID(element.children, activeID)) return
  levelActive.value = null
  emits('transfer-level', [])
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
          :content="data.visible ? 'Удалить элемент' : 'Вернуть элемент'"
          placement="bottom"
        >
          <el-checkbox
            v-model="data.visible"
            size="large"
            @change="setLevelHide(data, data.visible)"
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
            @click="transferLevel(data)"
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
