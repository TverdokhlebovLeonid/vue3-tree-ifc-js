<script setup lang="ts">
import { ref } from 'vue'
import type { IModelLevels, IDataLevelHide } from '@/components/IfcViewing/interfaceIfcViewing'
import { dictionaryIfcViewing, DEFAULT_KEY } from '@/components/IfcViewing/dictionaryIfcViewing'

const modelLevels = ref<IModelLevels[]>([])
const levelActive = ref<number | null>(null)

const emits = defineEmits<{
  (e: 'transfer-level', value: number[]): void
  (e: 'level-hide', value: IDataLevelHide): void
}>()

const transferLevel = (children: IModelLevels[], id: number): void => {
  const level: number[] = []
  if (levelActive.value === id) {
    levelActive.value = null
  } else {
    levelActive.value = id
    children.length
      ? children.forEach((el: IModelLevels) => {
          level.push(el.expressID)
        })
      : level.push(id)
  }
  emits('transfer-level', level)
}

const setLevelHide = (customID: string, check: boolean): void => {
  emits('level-hide', { customID, check })
}
const setModel = (model: IModelLevels[]): void => {
  levelActive.value = null
  modelLevels.value = model
}

const setElementName = (name: string): string => {
  const key = dictionaryIfcViewing?.[name] ? name : DEFAULT_KEY
  return dictionaryIfcViewing[key].single
}

defineExpose({
  setModel,
  modelLevels,
  setElementName,
  levelActive,
  transferLevel,
  setLevelHide,
})

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
          :content="data.check ? 'Удалить элемент' : 'Вернуть элемент'"
          placement="bottom"
        >
          <el-checkbox
            v-model="data.check"
            size="large"
            @change="setLevelHide(data.customID, data.check)"
          />
        </el-tooltip>
        <el-tooltip
          effect="dark"
          :content="data.expressID === levelActive ? 'Убрать выделение' : 'Выделить элемент'"
          placement="bottom"
        >
          <el-text
            :type="data.expressID === levelActive ? 'danger' : 'primary'"
            @click="transferLevel(data?.children || [], data.expressID)"
          >
            {{ setElementName(data?.type?.toString() || DEFAULT_KEY) }}
          </el-text>
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
</style>
