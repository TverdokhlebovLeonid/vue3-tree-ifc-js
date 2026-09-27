import { ref, type Ref, type ShallowRef } from 'vue'
import type { IIfcViewerAPI, IModelCoordinates } from '@/types/ifc'
import type { ISwitchChoice } from '@/types/tools'
import { IFC_VIEWING_TOOLS } from '@/constants/ifcViewingTools'

type UseIfcToolsOptions = {
  ifcViewing: ShallowRef<IIfcViewerAPI | undefined>
  activeTool: Ref<string>
  onActivateNavCube: () => void
  onDeactivateNavCube: () => void
}

const defaultCoordinates = (): IModelCoordinates => ({ x: 0, y: 0, z: 0 })

export const useIfcTools = (options: UseIfcToolsOptions) => {
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
    options.activeTool.value = ''
  }

  const cancelPlane = (): void => {
    options.ifcViewing.value?.clipper.deleteAllPlanes()
    resetTool()
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
    if (options.activeTool.value === tool) return
    options.onDeactivateNavCube()
    options.activeTool.value = tool
    if (tool === IFC_VIEWING_TOOLS.navCube) {
      options.onActivateNavCube()
      return
    }
    if (tool) switchToolSelection[tool]?.()
  }

  const setMovingMouse = (): void => {
    switchMovingMouse[options.activeTool.value]?.()
  }

  const setDoubleChoice = (): void => {
    if (options.activeTool.value === IFC_VIEWING_TOOLS.createPlane) createPlane()
  }

  const setRightChoice = (): void => {
    if (options.activeTool.value === IFC_VIEWING_TOOLS.createPlane) deletePlane()
  }

  return {
    modelCoordinates,
    toolSelection,
    setMovingMouse,
    setDoubleChoice,
    setRightChoice,
  }
}
