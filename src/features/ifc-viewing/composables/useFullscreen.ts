import { onScopeDispose, ref } from 'vue'
import type { IWebkitDocument, IWebkitHTMLElement } from '@/features/ifc-viewing/types/fullscreen'

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

const ignoreFullscreenError = (): void => undefined

export const useFullscreen = () => {
  const isFullscreen = ref(false)

  const leaveFullscreen = (): void => {
    void exitFullscreen().then(() => {
      isFullscreen.value = false
    }, ignoreFullscreenError)
  }

  const syncFullscreen = (): void => {
    isFullscreen.value = !!getFullscreenElement()
  }

  const toggle = (): void => {
    if (!getFullscreenElement()) {
      void requestFullscreen().then(() => {
        isFullscreen.value = true
      }, ignoreFullscreenError)
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
