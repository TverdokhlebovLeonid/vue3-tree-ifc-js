export interface IWebkitDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>
  webkitFullscreenElement?: Element | null
}

export interface IWebkitHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>
}
