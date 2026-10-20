import { effectScope } from 'vue'
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

  const start = (onExit = vi.fn()) => {
    const scope = effectScope()
    const api = scope.run(() => useFullscreen({ onExit }))
    if (!api) throw new Error('fullscreen composable did not start')
    return { scope, api, onExit }
  }

  it('enters fullscreen and leaves it on the second toggle', async () => {
    const { api, onExit } = start()
    api.toggle()
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled()
    expect(api.isFullscreen.value).toBe(true)
    expect(onExit).not.toHaveBeenCalled()

    api.toggle()
    expect(document.exitFullscreen).toHaveBeenCalled()
    expect(api.isFullscreen.value).toBe(false)
    expect(onExit).toHaveBeenCalledTimes(1)
  })

  it('does not report an exit when fullscreen was already closed', () => {
    const { api, onExit } = start()
    api.close()
    expect(api.isFullscreen.value).toBe(false)
    expect(onExit).not.toHaveBeenCalled()
  })

  it('syncs an external exit from fullscreenchange', () => {
    const { api, onExit } = start()
    api.toggle()
    fullscreenState.element = null
    document.dispatchEvent(new Event('fullscreenchange'))

    expect(api.isFullscreen.value).toBe(false)
    expect(onExit).toHaveBeenCalledTimes(1)
  })

  it('listens to standard and webkit fullscreen events until the scope stops', () => {
    const { scope, onExit } = start()
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
    expect(onExit).not.toHaveBeenCalled()
  })
})
