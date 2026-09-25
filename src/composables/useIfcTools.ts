import { ref } from 'vue'
import type { ShallowRef } from 'vue'
import type { IIfcViewerAPI, IModelCoordinates } from '@/types/ifc'
import type { ISwitchChoice } from '@/types/tools'
import { IFC_VIEWING_TOOLS } from '@/constants/ifcViewingTools'

type UseIfcToolsOptions = {
  ifcViewing: ShallowRef<IIfcViewerAPI | undefined>
  onResetToolbar: () => void
  onActivateNavCube: () => void
  onDeactivateNavCube: () => void
}

const defaultCoordinates = (): IModelCoordinates => ({ x: 0, y: 0, z: 0 })

export const useIfcTools = (options: UseIfcToolsOptions) => {
  const activeTools = ref('')
  const modelCoordinates = ref<IModelCoordinates>(defaultCoordinates())

  const setModelCoordinates = (): void => {
    modelCoordinates.value = defaultCoordinates()
  }

  const createCoordinatesMovingMouse = (): void => {
    const coordinate = options.ifcViewing.value?.context?.castRayIfc()?.point || null
    modelCoordinates.value.x = coordinate?.x ?? null
    modelCoordinates.value.y = coordinate?.y ?? null
    modelCoordinates.value.z = coordinate?.z ?? null
  }

  const selectElementMovingMouse = (): void => {
    options.ifcViewing.value?.IFC.selector.prePickIfcItem()
  }

  const createPlane = (): void => {
    options.ifcViewing.value?.clipper.createPlane()
  }

  const deletePlane = (): void => {
    options.ifcViewing.value?.clipper.deletePlane()
  }

  const resetTool = (): void => {
    options.onDeactivateNavCube()
    activeTools.value = ''
  }

  const cancelPlane = (): void => {
    options.ifcViewing.value?.clipper.deleteAllPlanes()
    resetTool()
    options.onResetToolbar()
  }

  const switchToolSelection: ISwitchChoice = {
    CREATE_COORDINATES: setModelCoordinates,
    CREATE_PLANE: createPlane,
    CANCEL_PLANE: cancelPlane,
  }

  const switchMovingMouse: ISwitchChoice = {
    CREATE_COORDINATES: createCoordinatesMovingMouse,
    CREATE_PLANE: selectElementMovingMouse,
  }

  const toolSelection = (tool = ''): void => {
    if (activeTools.value === tool) return
    options.onDeactivateNavCube()
    activeTools.value = tool
    if (tool === IFC_VIEWING_TOOLS.navCube) {
      options.onActivateNavCube()
      return
    }
    if (tool) switchToolSelection[tool]?.()
  }

  const setMovingMouse = (): void => {
    switchMovingMouse[activeTools.value]?.()
  }

  const setDoubleChoice = (): void => {
    if (activeTools.value === IFC_VIEWING_TOOLS.createPlane) createPlane()
  }

  const setRightChoice = (): void => {
    if (activeTools.value === IFC_VIEWING_TOOLS.createPlane) deletePlane()
  }

  return {
    activeTools,
    modelCoordinates,
    toolSelection,
    setMovingMouse,
    setDoubleChoice,
    setRightChoice,
  }
}
