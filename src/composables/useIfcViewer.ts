import { onMounted, ref, shallowRef } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'
import { Color, type Scene } from 'three'
import { IfcViewerAPI } from 'web-ifc-viewer'
import type { IfcContext } from 'web-ifc-viewer/dist/components'
import type { IFCModel } from 'web-ifc-three/IFC/components/IFCModel'
import type { IIfcViewerAPI } from '@/types/ifc'
import { isIfcFile } from '@/utils/isIfcFile'

const DEMO_IFC_URL = '../ifc/demo.ifc'
const WASM_PATH = '../wasm/'
const OPTIONS_LOADING = {
  lock: true,
  text: 'Loading',
}

type UseIfcViewerOptions = {
  onModelReady?: () => void
  onSpatialStructure?: () => Promise<void> | void
  onFileSelected?: () => void
}

export const useIfcViewer = (options: UseIfcViewerOptions = {}) => {
  const file = ref<HTMLInputElement>()
  const container = ref<HTMLDivElement>()
  const ifcViewing = shallowRef<IIfcViewerAPI>()
  const model = shallowRef<IFCModel>()
  const scene = shallowRef<Scene>()
  const loadingIfc = ref<ReturnType<typeof ElLoading.service>>()

  const getModelID = (): number | undefined => {
    const modelID = model.value?.modelID
    return modelID == null ? undefined : modelID
  }

  const init = (): void => {
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

  const closeLoading = (): void => {
    if (loadingIfc.value) loadingIfc.value.close()
  }

  const load = async (url: string): Promise<void> => {
    await ifcViewing.value?.IFC.setWasmPath(WASM_PATH)
    model.value = await ifcViewing.value?.IFC.loadIfcUrl(url, true)
    const modelID = getModelID()
    if (modelID == null) {
      closeLoading()
      return
    }
    await ifcViewing.value?.shadowDropper.renderShadow(modelID)
    ifcViewing.value?.context.ifcCamera.cameraControls.saveState()
    scene.value = ifcViewing.value?.context.getScene()
    model.value?.removeFromParent()
    options.onModelReady?.()
    closeLoading()
    await options.onSpatialStructure?.()
  }

  const handleFileUpload = (): void => {
    const fileIfc = file.value?.files?.[0]
    if (!file.value) return
    if (fileIfc && isIfcFile(fileIfc.name)) {
      loadingIfc.value = ElLoading.service(OPTIONS_LOADING)
      ifcViewing.value?.dispose()
      init()
      void load(URL.createObjectURL(fileIfc))
      options.onFileSelected?.()
      return
    }
    ElMessage({
      showClose: true,
      message: 'Вы загрузили не ifc формат.',
      type: 'error',
    })
  }

  const resetView = (): void => {
    ifcViewing.value?.context.ifcCamera.cameraControls.reset()
  }

  const resizeViewer = (): void => {
    if (ifcViewing.value?.context as IfcContext) ifcViewing.value?.context['resize']()
  }

  const dispose = (): void => {
    ifcViewing.value?.dispose()
  }

  onMounted(() => {
    init()
    void load(DEMO_IFC_URL)
  })

  return {
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
  }
}
