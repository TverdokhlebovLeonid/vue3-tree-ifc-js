<script setup lang="ts">
import { ref, computed, shallowRef, onUnmounted } from 'vue'
import type { IModelCoordinates, IModelLevels } from '@/types/ifc'
import type { ISwitchChoice } from '@/types/tools'
import { IFC_VIEWING_TOOLS } from '@/constants/ifcViewingTools'
import { NavCube } from '@/components/IfcViewing/NavigationCube/NavCube'
import { TEXT_HELP_PLANE } from '@/components/IfcViewing/dataIfcViewing'
import { useIfcViewer } from '@/composables/useIfcViewer'
import { useIfcSubsets } from '@/composables/useIfcSubsets'

const props = defineProps<{
  isFullscreen: boolean
}>()
const emits = defineEmits<{
  (e: 'set-model', value: IModelLevels[]): void
  (e: 'start-state-tools'): void
}>()
const classIfcViewing = computed((): string =>
  props.isFullscreen ? 'height-full' : 'height-default',
)
const classIfcViewingContainer = computed((): string =>
  props.isFullscreen ? 'fullscreen-viewer' : 'height-default',
)

const activeTools = ref<string>('')

let resetSubsets = (): void => undefined
let setSpatialStructure = async (): Promise<void> => undefined

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
  onFileSelected: () => emits('start-state-tools'),
})

const subsets = useIfcSubsets({
  ifcViewing,
  scene,
  getModelID,
  onLevels: (levels: IModelLevels[]) => emits('set-model', levels),
})
resetSubsets = subsets.resetSubsets
setSpatialStructure = subsets.setSpatialStructure

const setMovingMouse = (): void => {
  if (switchMovingMouse[activeTools.value]) switchMovingMouse[activeTools.value]()
}
const setDoubleChoice = (): void => {
  if (activeTools.value === IFC_VIEWING_TOOLS.createPlane) createPlane()
}
const setRightChoice = (): void => {
  if (activeTools.value === IFC_VIEWING_TOOLS.createPlane) deletePlane()
}

const highlightModelLevel = subsets.highlightModelLevel
const setLevelHide = subsets.setLevelHide

const defaultCoordinates: IModelCoordinates = { x: 0, y: 0, z: 0 }
const modelCoordinates = ref<IModelCoordinates>(defaultCoordinates)
const setModelCoordinates = (): void => {
  modelCoordinates.value = { ...defaultCoordinates }
}
const createCoordinatesMovingMouse = (): void => {
  const coordinate = ifcViewing.value?.context?.castRayIfc()?.point || null
  modelCoordinates.value.x = coordinate?.x ?? null
  modelCoordinates.value.y = coordinate?.y ?? null
  modelCoordinates.value.z = coordinate?.z ?? null
}

const selectElementMovingMouse = (): void => {
  ifcViewing.value?.IFC.selector.prePickIfcItem()
}

const navCube = shallowRef<NavCube | null>(null)
const HTML_ELEMENT_CUBE: string = '.ifc-viewing__container_cube'
const setNavCube = (): void => {
  if (ifcViewing.value && model.value) {
    ifcViewing.value.container = container.value
    navCube.value = new NavCube(ifcViewing.value, HTML_ELEMENT_CUBE)
    navCube.value.onPick(model.value)
  }
}
const deleteNavCube = (): void => {
  delete ifcViewing.value?.container
  if (navCube.value) navCube.value.deleteElement()
  navCube.value = null
}

const createPlane = (): void => {
  ifcViewing.value?.clipper.createPlane()
}
const deletePlane = (): void => {
  ifcViewing.value?.clipper.deletePlane()
}
const resetTool = (): void => {
  if (navCube.value) deleteNavCube()
  activeTools.value = ''
}
const cancelPlane = (): void => {
  ifcViewing.value?.clipper.deleteAllPlanes()
  resetTool()
  emits('start-state-tools')
}

const switchToolSelection: ISwitchChoice = {
  CREATE_COORDINATES: setModelCoordinates,
  CREATE_PLANE: createPlane,
  CANCEL_PLANE: cancelPlane,
  NAV_CUBE: setNavCube,
}
const toolSelection = (tool: string = ''): void => {
  if (activeTools.value === tool) return
  if (navCube.value) deleteNavCube()
  activeTools.value = tool
  if (tool) switchToolSelection[tool]()
}
defineExpose({
  highlightModelLevel,
  setLevelHide,
  toolSelection,
  resizeViewer,
})
onUnmounted(() => {
  if (navCube.value) deleteNavCube()
  subsets.resetSubsets()
  dispose()
})

const switchMovingMouse: ISwitchChoice = {
  CREATE_COORDINATES: createCoordinatesMovingMouse,
  CREATE_PLANE: selectElementMovingMouse,
}
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
      <el-text v-if="activeTools === IFC_VIEWING_TOOLS.createPlane" type="success" size="small">
        {{ TEXT_HELP_PLANE }}
      </el-text>
      <el-tooltip effect="dark" content="Исходный вид модели Ifc" placement="bottom-end">
        <el-button type="primary" size="small" plain icon="Refresh" @click="resetView" />
      </el-tooltip>
    </div>
    <div
      v-if="activeTools === IFC_VIEWING_TOOLS.createCoordinates"
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
