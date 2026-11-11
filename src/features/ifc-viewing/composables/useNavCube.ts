import { shallowRef } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import type { IFCModel } from 'web-ifc-three/IFC/components/IFCModel'
import type { IIfcViewerAPI } from '@/features/ifc-viewing/types/ifc'
import { NavCube } from '@/features/ifc-viewing/navigation-cube/NavCube'

type UseNavCubeOptions = {
  ifcViewing: ShallowRef<IIfcViewerAPI | undefined>
  model: ShallowRef<IFCModel | undefined>
  cube: Ref<HTMLDivElement | undefined>
}

export const useNavCube = (options: UseNavCubeOptions) => {
  const navCube = shallowRef<NavCube | null>(null)

  const activate = (): void => {
    const cube = options.cube.value
    if (!options.ifcViewing.value || !options.model.value || !cube) return
    navCube.value = new NavCube(options.ifcViewing.value, cube)
    navCube.value.onPick(options.model.value)
  }

  const deactivate = (): void => {
    if (!navCube.value) return
    navCube.value.dispose()
    navCube.value = null
  }

  return { activate, deactivate }
}
