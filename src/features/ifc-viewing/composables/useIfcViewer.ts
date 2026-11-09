import { onMounted, onScopeDispose, ref, shallowRef } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'
import { Color, type Scene } from 'three'
import { IfcViewerAPI } from 'web-ifc-viewer'
import type { IFCModel } from 'web-ifc-three/IFC/components/IFCModel'
import type { IIfcViewerAPI } from '@/features/ifc-viewing/types/ifc'
import { isIfcFile } from '@/features/ifc-viewing/utils/isIfcFile'

const DEMO_IFC_URL = '../ifc/demo.ifc'
const WASM_PATH = '../wasm/'
const LOADING_TEXT = 'Загрузка…'
const OPTIONS_LOADING = {
  lock: true,
  text: LOADING_TEXT,
}
const MESSAGE_LOAD_FAILED = 'Не удалось открыть модель IFC.'

type UseIfcViewerOptions = {
  onLoadStart?: () => void
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

  let loadId = 0

  const beginLoad = (): number => {
    loadId += 1
    return loadId
  }

  const isCurrentLoad = (id: number): boolean => id === loadId

  const closeLoading = (): void => {
    loadingIfc.value?.close()
    loadingIfc.value = undefined
  }

  const openLoading = (): void => {
    if (loadingIfc.value) {
      loadingIfc.value.setText(LOADING_TEXT)
      return
    }
    loadingIfc.value = ElLoading.service(OPTIONS_LOADING)
  }

  const reportProgress = (
    id: number,
    loaded: number,
    total: number,
    from: number,
    to: number,
  ): void => {
    if (!isCurrentLoad(id) || !Number.isFinite(loaded) || !Number.isFinite(total) || total <= 0) return
    const ratio = Math.min(Math.max(loaded / total, 0), 1)
    const percent = Math.round(from + ratio * (to - from))
    loadingIfc.value?.setText(`${LOADING_TEXT} ${percent}%`)
  }

  const showLoadError = (): void => {
    ElMessage({
      showClose: true,
      message: MESSAGE_LOAD_FAILED,
      type: 'error',
    })
  }

  const releaseObjectUrl = (url: string): void => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url)
  }

  const resetFileInput = (): void => {
    if (file.value) file.value.value = ''
  }

  const load = async (url: string, id: number): Promise<void> => {
    const viewer = ifcViewing.value
    try {
      if (!isCurrentLoad(id) || !viewer) return
      openLoading()
      model.value = undefined
      scene.value = undefined
      options.onLoadStart?.()
      viewer.IFC.loader.ifcManager.setOnProgress((event) => {
        reportProgress(id, event.loaded, event.total, 50, 100)
      })
      await viewer.IFC.setWasmPath(WASM_PATH)
      if (!isCurrentLoad(id)) return
      const loaded: IFCModel | null | undefined = await viewer.IFC.loadIfcUrl(
        url,
        true,
        (event) => {
          if (!event.lengthComputable) return
          reportProgress(id, event.loaded, event.total, 0, 50)
        },
      )
      if (!isCurrentLoad(id)) return
      const modelID = loaded?.modelID
      if (loaded == null || modelID == null) {
        options.onLoadStart?.()
        showLoadError()
        return
      }
      model.value = loaded
      await viewer.shadowDropper.renderShadow(modelID)
      if (!isCurrentLoad(id)) return
      viewer.context.ifcCamera.cameraControls.saveState()
      scene.value = viewer.context.getScene()
      loaded.removeFromParent()
      options.onModelReady?.()
      await options.onSpatialStructure?.()
    } catch {
      if (!isCurrentLoad(id)) return
      model.value?.removeFromParent()
      model.value = undefined
      scene.value = undefined
      options.onLoadStart?.()
      showLoadError()
    } finally {
      releaseObjectUrl(url)
      if (isCurrentLoad(id)) closeLoading()
    }
  }

  const handleFileUpload = async (): Promise<void> => {
    const input = file.value
    const fileIfc = input?.files?.[0]
    if (!input) return
    if (!fileIfc || !isIfcFile(fileIfc.name)) {
      ElMessage({
        showClose: true,
        message: 'Вы загрузили не ifc формат.',
        type: 'error',
      })
      resetFileInput()
      return
    }
    const id = beginLoad()
    closeLoading()
    openLoading()
    const objectUrl = URL.createObjectURL(fileIfc)
    resetFileInput()
    try {
      await ifcViewing.value?.dispose()
      if (!isCurrentLoad(id)) {
        releaseObjectUrl(objectUrl)
        return
      }
      init()
    } catch {
      releaseObjectUrl(objectUrl)
      if (!isCurrentLoad(id)) return
      showLoadError()
      closeLoading()
      return
    }
    void load(objectUrl, id)
    options.onFileSelected?.()
  }

  const resetView = (): void => {
    ifcViewing.value?.context.ifcCamera.cameraControls.reset()
  }

  let resizeObserver: ResizeObserver | undefined

  const resizeViewer = (): void => {
    ifcViewing.value?.context.updateAspect()
  }

  const observeContainer = (): void => {
    if (!container.value || typeof ResizeObserver === 'undefined') return
    resizeObserver = new ResizeObserver(() => resizeViewer())
    resizeObserver.observe(container.value)
  }

  const dispose = (): void => {
    resizeObserver?.disconnect()
    ifcViewing.value?.dispose()
  }

  onScopeDispose(() => resizeObserver?.disconnect())

  onMounted(() => {
    init()
    observeContainer()
    void load(DEMO_IFC_URL, beginLoad())
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
