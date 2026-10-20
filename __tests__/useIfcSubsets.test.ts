import { shallowRef } from 'vue'
import { flushPromises } from '@vue/test-utils'
import type { Scene } from 'three'
import { useIfcSubsets } from '@/features/ifc-viewing/composables/useIfcSubsets'
import type { IIfcViewerAPI, IModelElement } from '@/features/ifc-viewing/types/ifc'

const spatialRoot = (): IModelElement => ({
  expressID: 1,
  type: 'IFCPROJECT',
  children: [
    {
      expressID: 2,
      type: 'IFCSITE',
      children: [
        {
          expressID: 3,
          type: 'IFCBUILDING',
          children: [
            {
              expressID: 10,
              type: 'IFCBUILDINGSTOREY',
              children: [
                { expressID: 100, type: 'IFCWALL', children: [] },
                { expressID: 101, type: 'IFCSPACE', children: [] },
              ],
            },
            { expressID: 11, type: 'IFCGRID', children: [] },
          ],
        },
      ],
    },
  ],
})

const createHarness = (modelID: number | null = 7) => {
  const resolvedModelID = modelID === null ? undefined : modelID
  const createSubset = vi.fn(async () => ({ id: 'subset' }))
  const removeSubset = vi.fn()
  const getSpatialStructure = vi.fn(async (): Promise<IModelElement | undefined> => spatialRoot())
  const pickIfcItemsByID = vi.fn()
  const scene = shallowRef({ name: 'scene' } as unknown as Scene)
  const ifcViewing = shallowRef({
    IFC: {
      getSpatialStructure,
      loader: { ifcManager: { createSubset, removeSubset } },
      selector: { pickIfcItemsByID },
    },
  } as unknown as IIfcViewerAPI)
  const onLevels = vi.fn()
  const subsets = useIfcSubsets({
    ifcViewing,
    scene,
    getModelID: () => resolvedModelID,
    onLevels,
  })
  return { createSubset, removeSubset, getSpatialStructure, pickIfcItemsByID, scene, onLevels, subsets }
}

describe('useIfcSubsets', () => {
  it('builds levels from the spatial structure and skips spaces', async () => {
    const { subsets, createSubset, getSpatialStructure, onLevels, scene } = createHarness()
    await subsets.setSpatialStructure()

    expect(getSpatialStructure).toHaveBeenCalledWith(0)
    expect(onLevels).toHaveBeenCalledWith([
      expect.objectContaining({
        customID: '0-level',
        expressID: 10,
        ids: [100],
        visible: true,
        type: 'IFCBUILDINGSTOREY',
      }),
      expect.objectContaining({
        customID: '1-level',
        expressID: 11,
        ids: [],
        visible: true,
        type: 'IFCGRID',
      }),
    ])
    expect(createSubset).toHaveBeenNthCalledWith(1, {
      modelID: 7,
      scene: scene.value,
      ids: [100],
      removePrevious: true,
      customID: '0-level',
    })
    expect(createSubset).toHaveBeenNthCalledWith(2, {
      modelID: 7,
      scene: scene.value,
      ids: [],
      removePrevious: true,
      customID: '1-level',
    })
  })

  it('emits an empty tree when the model has no spatial structure', async () => {
    const harness = createHarness()
    harness.getSpatialStructure.mockResolvedValueOnce(undefined)
    await harness.subsets.setSpatialStructure()

    expect(harness.onLevels).toHaveBeenCalledWith([])
    expect(harness.createSubset).not.toHaveBeenCalled()
  })

  it('does not create meshes without a model id', async () => {
    const harness = createHarness(null)
    await harness.subsets.setSpatialStructure()
    harness.subsets.setLevelHide({ customID: '0-level', visible: false })
    harness.subsets.highlightModelLevel([100])

    expect(harness.onLevels).toHaveBeenCalled()
    expect(harness.createSubset).not.toHaveBeenCalled()
    expect(harness.removeSubset).not.toHaveBeenCalled()
    expect(harness.pickIfcItemsByID).not.toHaveBeenCalled()
  })

  it('removes a hidden level and recreates it when shown again', async () => {
    const harness = createHarness()
    await harness.subsets.setSpatialStructure()
    harness.subsets.setLevelHide({ customID: '0-level', visible: false })
    expect(harness.removeSubset).toHaveBeenCalledWith(7, undefined, '0-level')

    harness.subsets.setLevelHide({ customID: '0-level', visible: true })
    await flushPromises()
    expect(harness.removeSubset).toHaveBeenCalledTimes(2)
    expect(harness.createSubset).toHaveBeenLastCalledWith(
      expect.objectContaining({ customID: '0-level', ids: [100] }),
    )
  })

  it('clears stored levels before a later show', async () => {
    const harness = createHarness()
    await harness.subsets.setSpatialStructure()
    harness.subsets.resetSubsets()
    harness.subsets.setLevelHide({ customID: '0-level', visible: true })
    await flushPromises()

    expect(harness.createSubset).toHaveBeenLastCalledWith(expect.objectContaining({ ids: [] }))
  })

  it('highlights express ids of the active level', async () => {
    const harness = createHarness()
    harness.subsets.highlightModelLevel([100, 101])
    expect(harness.pickIfcItemsByID).toHaveBeenCalledWith(7, [100, 101])
  })
})
