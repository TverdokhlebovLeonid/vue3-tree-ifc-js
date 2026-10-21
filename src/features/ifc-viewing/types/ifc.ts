import { IfcViewerAPI } from 'web-ifc-viewer'

export interface IIfcViewerAPI extends IfcViewerAPI {
  container?: HTMLDivElement
}

export interface IDataLevelHide {
  customID: string
  visible: boolean
}

export interface IModelElement {
  expressID: number
  type: string
  children: IModelElement[]
}

export interface IModelLevels {
  ids: number[]
  visible: boolean
  customID: string
  type?: string
  children?: IModelElement[]
  expressID: number
}

export type IDictionaryIfcViewing = Record<string, string>

export interface IModelCoordinates {
  x: number | null
  y: number | null
  z: number | null
}
