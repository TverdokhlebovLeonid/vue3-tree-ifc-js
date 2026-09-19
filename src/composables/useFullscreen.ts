import { onScopeDispose, ref } from 'vue'
import type { IWebkitDocument, IWebkitHTMLElement } from '@/types/fullscreen'

const FULLSCREEN_EVENTS = ['fullscreenchange', 'webkitfullscreenchange'] as const

const hasStandardFullscreen = (): boolean =>
  typeof document !== 'undefined' &&
  typeof document.documentElement.requestFullscreen === 'function'

const getFullscreenElement = (): Element | null => {
  if (hasStandardFullscreen()) return document.fullscreenElement
  return (document as IWebkitDocument).webkitFullscreenElement ?? null
}

const requestFullscreen = (): Promise<void> => {
  if (hasStandardFullscreen()) return document.documentElement.requestFullscreen()
  return (
    (document.documentElement as IWebkitHTMLElement).webkitRequestFullscreen?.() ?? Promise.resolve()
  )
}

const exitFullscreen = (): Promise<void> => {
  if (hasStandardFullscreen()) return document.exitFullscreen()
  return (document as IWebkitDocument).webkitExitFullscreen?.() ?? Promise.resolve()
}

export const useFullscreen = (options: { onExit?: () => void } = {}) => {
  const isFullscreen = ref(false)

  const leaveFullscreen = (): void => {
    const wasFullscreen = isFullscreen.value
    void exitFullscreen()
    isFullscreen.value = false
    if (wasFullscreen) options.onExit?.()
  }

  const syncFullscreen = (): void => {
    const active = !!getFullscreenElement()
    const wasFullscreen = isFullscreen.value
    isFullscreen.value = active
    if (wasFullscreen && !active) options.onExit?.()
  }

  const toggle = (): void => {
    if (!getFullscreenElement()) {
      void requestFullscreen()
      isFullscreen.value = true
      return
    }
    leaveFullscreen()
  }

  const close = (): void => {
    leaveFullscreen()
  }

  for (const event of FULLSCREEN_EVENTS) {
    document.addEventListener(event, syncFullscreen)
  }

  onScopeDispose(() => {
    for (const event of FULLSCREEN_EVENTS) {
      document.removeEventListener(event, syncFullscreen)
    }
  })

  return {
    isFullscreen,
    toggle,
    close,
  }
}
