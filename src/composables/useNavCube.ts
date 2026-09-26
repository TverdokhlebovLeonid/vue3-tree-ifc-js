import { shallowRef } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import type { IFCModel } from 'web-ifc-three/IFC/components/IFCModel'
import type { IIfcViewerAPI } from '@/types/ifc'
import { NavCube } from '@/components/IfcViewing/NavigationCube/NavCube'

const HTML_ELEMENT_CUBE = '.ifc-viewing__container_cube'

type UseNavCubeOptions = {
  ifcViewing: ShallowRef<IIfcViewerAPI | undefined>
  model: ShallowRef<IFCModel | undefined>
  container: Ref<HTMLDivElement | undefined>
}

export const useNavCube = (options: UseNavCubeOptions) => {
  const navCube = shallowRef<NavCube | null>(null)

  const activate = (): void => {
    if (!options.ifcViewing.value || !options.model.value) return
    options.ifcViewing.value.container = options.container.value
    navCube.value = new NavCube(options.ifcViewing.value, HTML_ELEMENT_CUBE)
    navCube.value.onPick(options.model.value)
  }

  const deactivate = (): void => {
    if (!navCube.value) return
    delete options.ifcViewing.value?.container
    navCube.value.deleteElement()
    navCube.value = null
  }

  return { activate, deactivate }
}
