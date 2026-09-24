import { ref } from 'vue'
import type { ShallowRef } from 'vue'
import type { Scene } from 'three'
import type {
  IDataLevelHide,
  IIfcViewerAPI,
  IModelElement,
  IModelLevels,
  ISubsets,
} from '@/types/ifc'

const IFC_TYPES_WITHOUT_MESH = new Set(['IFCSPACE'])

type UseIfcSubsetsOptions = {
  ifcViewing: ShallowRef<IIfcViewerAPI | undefined>
  scene: ShallowRef<Scene | undefined>
  getModelID: () => number | undefined
  onLevels: (levels: IModelLevels[]) => void
}

export const useIfcSubsets = (options: UseIfcSubsetsOptions) => {
  const modelLevels = ref<IModelLevels[]>([])
  const subsets: ISubsets = {}

  const resetSubsets = (): void => {
    for (const customID of Object.keys(subsets)) {
      delete subsets[customID]
    }
    modelLevels.value = []
  }

  const newSubsetOfType = (ids: number[], customID: string) => {
    const modelID = options.getModelID()
    if (modelID == null) return
    return options.ifcViewing.value?.IFC.loader.ifcManager.createSubset({
      modelID,
      scene: options.scene.value,
      ids,
      removePrevious: true,
      customID,
    })
  }

  const removeSubset = (customID: string): void => {
    const modelID = options.getModelID()
    if (modelID == null) return
    options.ifcViewing.value?.IFC.loader.ifcManager.removeSubset(modelID, undefined, customID)
  }

  const setModelLevels = async (elements: IModelElement[]): Promise<void> => {
    const nextLevels: IModelLevels[] = []
    for (const [index, element] of elements.entries()) {
      if (!('children' in element)) continue
      const ids = element.children
        .filter((el: IModelElement) => !IFC_TYPES_WITHOUT_MESH.has(el.type))
        .map((el: IModelElement) => el.expressID)
      const customID = `${index}-level`
      nextLevels.push({
        ids,
        check: true,
        customID,
        type: element.type,
        children: element.children,
        expressID: element.expressID,
      })
      const subset = await newSubsetOfType(ids, customID)
      if (subset) subsets[customID] = subset
    }
    modelLevels.value = nextLevels
    options.onLevels(nextLevels)
  }

  const setSpatialStructure = async (): Promise<void> => {
    const structure = await options.ifcViewing.value?.IFC.getSpatialStructure(0)
    const spatialStructure: IModelElement[] = structure?.children[0]?.children[0].children ?? []
    await setModelLevels(spatialStructure)
  }

  const addHide = async (customID: string): Promise<void> => {
    const ids = modelLevels.value.find((level) => level.customID === customID)?.ids || []
    removeSubset(customID)
    const subset = await newSubsetOfType(ids, customID)
    if (subset) subsets[customID] = subset
  }

  const setLevelHide = (data: IDataLevelHide): void => {
    if (data.check) {
      void addHide(data.customID)
      return
    }
    removeSubset(data.customID)
  }

  const highlightModelLevel = (level: number[]): void => {
    const modelID = options.getModelID()
    if (modelID == null) return
    options.ifcViewing.value?.IFC.selector.pickIfcItemsByID(modelID, level)
  }

  return {
    resetSubsets,
    setSpatialStructure,
    setLevelHide,
    highlightModelLevel,
  }
}
