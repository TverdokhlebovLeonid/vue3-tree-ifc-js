import { IfcViewerAPI } from 'web-ifc-viewer'
import { Object3D } from 'three'

export interface IIfcViewerAPI extends IfcViewerAPI {
  container?: HTMLDivElement
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

export type IDictionaryIfcViewing = Record<string, string>

export interface IModelCoordinates {
  x: number | null
  y: number | null
  z: number | null
}
