import fontJSON from '@/components/IfcViewing/NavigationCube/droid_sans_regular.typeface.json'
import { BoxGeometry, EdgesGeometry, LineSegments, Mesh, Vector3, type Scene } from 'three'
import { Font } from '@/components/IfcViewing/NavigationCube/FontLoader'
import { TextGeometry } from '@/components/IfcViewing/NavigationCube/TextGeometry'
import { NavCubeMaterial } from '@/components/IfcViewing/NavigationCube/NavCubeMaterial'
import type {
  IParameters,
  IMeshCube,
  IOutLine,
  ISwitch,
  INameTextCube,
} from '@/components/IfcViewing/NavigationCube/interfaceNavCube'
import type { IFCModel } from 'web-ifc-three/IFC/components/IFCModel'
import type { IfcCamera } from 'web-ifc-viewer/dist/components/context/camera/camera'

type FaceSize = [number, number, number]

type CubeFace = {
  name: string
  size: FaceSize
  position: FaceSize
  label?: FaceSize
}

const FACES: CubeFace[] = [
  { name: 'left', size: [96, 96, 16], position: [0, 0, 56], label: [-46, -12, 64] },
  { name: 'right', size: [96, 96, 16], position: [0, 0, -56], label: [-56, -12, 64] },
  { name: 'top', size: [96, 16, 96], position: [0, 56, 0], label: [-55, -12, 64] },
  { name: 'bottom', size: [96, 16, 96], position: [0, -56, 0], label: [-50, -12, 64] },
  { name: 'front', size: [16, 96, 96], position: [56, 0, 0], label: [-50, -12, 64] },
  { name: 'back', size: [16, 96, 96], position: [-56, 0, 0], label: [-45, -12, 64] },
  { name: 'left_front', size: [16, 96, 16], position: [56, 0, 56] },
  { name: 'left_back', size: [16, 96, 16], position: [-56, 0, 56] },
  { name: 'right_front', size: [16, 96, 16], position: [56, 0, -56] },
  { name: 'right_back', size: [16, 96, 16], position: [-56, 0, -56] },
  { name: 'top_left', size: [96, 16, 16], position: [0, 56, 56] },
  { name: 'top_right', size: [96, 16, 16], position: [0, 56, -56] },
  { name: 'top_front', size: [16, 16, 96], position: [56, 56, 0] },
  { name: 'top_back', size: [16, 16, 96], position: [-56, 56, 0] },
  { name: 'bottom_left', size: [96, 16, 16], position: [0, -56, 56] },
  { name: 'bottom_right', size: [96, 16, 16], position: [0, -56, -56] },
  { name: 'bottom_front', size: [16, 16, 96], position: [56, -56, 0] },
  { name: 'bottom_back', size: [16, 16, 96], position: [-56, -56, 0] },
  { name: 'top_left_front', size: [16, 16, 16], position: [56, 56, 56] },
  { name: 'top_left_back', size: [16, 16, 16], position: [-56, 56, 56] },
  { name: 'top_right_front', size: [16, 16, 16], position: [56, 56, -56] },
  { name: 'top_right_back', size: [16, 16, 16], position: [-56, 56, -56] },
  { name: 'bottom_left_front', size: [16, 16, 16], position: [56, -56, 56] },
  { name: 'bottom_left_back', size: [16, 16, 16], position: [-56, -56, 56] },
  { name: 'bottom_right_front', size: [16, 16, 16], position: [56, -56, -56] },
  { name: 'bottom_right_back', size: [16, 16, 16], position: [-56, -56, -56] },
]

const FACE_AXIS: Record<string, FaceSize> = {
  front: [1, 0, 0],
  back: [-1, 0, 0],
  top: [0, 1, 0],
  bottom: [0, -1, 0],
  left: [0, 0, 1],
  right: [0, 0, -1],
}

export const faceDirection = (name: string): FaceSize | null => {
  const direction: FaceSize = [0, 0, 0]
  for (const part of name.split('_')) {
    const axis = FACE_AXIS[part]
    if (!axis) return null
    direction[0] += axis[0]
    direction[1] += axis[1]
    direction[2] += axis[2]
  }
  return direction
}

export class BoxCube {
  scene: Scene

  constructor(scene: Scene) {
    this.scene = scene
    FACES.forEach((face) => {
      this.initItem(face.name, ...face.size, ...face.position)
      if (face.label) initText3D(this.scene, face.name, ...face.label)
    })
    this.initOutLine()
  }
  initItem(name: string, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
    const geometry = new BoxGeometry(x0, y0, z0)
    geometry.translate(x1, y1, z1)
    const mesh = new Mesh(geometry, NavCubeMaterial.normalCube)
    this.scene.add(mesh)
    mesh.name = name
    mesh.userData.Element = true
    return mesh
  }

  initOutLine() {
    const geometry = new BoxGeometry(128, 128, 128)
    const edges = new EdgesGeometry(geometry)
    const outLine: IOutLine = new LineSegments(edges, NavCubeMaterial.outLine)
    outLine.textCube = 'OutLine'
    outLine.userData.OutLine = true
    outLine.userData.onScale = (scale: number) => outLine.scale.set(scale, scale, scale)
    this.scene.add(outLine)
  }
}

function initText3D(scene: Scene, name: string, x1: number, y1: number, z1: number) {
  const font = new Font(fontJSON)
  const parameters: IParameters = {
    font: font,
    size: 24,
    height: 3,
  }
  const nameTextCube: INameTextCube = {
    front: 'Фасад',
    top: 'Сверху',
    left: 'Слева',
    right: 'Справа',
    bottom: 'Снизу',
    back: 'Торец',
  }
  const textCube = new TextGeometry(nameTextCube[name], parameters)
  textCube.translate(x1, y1, z1)
  hasRotate(name, textCube)
  const meshCube: IMeshCube = new Mesh(textCube, NavCubeMaterial.textCube)
  meshCube.name = name + 'TextCube'
  meshCube.textCube = name
  scene.add(meshCube)
}

function hasRotate(name: string, textCube: TextGeometry) {
  const switchHasRotate: ISwitch = {
    right: () => textCube.rotateY(Math.PI),
    top: () => {
      textCube.rotateY(Math.PI / 2)
      textCube.rotateZ(Math.PI / 2)
    },
    bottom: () => textCube.rotateX(Math.PI / 2),
    front: () => textCube.rotateY(Math.PI / 2),
    back: () => textCube.rotateY(-Math.PI / 2),
  }
  if (switchHasRotate?.[name]) switchHasRotate[name]()
}
export function switchPick(camera0: IfcCamera['cameraControls'], ifcModel: IFCModel, name: string) {
  const two = 2
  const zero = 0
  let r = 40
  let c = new Vector3(zero, zero, zero)
  if (ifcModel?.geometry?.boundingSphere) {
    r = ifcModel.geometry.boundingSphere.radius * two
    c = ifcModel.geometry.boundingSphere.center
  }
  const direction = faceDirection(name)
  const coords = direction
    ? new Vector3(
        c.x + direction[0] * r,
        c.y + direction[1] * r,
        c.z + direction[2] * r,
      )
    : new Vector3(zero, zero, zero)
  camera0.setPosition(coords.x, coords.y, coords.z, true)
  camera0.setLookAt(coords.x, coords.y, coords.z, c.x, c.y, c.z, true)
}
