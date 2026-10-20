import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { Color } from 'three'
import { useIfcViewer } from '@/features/ifc-viewing/composables/useIfcViewer'

interface MockModel {
  modelID: number
  removeFromParent: ReturnType<typeof vi.fn>
}

interface MockViewer {
  grid: { setGrid: ReturnType<typeof vi.fn> }
  axes: { setAxes: ReturnType<typeof vi.fn> }
  clipper: { active: boolean }
  context: {
    ifcCamera: {
      cameraControls: {
        setPosition: ReturnType<typeof vi.fn>
        zoomTo: ReturnType<typeof vi.fn>
        saveState: ReturnType<typeof vi.fn>
        reset: ReturnType<typeof vi.fn>
      }
    }
    getScene: ReturnType<typeof vi.fn>
    resize: ReturnType<typeof vi.fn>
  }
  IFC: {
    setWasmPath: ReturnType<typeof vi.fn>
    loadIfcUrl: ReturnType<typeof vi.fn>
  }
  shadowDropper: { renderShadow: ReturnType<typeof vi.fn> }
  dispose: ReturnType<typeof vi.fn>
}

const viewerMock = vi.hoisted(() => {
  const state: { model: MockModel | undefined } = {
    model: { modelID: 1, removeFromParent: vi.fn() },
  }
  const viewers: MockViewer[] = []
  const createViewer = (): MockViewer => {
    const viewer: MockViewer = {
      grid: { setGrid: vi.fn() },
      axes: { setAxes: vi.fn() },
      clipper: { active: false },
      context: {
        ifcCamera: {
          cameraControls: {
            setPosition: vi.fn(),
            zoomTo: vi.fn(),
            saveState: vi.fn(),
            reset: vi.fn(),
          },
        },
        getScene: vi.fn(() => ({ name: 'scene' })),
        resize: vi.fn(),
      },
      IFC: {
        setWasmPath: vi.fn(async () => undefined),
        loadIfcUrl: vi.fn(async () => state.model),
      },
      shadowDropper: { renderShadow: vi.fn(async () => undefined) },
      dispose: vi.fn(),
    }
    viewers.push(viewer)
    return viewer
  }
  const IfcViewerAPI = vi.fn(function MockIfcViewerAPI() {
    return createViewer()
  })
  const close = vi.fn()
  const service = vi.fn(() => ({ close }))
  const message = vi.fn()
  return { state, viewers, IfcViewerAPI, close, service, message }
})

vi.mock('web-ifc-viewer', () => ({
  IfcViewerAPI: viewerMock.IfcViewerAPI,
}))

vi.mock('element-plus', () => ({
  ElLoading: { service: viewerMock.service },
  ElMessage: viewerMock.message,
}))

const mountViewer = (options?: Parameters<typeof useIfcViewer>[0]) => {
  let api!: ReturnType<typeof useIfcViewer>
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useIfcViewer(options)
        return () => null
      },
    }),
  )
  return { wrapper, api }
}

const fileInput = (name: string): HTMLInputElement => {
  const input = document.createElement('input')
  const file = new File(['ISO-10303-21;'], name)
  Object.defineProperty(input, 'files', { value: [file] })
  return input
}

describe('useIfcViewer', () => {
  beforeEach(() => {
    viewerMock.viewers.length = 0
    viewerMock.state.model = { modelID: 1, removeFromParent: vi.fn() }
    viewerMock.close.mockClear()
    viewerMock.service.mockClear()
    viewerMock.message.mockClear()
    viewerMock.IfcViewerAPI.mockClear()
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(() => 'blob:ifc'),
    })
  })

  it('loads the demo model after mount', async () => {
    const onModelReady = vi.fn()
    const onSpatialStructure = vi.fn(async () => undefined)
    const { api } = mountViewer({ onModelReady, onSpatialStructure })
    await flushPromises()

    const viewer = viewerMock.viewers[0]
    expect(viewerMock.IfcViewerAPI).toHaveBeenCalledWith({
      container: undefined,
      backgroundColor: expect.any(Color),
    })
    expect(viewer.grid.setGrid).toHaveBeenCalled()
    expect(viewer.axes.setAxes).toHaveBeenCalledWith(10)
    expect(viewer.clipper.active).toBe(true)
    expect(viewer.context.ifcCamera.cameraControls.setPosition).toHaveBeenCalledWith(0, 0, 95)
    expect(viewer.context.ifcCamera.cameraControls.zoomTo).toHaveBeenCalledWith(4)
    expect(viewer.IFC.setWasmPath).toHaveBeenCalledWith('../wasm/')
    expect(viewer.IFC.loadIfcUrl).toHaveBeenCalledWith('../ifc/demo.ifc', true)
    expect(viewer.shadowDropper.renderShadow).toHaveBeenCalledWith(1)
    expect(viewer.context.getScene).toHaveBeenCalled()
    expect(viewerMock.state.model?.removeFromParent).toHaveBeenCalled()
    expect(onModelReady).toHaveBeenCalled()
    expect(onSpatialStructure).toHaveBeenCalled()
    expect(api.getModelID()).toBe(1)
    expect(api.scene.value).toEqual({ name: 'scene' })
  })

  it('stops loading when the model has no id', async () => {
    viewerMock.state.model = undefined
    const onModelReady = vi.fn()
    const onSpatialStructure = vi.fn()
    const { api } = mountViewer({ onModelReady, onSpatialStructure })
    await flushPromises()

    expect(api.getModelID()).toBeUndefined()
    expect(onModelReady).not.toHaveBeenCalled()
    expect(onSpatialStructure).not.toHaveBeenCalled()
  })

  it('rejects a file that is not ifc', async () => {
    const onFileSelected = vi.fn()
    const { api } = mountViewer({ onFileSelected })
    await flushPromises()
    api.file.value = fileInput('notes.txt')
    api.handleFileUpload()

    expect(viewerMock.message).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Вы загрузили не ifc формат.',
        type: 'error',
      }),
    )
    expect(onFileSelected).not.toHaveBeenCalled()
    expect(viewerMock.viewers[0].dispose).not.toHaveBeenCalled()
    expect(viewerMock.viewers).toHaveLength(1)
  })

  it('reloads the viewer for an ifc file', async () => {
    const onFileSelected = vi.fn()
    const { api } = mountViewer({ onFileSelected })
    await flushPromises()
    api.file.value = fileInput('house.ifc')
    api.handleFileUpload()
    await flushPromises()

    expect(viewerMock.service).toHaveBeenCalledWith({ lock: true, text: 'Loading' })
    expect(viewerMock.viewers[0].dispose).toHaveBeenCalled()
    expect(viewerMock.viewers[1].IFC.loadIfcUrl).toHaveBeenCalledWith('blob:ifc', true)
    expect(onFileSelected).toHaveBeenCalled()
    expect(viewerMock.close).toHaveBeenCalled()
  })

  it('resets, resizes, and disposes the current viewer', async () => {
    const { api } = mountViewer()
    await flushPromises()
    const viewer = viewerMock.viewers[0]

    api.resetView()
    api.resizeViewer()
    api.dispose()

    expect(viewer.context.ifcCamera.cameraControls.reset).toHaveBeenCalled()
    expect(viewer.context.resize).toHaveBeenCalled()
    expect(viewer.dispose).toHaveBeenCalled()
  })
})
