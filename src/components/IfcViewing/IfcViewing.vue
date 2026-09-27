<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import type { IModelLevels } from '@/types/ifc'
import { IFC_VIEWING_TOOLS } from '@/constants/ifcViewingTools'
import { TEXT_HELP_PLANE } from '@/components/IfcViewing/dataIfcViewing'
import { useIfcViewer } from '@/composables/useIfcViewer'
import { useIfcSubsets } from '@/composables/useIfcSubsets'
import { useIfcTools } from '@/composables/useIfcTools'
import { useNavCube } from '@/composables/useNavCube'

const props = defineProps<{
  isFullscreen: boolean
}>()
const activeTool = defineModel<string>('activeTool', { default: '' })
const emits = defineEmits<{
  (e: 'set-model', value: IModelLevels[]): void
}>()
const classIfcViewing = computed((): string =>
  props.isFullscreen ? 'height-full' : 'height-default',
)
const classIfcViewingContainer = computed((): string =>
  props.isFullscreen ? 'fullscreen-viewer' : 'height-default',
)

let resetSubsets = (): void => undefined
let setSpatialStructure = async (): Promise<void> => undefined
let resetActiveTool = (): void => undefined

const {
  file,
  container,
  ifcViewing,
  model,
  scene,
  getModelID,
  handleFileUpload,
  resetView,
  resizeViewer,
  dispose,
} = useIfcViewer({
  onModelReady: () => resetSubsets(),
  onSpatialStructure: () => setSpatialStructure(),
  onFileSelected: () => resetActiveTool(),
})

const subsets = useIfcSubsets({
  ifcViewing,
  scene,
  getModelID,
  onLevels: (levels: IModelLevels[]) => emits('set-model', levels),
})
resetSubsets = subsets.resetSubsets
setSpatialStructure = subsets.setSpatialStructure

const navCube = useNavCube({ ifcViewing, model, container })

const {
  modelCoordinates,
  toolSelection,
  setMovingMouse,
  setDoubleChoice,
  setRightChoice,
} = useIfcTools({
  ifcViewing,
  activeTool,
  onActivateNavCube: navCube.activate,
  onDeactivateNavCube: navCube.deactivate,
})
resetActiveTool = () => toolSelection('')

const highlightModelLevel = subsets.highlightModelLevel
const setLevelHide = subsets.setLevelHide

defineExpose({
  highlightModelLevel,
  setLevelHide,
  toolSelection,
  resizeViewer,
})
onUnmounted(() => {
  navCube.deactivate()
  subsets.resetSubsets()
  dispose()
})
</script>

<template>
  <div class="ifc-viewing" :class="classIfcViewing">
    <div class="ifc-viewing__buttons">
      <div class="ifc-viewing__buttons_upload">
        <el-tooltip effect="dark" content="Загрузити свой файл формата ifc">
          <el-button type="primary" link>
            <label for="inputFile">
              <input id="inputFile" ref="file" type="file" hidden @change="handleFileUpload" />
              <span>Загрузить файл IFC</span>
              <el-icon class="el-icon--right"><Upload /></el-icon>
            </label>
          </el-button>
        </el-tooltip>
      </div>
      <el-text v-if="activeTool === IFC_VIEWING_TOOLS.createPlane" type="success" size="small">
        {{ TEXT_HELP_PLANE }}
      </el-text>
      <el-tooltip effect="dark" content="Исходный вид модели Ifc" placement="bottom-end">
        <el-button type="primary" size="small" plain icon="Refresh" @click="resetView" />
      </el-tooltip>
    </div>
    <div
      v-if="activeTool === IFC_VIEWING_TOOLS.createCoordinates"
      class="ifc-viewing__coordinates"
    >
      <span v-for="(coordinate, key) in modelCoordinates" :key="key">
        {{ key }}: {{ coordinate }}
      </span>
    </div>
    <div
      class="ifc-viewing__container"
      ref="container"
      tabindex="0"
      :class="classIfcViewingContainer"
      @mousemove="setMovingMouse"
      @click.right="setRightChoice"
      @dblclick="setDoubleChoice"
    >
      <div class="ifc-viewing__container_cube" />
    </div>
  </div>
</template>

<style scoped lang="sass">
.ifc-viewing
  &__buttons
    display: flex
    flex-direction: row
    align-items: center
    justify-content: space-between
    margin: 10px 0
    &_upload
      button
        padding: 0
        label
          padding: 5px
          cursor: pointer
  &__coordinates
    display: flex
    flex-direction: column
    position: absolute
    padding: 10px
    span
      color: $color-text-dark
  &__container
    &:focus-visible
      outline: none !important
    &_cube
      width: 100px
      height: 100px
      position: absolute
      right: 20px
      z-index: 1

.fullscreen-viewer
  display: flex
  align-items: center
  justify-content: center
  height: 100VH
.height-full
  height: 100%
.height-default
  height: 250px
</style>
