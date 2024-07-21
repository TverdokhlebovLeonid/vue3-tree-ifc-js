<script setup lang="ts">
import { ref, computed, shallowRef, onMounted, onUnmounted } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'
import { Color, type Scene, type Object3D } from 'three'
import { IfcViewerAPI } from 'web-ifc-viewer'
import type { IfcContext } from 'web-ifc-viewer/dist/components'
import type { IFCModel } from 'web-ifc-three/IFC/components/IFCModel'
import type {
  ISwitchChoice,
  ISubsets,
  IModelLevels,
  IDataLevelHide,
  IModelCoordinates,
  IIfcViewerAPI,
  IModelElement,
} from '@/components/IfcViewing/interfaceIfcViewing'
import { IFC_VIEWING_TOOLS } from '@/constants/ifcViewingTools'
import { NavCube } from '@/components/IfcViewing/NavigationCube/NavCube'
import { TEXT_HELP_PLANE } from '@/components/IfcViewing/dataIfcViewing'

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

const file = ref<HTMLInputElement>()
const container = ref<HTMLDivElement>()
const ifcViewing = shallowRef<IIfcViewerAPI>()
const activeTools = ref<string>('')
const model = ref<IFCModel>()
const scene = ref<Scene>()
const modelLevels = ref<IModelLevels[]>([])
const loadingIfc = ref()

const loadIfc = async (url: string): Promise<void> => {
  await ifcViewing.value?.IFC.setWasmPath('../wasm/')
  model.value = await ifcViewing.value?.IFC.loadIfcUrl(url, true)
  await ifcViewing.value?.shadowDropper.renderShadow(model.value?.modelID as number)
  ifcViewing.value?.context.ifcCamera.cameraControls.saveState()
  scene.value = ifcViewing.value?.context.getScene()
  model.value?.removeFromParent()
  modelLevels.value = []
  if (loadingIfc.value) loadingIfc.value.close()
  setSpatialStructure()
}

const OPTIONS_LOADING = {
  lock: true,
  text: 'Loading',
}
const handleFileUpload = (): void => {
  if (file.value) {
    const fileIfc = file.value?.files?.[0]
    if (fileIfc?.name.split('.')[1] === 'ifc') {
      loadingIfc.value = ElLoading.service(OPTIONS_LOADING)
      ifcViewing.value?.dispose()
      setStartIfcViewing()
      loadIfc(URL.createObjectURL(fileIfc))
      emits('start-state-tools')
    } else {
      ElMessage({
        showClose: true,
        message: 'Вы загрузили не ifc формат.',
        type: 'error',
      })
    }
  }
}

const setStartIfcViewing = (): void => {
  ifcViewing.value = new IfcViewerAPI({
    container: container.value as HTMLDivElement,
    backgroundColor: new Color(0xffffff),
  })
  ifcViewing.value.grid.setGrid()
  ifcViewing.value.axes.setAxes(10)
  ifcViewing.value.clipper.active = true
  ifcViewing.value.context.ifcCamera.cameraControls.setPosition(0, 0, 95)
  ifcViewing.value.context.ifcCamera.cameraControls.zoomTo(4)
}

const setMovingMouse = (): void => {
  if (switchMovingMouse[activeTools.value]) switchMovingMouse[activeTools.value]()
}
const setDoubleChoice = (): void => {
  if (activeTools.value === IFC_VIEWING_TOOLS.createPlane) createPlane()
}
const setRightChoice = (): void => {
  if (activeTools.value === IFC_VIEWING_TOOLS.createPlane) deletePlane()
}

const setSpatialStructure = async (): Promise<void> => {
  const structure = await ifcViewing.value?.IFC.getSpatialStructure(0)
  const spatialStructure: IModelElement[] = structure?.children[0]?.children[0].children
  setModelLevels(spatialStructure)
}
onMounted(() => {
  setStartIfcViewing()
  loadIfc('../ifc/demo.ifc')
})

const resetView = (): void => {
  ifcViewing.value?.context.ifcCamera.cameraControls.reset()
}
const highlightModelLevel = (level: number[]): void => {
  ifcViewing.value?.IFC.selector.pickIfcItemsByID(model.value?.modelID as number, level)
}

const setLevelHide = (data: IDataLevelHide): void => {
  data.check ? addHide(data.customID) : removeSubset(data.customID)
}

const defaultCoordinates: IModelCoordinates = { x: 0, y: 0, z: 0 }
const modelCoordinates = ref<IModelCoordinates>(defaultCoordinates)
const setModelCoordinates = (): void => {
  modelCoordinates.value = { ...defaultCoordinates }
}
const createCoordinatesMovingMouse = (): void => {
  const coordinate = ifcViewing.value?.context?.castRayIfc()?.point || null
  modelCoordinates.value.x = coordinate?.x || ''
  modelCoordinates.value.y = coordinate?.y || ''
  modelCoordinates.value.z = coordinate?.z || ''
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
const cancelPlane = (): void => {
  ifcViewing.value?.clipper.deleteAllPlanes()
  toolSelection(IFC_VIEWING_TOOLS.createPlane)
}

const switchToolSelection: ISwitchChoice = {
  CREATE_COORDINATES: setModelCoordinates,
  CREATE_PLANE: createPlane,
  CANCEL_PLANE: cancelPlane,
  NAV_CUBE: setNavCube,
}
const toolSelection = (tool: string = ''): void => {
  if (activeTools.value !== tool) {
    if (navCube.value) deleteNavCube()
    activeTools.value = tool
    if (tool) switchToolSelection[tool]()
  }
}
const resizeViewer = (): void => {
  if (ifcViewing.value?.context as IfcContext) ifcViewing.value?.context['resize']()
}
defineExpose({
  highlightModelLevel,
  setLevelHide,
  toolSelection,
  resizeViewer,
})
onUnmounted(() => {
  ifcViewing.value?.dispose()
})

const switchMovingMouse: ISwitchChoice = {
  CREATE_COORDINATES: createCoordinatesMovingMouse,
  CREATE_PLANE: selectElementMovingMouse,
}

const subsets: ISubsets | undefined = {}
const setModelLevels = (array: IModelElement[]): void => {
  array.forEach(async (element: IModelElement, index: number) => {
    if ('children' in element) {
      const array: number[] = []
      element.children.forEach((el: IModelElement) => {
        array.push(el.expressID)
      })
      const customID: string = `${index.toString()}-level`
      modelLevels.value.push({
        ids: array,
        check: true,
        customID,
        type: element.type,
        children: element?.children,
        expressID: element.expressID,
      })
      subsets[customID] = (await newSubsetOfType(array, customID)) as Object3D
    }
  })
  emits('set-model', modelLevels.value)
}
const newSubsetOfType = (array: number[], customID: string) => {
  return ifcViewing.value?.IFC.loader.ifcManager.createSubset({
    modelID: model.value?.modelID as number,
    scene: scene.value,
    ids: array,
    removePrevious: true,
    customID,
  })
}

const removeSubset = (customID: string): void => {
  ifcViewing.value?.IFC.loader.ifcManager.removeSubset(
    model.value?.modelID as number,
    undefined,
    customID,
  )
}

const addHide = async (customID: string): Promise<void> => {
  const array: number[] = modelLevels.value.find((id) => id.customID === customID)?.ids || []
  removeSubset(customID)
  subsets[customID] = (await newSubsetOfType(array, customID)) as Object3D
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
