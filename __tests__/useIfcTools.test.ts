import { ref, shallowRef } from 'vue'
import { useIfcTools } from '@/features/ifc-viewing/composables/useIfcTools'
import { IFC_VIEWING_TOOLS } from '@/features/ifc-viewing/constants/ifcViewingTools'
import type { IIfcViewerAPI } from '@/features/ifc-viewing/types/ifc'

const createHarness = () => {
  const castRayIfc = vi.fn((): { point?: { x: number; y: number; z: number } } | undefined => ({
    point: { x: 1, y: 2, z: 3 },
  }))
  const prePickIfcItem = vi.fn()
  const unPrepickIfcItems = vi.fn()
  const createPlane = vi.fn()
  const deletePlane = vi.fn()
  const deleteAllPlanes = vi.fn()
  const ifcViewing = shallowRef({
    context: { castRayIfc },
    IFC: { selector: { prePickIfcItem, unPrepickIfcItems } },
    clipper: { createPlane, deletePlane, deleteAllPlanes },
  } as unknown as IIfcViewerAPI)
  const activeTool = ref('')
  const onActivateNavCube = vi.fn()
  const onDeactivateNavCube = vi.fn()
  const tools = useIfcTools({
    ifcViewing,
    activeTool,
    onActivateNavCube,
    onDeactivateNavCube,
  })
  return {
    castRayIfc,
    prePickIfcItem,
    unPrepickIfcItems,
    createPlane,
    deletePlane,
    deleteAllPlanes,
    activeTool,
    onActivateNavCube,
    onDeactivateNavCube,
    tools,
  }
}

describe('useIfcTools', () => {
  it('creates a plane and ignores a repeated selection', () => {
    const harness = createHarness()
    harness.tools.toolSelection(IFC_VIEWING_TOOLS.createPlane)
    harness.tools.toolSelection(IFC_VIEWING_TOOLS.createPlane)

    expect(harness.activeTool.value).toBe(IFC_VIEWING_TOOLS.createPlane)
    expect(harness.createPlane).toHaveBeenCalledTimes(1)
    expect(harness.onDeactivateNavCube).toHaveBeenCalledTimes(1)
  })

  it('turns the nav cube on after deactivating the previous tool', () => {
    const order: string[] = []
    const harness = createHarness()
    harness.onDeactivateNavCube.mockImplementation(() => order.push('off'))
    harness.onActivateNavCube.mockImplementation(() => order.push('on'))
    harness.tools.toolSelection(IFC_VIEWING_TOOLS.navCube)

    expect(order).toEqual(['off', 'on'])
    expect(harness.activeTool.value).toBe(IFC_VIEWING_TOOLS.navCube)
    expect(harness.createPlane).not.toHaveBeenCalled()
  })

  it('clears the active tool without creating a plane', () => {
    const harness = createHarness()
    harness.tools.toolSelection(IFC_VIEWING_TOOLS.createPlane)
    harness.tools.toolSelection('')

    expect(harness.activeTool.value).toBe('')
    expect(harness.createPlane).toHaveBeenCalledTimes(1)
    expect(harness.unPrepickIfcItems).toHaveBeenCalledTimes(1)
  })

  it('deletes every plane when the plane tool is cancelled', () => {
    const harness = createHarness()
    harness.tools.toolSelection(IFC_VIEWING_TOOLS.createPlane)
    harness.tools.toolSelection(IFC_VIEWING_TOOLS.cancelPlane)

    expect(harness.deleteAllPlanes).toHaveBeenCalledTimes(1)
    expect(harness.unPrepickIfcItems).toHaveBeenCalledTimes(1)
    expect(harness.activeTool.value).toBe('')
    expect(harness.onDeactivateNavCube).toHaveBeenCalled()
  })

  it('raycasts only for the active coordinate or plane tool', () => {
    const harness = createHarness()
    harness.tools.setMovingMouse()
    expect(harness.castRayIfc).not.toHaveBeenCalled()
    expect(harness.prePickIfcItem).not.toHaveBeenCalled()

    harness.tools.toolSelection(IFC_VIEWING_TOOLS.createCoordinates)
    harness.tools.setMovingMouse()
    expect(harness.tools.modelCoordinates.value).toEqual({ x: 1, y: 2, z: 3 })
    expect(harness.prePickIfcItem).not.toHaveBeenCalled()

    harness.tools.toolSelection(IFC_VIEWING_TOOLS.createPlane)
    harness.tools.setMovingMouse()
    expect(harness.castRayIfc).toHaveBeenCalledTimes(1)
    expect(harness.prePickIfcItem).toHaveBeenCalledTimes(1)
    expect(harness.unPrepickIfcItems).not.toHaveBeenCalled()

    harness.tools.toolSelection(IFC_VIEWING_TOOLS.createCoordinates)
    expect(harness.unPrepickIfcItems).toHaveBeenCalledTimes(1)
  })

  it('resets coordinates when the coordinate tool is selected again', () => {
    const harness = createHarness()
    harness.tools.toolSelection(IFC_VIEWING_TOOLS.createCoordinates)
    harness.tools.setMovingMouse()
    harness.tools.toolSelection('')
    harness.tools.toolSelection(IFC_VIEWING_TOOLS.createCoordinates)

    expect(harness.tools.modelCoordinates.value).toEqual({ x: 0, y: 0, z: 0 })
  })

  it('rounds coordinates to two decimals', () => {
    const harness = createHarness()
    harness.castRayIfc.mockReturnValueOnce({ point: { x: 1.234, y: 2.236, z: -3.001 } })
    harness.tools.toolSelection(IFC_VIEWING_TOOLS.createCoordinates)
    harness.tools.setMovingMouse()

    expect(harness.tools.modelCoordinates.value).toEqual({ x: 1.23, y: 2.24, z: -3 })
  })

  it('writes null coordinates when the ray misses', () => {
    const harness = createHarness()
    harness.castRayIfc.mockReturnValueOnce(undefined)
    harness.tools.toolSelection(IFC_VIEWING_TOOLS.createCoordinates)
    harness.tools.setMovingMouse()

    expect(harness.tools.modelCoordinates.value).toEqual({ x: null, y: null, z: null })
  })

  it('adds and removes a plane only while the plane tool is active', () => {
    const harness = createHarness()
    harness.tools.setDoubleChoice()
    harness.tools.setRightChoice()
    expect(harness.createPlane).not.toHaveBeenCalled()
    expect(harness.deletePlane).not.toHaveBeenCalled()

    harness.tools.toolSelection(IFC_VIEWING_TOOLS.createPlane)
    harness.createPlane.mockClear()
    harness.tools.setDoubleChoice()
    harness.tools.setRightChoice()

    expect(harness.createPlane).toHaveBeenCalledTimes(1)
    expect(harness.deletePlane).toHaveBeenCalledTimes(1)
  })
})
