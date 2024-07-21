import {
  Mesh,
  LineSegments,
  Raycaster,
  MeshBasicMaterial,
  Object3D,
  MeshLambertMaterial,
} from 'three'
import { Font } from '@/components/IfcViewing/NavigationCube/FontLoader'
import type { IfcCamera } from 'web-ifc-viewer/dist/components/context/camera/camera'
import fontJSON from '@/components/IfcViewing/NavigationCube/droid_sans_regular.typeface.json'

export type ICamera = IfcCamera['activeCamera'] & {
  isPerspectiveCamera?: boolean
}

export interface IParameters {
  font: Font
  size: number
  height: number
  depth?: number | undefined
  bevelThickness?: number | undefined
  bevelSize?: number | undefined
  bevelEnabled?: boolean | undefined
}

export type IRaycaster = Raycaster & {
  firstHitOnly?: boolean
}

export type IObject3D = Object3D & {
  material?: MeshBasicMaterial
}

export interface IOutLine extends LineSegments {
  textCube?: string
}

export type IMeshCube = Mesh & {
  textCube?: string
  material?: MeshLambertMaterial
}

export interface ISwitch {
  [key: string]: () => void
}

export interface INameTextCube {
  [key: string]: string
}

export type IFontJSON = typeof fontJSON
export interface IFontGlyphs {
  ha: number
  o: string
  x_max: number
  x_min: number
  _cachedOutline?: string[]
}
export type IFontJSONGlyphs = IFontJSON['glyphs'] & {
  [key: string]: IFontGlyphs
}
