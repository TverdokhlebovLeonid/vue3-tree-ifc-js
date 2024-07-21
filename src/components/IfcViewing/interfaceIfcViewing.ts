import { IfcViewerAPI } from 'web-ifc-viewer'
import { Object3D } from 'three'

export interface IIfcViewerAPI extends IfcViewerAPI {
  container?: HTMLDivElement
}
export interface ISwitchChoice {
  [key: string]: () => void
}
export interface ISubsets {
  [key: string]: Object3D
}
export interface IDataLevelHide {
  check: boolean
  customID: string
}
export interface IModelElement {
  expressID: number
  type: string
  children: IModelElement[]
}
export interface IModelLevels {
  ids: number[]
  check: boolean
  customID: string
  type?: string
  children?: IModelElement[]
  expressID: number
}

export interface IDictionaryIfcViewing {
  [key: string]: {
    single: string
    plural: string
  }
}

export interface IModelCoordinates {
  x: number | string
  y: number | string
  z: number | string
}

export interface IDocumentElement extends HTMLElement {
  webkitRequestFullscreen: () => Promise<void>
}
export interface IDocument extends Document {
  webkitExitFullscreen: () => Promise<void>
  webkitFullscreenElement: object
}

export interface ITools {
  active: boolean
  icon: string
  popover: string
  name: string
  tool: string
}
