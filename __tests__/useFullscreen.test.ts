import { effectScope } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { useFullscreen } from '@/features/ifc-viewing/composables/useFullscreen'

const fullscreenState = { element: null as Element | null }

const installFullscreen = (): void => {
  Object.defineProperty(document.documentElement, 'requestFullscreen', {
    configurable: true,
    writable: true,
    value: vi.fn(async () => {
      fullscreenState.element = document.documentElement
    }),
  })
  Object.defineProperty(document, 'exitFullscreen', {
    configurable: true,
    writable: true,
    value: vi.fn(async () => {
      fullscreenState.element = null
    }),
  })
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    get: () => fullscreenState.element,
  })
}

describe('useFullscreen', () => {
  const addEventListener = vi.spyOn(document, 'addEventListener')
  const removeEventListener = vi.spyOn(document, 'removeEventListener')

  beforeEach(() => {
    fullscreenState.element = null
    addEventListener.mockClear()
    removeEventListener.mockClear()
    installFullscreen()
  })

  afterAll(() => {
    addEventListener.mockRestore()
    removeEventListener.mockRestore()
  })

  const start = () => {
    const scope = effectScope()
    const api = scope.run(() => useFullscreen())
    if (!api) throw new Error('fullscreen composable did not start')
    return { scope, api }
  }

  it('enters fullscreen and leaves it on the second toggle', async () => {
    const { api } = start()
    api.toggle()
    await flushPromises()
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled()
    expect(api.isFullscreen.value).toBe(true)

    api.toggle()
    await flushPromises()
    expect(document.exitFullscreen).toHaveBeenCalled()
    expect(api.isFullscreen.value).toBe(false)
  })

  it('stays closed when fullscreen was already closed', async () => {
    const { api } = start()
    api.close()
    await flushPromises()
    expect(api.isFullscreen.value).toBe(false)
  })

  it('stays closed when the browser refuses fullscreen', async () => {
    vi.mocked(document.documentElement.requestFullscreen).mockRejectedValueOnce(new Error('denied'))
    const { api } = start()
    api.toggle()
    await flushPromises()

    expect(api.isFullscreen.value).toBe(false)
  })

  it('stays open when the browser refuses to exit fullscreen', async () => {
    const { api } = start()
    api.toggle()
    await flushPromises()
    vi.mocked(document.exitFullscreen).mockRejectedValueOnce(new Error('denied'))
    api.toggle()
    await flushPromises()

    expect(api.isFullscreen.value).toBe(true)
  })

  it('syncs an external exit from fullscreenchange', async () => {
    const { api } = start()
    api.toggle()
    await flushPromises()
    fullscreenState.element = null
    document.dispatchEvent(new Event('fullscreenchange'))

    expect(api.isFullscreen.value).toBe(false)
  })

  it('listens to standard and webkit fullscreen events until the scope stops', async () => {
    const { scope, api } = start()
    api.toggle()
    await flushPromises()
    expect(addEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function))
    expect(addEventListener).toHaveBeenCalledWith('webkitfullscreenchange', expect.any(Function))

    scope.stop()
    expect(removeEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function))
    expect(removeEventListener).toHaveBeenCalledWith(
      'webkitfullscreenchange',
      expect.any(Function),
    )

    fullscreenState.element = null
    document.dispatchEvent(new Event('webkitfullscreenchange'))
    expect(api.isFullscreen.value).toBe(true)
  })
})
