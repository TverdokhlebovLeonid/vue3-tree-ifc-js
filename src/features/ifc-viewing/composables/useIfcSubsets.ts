import { ref } from 'vue'
import type { ShallowRef } from 'vue'
import type { Scene } from 'three'
import type {
  IDataLevelHide,
  IIfcViewerAPI,
  IModelElement,
  IModelLevels,
} from '@/features/ifc-viewing/types/ifc'
import {
  collectSpatialLevels,
  collectSubsetIds,
} from '@/features/ifc-viewing/utils/spatialStructure'

type UseIfcSubsetsOptions = {
  ifcViewing: ShallowRef<IIfcViewerAPI | undefined>
  scene: ShallowRef<Scene | undefined>
  getModelID: () => number | undefined
  onLevels: (levels: IModelLevels[]) => void
}

export const useIfcSubsets = (options: UseIfcSubsetsOptions) => {
  const modelLevels = ref<IModelLevels[]>([])

  const resetSubsets = (): void => {
    modelLevels.value = []
  }

  const newSubsetOfType = (ids: number[], customID: string): void => {
    const modelID = options.getModelID()
    if (modelID == null) return
    options.ifcViewing.value?.IFC.loader.ifcManager.createSubset({
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

  const setModelLevels = (elements: IModelElement[]): void => {
    const nextLevels: IModelLevels[] = []
    for (const [index, element] of elements.entries()) {
      if (!('children' in element)) continue
      const ids = collectSubsetIds(element)
      const customID = `${index}-level`
      nextLevels.push({
        ids,
        visible: true,
        customID,
        type: element.type,
        children: element.children,
        expressID: element.expressID,
      })
      newSubsetOfType(ids, customID)
    }
    modelLevels.value = nextLevels
    options.onLevels(nextLevels)
  }

  const setSpatialStructure = async (): Promise<void> => {
    const modelID = options.getModelID()
    const structure =
      modelID == null ? null : await options.ifcViewing.value?.IFC.getSpatialStructure(modelID)
    setModelLevels(collectSpatialLevels(structure))
  }

  const addHide = (customID: string): void => {
    const level = modelLevels.value.find((item) => item.customID === customID)
    if (!level) return
    removeSubset(customID)
    newSubsetOfType(level.ids, customID)
  }

  const setLevelHide = (data: IDataLevelHide): void => {
    if (data.visible) {
      addHide(data.customID)
      return
    }
    removeSubset(data.customID)
  }

  const highlightModelLevel = (ids: number[]): void => {
    const selector = options.ifcViewing.value?.IFC.selector
    if (!ids.length) {
      selector?.unpickIfcItems()
      return
    }
    const modelID = options.getModelID()
    if (modelID == null) return
    selector?.pickIfcItemsByID(modelID, ids)
  }

  return {
    resetSubsets,
    setSpatialStructure,
    setLevelHide,
    highlightModelLevel,
  }
}
