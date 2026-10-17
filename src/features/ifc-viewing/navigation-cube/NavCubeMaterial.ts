import {
  MeshLambertMaterial,
  MeshBasicMaterial,
  Color,
  LineBasicMaterial,
} from 'three'

export const LightColor = {
  light: 0x23527e,
  normalCube: new Color('rgb(245, 245, 245)'),
  hoverCube: new Color('rgb(202, 224, 244)'),
  textCube: new Color('rgb(35, 82, 126)'),
}
export const NavCubeMaterial = {
  normalCube: new MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    color: LightColor.normalCube,
    depthTest: true,
  }),
  hoverCube: new MeshLambertMaterial({
    transparent: true,
    opacity: 1,
    color: LightColor.hoverCube,
    depthTest: true,
  }),
  textCube: new MeshLambertMaterial({
    transparent: true,
    opacity: 1,
    color: LightColor.textCube,
    depthTest: true,
  }),
  outLine: new LineBasicMaterial({
    color: '#bcb8b8',
    linewidth: 10,
  }),
}
