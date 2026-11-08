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
        updateAspect: ReturnType<typeof vi.fn>
  }
  IFC: {
    setWasmPath: ReturnType<typeof vi.fn>
    loadIfcUrl: ReturnType<typeof vi.fn>
  }
  shadowDropper: { renderShadow: ReturnType<typeof vi.fn> }
  dispose: ReturnType<typeof vi.fn>
}

const viewerMock = vi.hoisted(() => {
  const state: {
    model: MockModel | undefined
    loadModel: (() => Promise<MockModel | undefined>) | undefined
    renderShadow: (() => Promise<void>) | undefined
  } = {
    model: { modelID: 1, removeFromParent: vi.fn() },
    loadModel: undefined,
    renderShadow: undefined,
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
        updateAspect: vi.fn(),
      },
      IFC: {
        setWasmPath: vi.fn(async () => undefined),
        loadIfcUrl: vi.fn(async () => (state.loadModel ? state.loadModel() : state.model)),
      },
      shadowDropper: {
        renderShadow: vi.fn(async () => {
          if (state.renderShadow) await state.renderShadow()
        }),
      },
      dispose: vi.fn(async () => undefined),
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

const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
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
    viewerMock.state.loadModel = undefined
    viewerMock.state.renderShadow = undefined
    viewerMock.close.mockClear()
    viewerMock.service.mockClear()
    viewerMock.message.mockClear()
    viewerMock.IfcViewerAPI.mockClear()
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(() => 'blob:ifc'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(),
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
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
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
    expect(viewerMock.message).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Не удалось открыть модель IFC.',
        type: 'error',
      }),
    )
  })

  it('rejects a file that is not ifc', async () => {
    const onFileSelected = vi.fn()
    const { api } = mountViewer({ onFileSelected })
    await flushPromises()
    const input = fileInput('notes.txt')
    api.file.value = input
    api.handleFileUpload()

    expect(input.value).toBe('')
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
    const input = fileInput('house.ifc')
    api.file.value = input
    api.handleFileUpload()
    await flushPromises()

    expect(input.value).toBe('')
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:ifc')
    expect(viewerMock.service).toHaveBeenCalledWith({ lock: true, text: 'Loading' })
    expect(viewerMock.viewers[0].dispose).toHaveBeenCalled()
    expect(viewerMock.viewers[0].dispose.mock.invocationCallOrder[0]).toBeLessThan(
      viewerMock.IfcViewerAPI.mock.invocationCallOrder[1],
    )
    expect(viewerMock.viewers[1].IFC.loadIfcUrl).toHaveBeenCalledWith('blob:ifc', true)
    expect(onFileSelected).toHaveBeenCalled()
    expect(viewerMock.close).toHaveBeenCalled()
  })

  it('reports a broken model and closes the loading overlay', async () => {
    const onLoadStart = vi.fn()
    const onModelReady = vi.fn()
    const { api } = mountViewer({ onLoadStart, onModelReady })
    await flushPromises()
    viewerMock.state.model = undefined
    api.file.value = fileInput('broken.ifc')
    await api.handleFileUpload()
    await flushPromises()

    expect(onLoadStart.mock.calls.length).toBeGreaterThanOrEqual(3)
    expect(onModelReady).toHaveBeenCalledTimes(1)
    expect(api.getModelID()).toBeUndefined()
    expect(viewerMock.message).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Не удалось открыть модель IFC.',
        type: 'error',
      }),
    )
    expect(viewerMock.close).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:ifc')
  })

  it('closes loading when reading the model throws', async () => {
    const onModelReady = vi.fn()
    const onSpatialStructure = vi.fn()
    const { api } = mountViewer({ onModelReady, onSpatialStructure })
    await flushPromises()
    viewerMock.state.renderShadow = async () => {
      throw new Error('shadow')
    }
    api.file.value = fileInput('house.ifc')
    await api.handleFileUpload()
    await flushPromises()

    expect(onModelReady).toHaveBeenCalledTimes(1)
    expect(onSpatialStructure).toHaveBeenCalledTimes(1)
    expect(api.getModelID()).toBeUndefined()
    expect(viewerMock.state.model?.removeFromParent).toHaveBeenCalled()
    expect(viewerMock.message).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Не удалось открыть модель IFC.', type: 'error' }),
    )
    expect(viewerMock.close).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:ifc')
  })

  it('revokes the object url when the previous viewer cannot be disposed', async () => {
    const { api } = mountViewer()
    await flushPromises()
    viewerMock.viewers[0].dispose.mockRejectedValueOnce(new Error('dispose'))
    const input = fileInput('house.ifc')
    api.file.value = input
    await api.handleFileUpload()

    expect(viewerMock.viewers).toHaveLength(1)
    expect(viewerMock.viewers[0].IFC.loadIfcUrl).toHaveBeenCalledTimes(1)
    expect(input.value).toBe('')
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:ifc')
    expect(viewerMock.message).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Не удалось открыть модель IFC.', type: 'error' }),
    )
    expect(viewerMock.close).toHaveBeenCalledTimes(1)
  })

  it('creates the next viewer only after dispose finishes', async () => {
    const { api } = mountViewer()
    await flushPromises()
    let releaseDispose = (): void => undefined
    viewerMock.viewers[0].dispose.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          releaseDispose = resolve
        }),
    )
    api.file.value = fileInput('house.ifc')
    const pending = api.handleFileUpload()
    await flushPromises()

    expect(viewerMock.viewers).toHaveLength(1)
    releaseDispose()
    await pending
    await flushPromises()
    expect(viewerMock.viewers).toHaveLength(2)
    expect(viewerMock.viewers[1].IFC.loadIfcUrl).toHaveBeenCalledWith('blob:ifc', true)
  })

  it('discards a load that finishes after a newer file', async () => {
    const demo = deferred<MockModel>()
    const uploaded = deferred<MockModel>()
    const queue = [demo.promise, uploaded.promise]
    viewerMock.state.loadModel = () => queue.shift() ?? Promise.resolve(viewerMock.state.model)
    const onLoadStart = vi.fn()
    const onModelReady = vi.fn()
    const onSpatialStructure = vi.fn()
    const { api } = mountViewer({ onLoadStart, onModelReady, onSpatialStructure })
    await flushPromises()
    api.file.value = fileInput('house.ifc')
    const pending = api.handleFileUpload()
    await flushPromises()

    demo.resolve({ modelID: 11, removeFromParent: vi.fn() })
    await flushPromises()
    expect(onModelReady).not.toHaveBeenCalled()
    expect(onSpatialStructure).not.toHaveBeenCalled()
    expect(api.getModelID()).toBeUndefined()
    expect(viewerMock.viewers[0].shadowDropper.renderShadow).not.toHaveBeenCalled()
    expect(viewerMock.close).not.toHaveBeenCalled()
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()

    uploaded.resolve({ modelID: 22, removeFromParent: vi.fn() })
    await pending
    await flushPromises()
    expect(api.getModelID()).toBe(22)
    expect(onModelReady).toHaveBeenCalledTimes(1)
    expect(onSpatialStructure).toHaveBeenCalledTimes(1)
    expect(viewerMock.viewers[1].shadowDropper.renderShadow).toHaveBeenCalledWith(22)
    expect(viewerMock.close).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:ifc')
    expect(onLoadStart).toHaveBeenCalledTimes(2)
  })

  it('resets, resizes, and disposes the current viewer', async () => {
    const { api } = mountViewer()
    await flushPromises()
    const viewer = viewerMock.viewers[0]

    api.resetView()
    api.resizeViewer()
    api.dispose()

    expect(viewer.context.ifcCamera.cameraControls.reset).toHaveBeenCalled()
    expect(viewer.context.updateAspect).toHaveBeenCalled()
    expect(viewer.dispose).toHaveBeenCalled()
  })
})
