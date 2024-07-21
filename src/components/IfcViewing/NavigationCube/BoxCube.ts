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

export class BoxCube {
  scene: Scene
  left: Mesh
  right: Mesh
  top: Mesh
  bottom: Mesh
  front: Mesh
  back: Mesh
  left_front: Mesh
  left_back: Mesh
  right_front: Mesh
  right_back: Mesh
  top_left: Mesh
  top_right: Mesh
  top_front: Mesh
  top_back: Mesh
  bottom_left: Mesh
  bottom_right: Mesh
  bottom_front: Mesh
  bottom_back: Mesh
  top_left_front: Mesh
  top_left_back: Mesh
  top_right_front: Mesh
  top_right_back: Mesh
  bottom_left_front: Mesh
  bottom_left_back: Mesh
  bottom_right_front: Mesh
  bottom_right_back: Mesh

  constructor(scene: Scene) {
    this.scene = scene
    this.left = this.initItem('left', 96, 96, 16, 0, 0, 56)
    initText3D(this.scene, 'left', -46, -12, 64)
    this.right = this.initItem('right', 96, 96, 16, 0, 0, -56)
    initText3D(this.scene, 'right', -56, -12, 64)

    this.top = this.initItem('top', 96, 16, 96, 0, 56, 0)
    initText3D(this.scene, 'top', -55, -12, 64)

    this.bottom = this.initItem('bottom', 96, 16, 96, 0, -56, 0)
    initText3D(this.scene, 'bottom', -50, -12, 64)

    this.front = this.initItem('front', 16, 96, 96, 56, 0, 0)
    initText3D(this.scene, 'front', -50, -12, 64)
    this.back = this.initItem('back', 16, 96, 96, -56, 0, 0)
    initText3D(this.scene, 'back', -45, -12, 64)

    this.left_front = this.initItem('left_front', 16, 96, 16, 56, 0, 56)
    this.left_back = this.initItem('left_back', 16, 96, 16, -56, 0, 56)
    this.right_front = this.initItem('right_front', 16, 96, 16, 56, 0, -56)
    this.right_back = this.initItem('right_back', 16, 96, 16, -56, 0, -56)

    this.top_left = this.initItem('top_left', 96, 16, 16, 0, 56, 56)
    this.top_right = this.initItem('top_right', 96, 16, 16, 0, 56, -56)
    this.top_front = this.initItem('top_front', 16, 16, 96, 56, 56, 0)
    this.top_back = this.initItem('top_back', 16, 16, 96, -56, 56, 0)

    this.bottom_left = this.initItem('bottom_left', 96, 16, 16, 0, -56, 56)
    this.bottom_right = this.initItem('bottom_right', 96, 16, 16, 0, -56, -56)
    this.bottom_front = this.initItem('bottom_front', 16, 16, 96, 56, -56, 0)
    this.bottom_back = this.initItem('bottom_back', 16, 16, 96, -56, -56, 0)

    this.top_left_front = this.initItem('top_left_front', 16, 16, 16, 56, 56, 56)
    this.top_left_back = this.initItem('top_left_back', 16, 16, 16, -56, 56, 56)
    this.top_right_front = this.initItem('top_right_front', 16, 16, 16, 56, 56, -56)
    this.top_right_back = this.initItem('top_right_back', 16, 16, 16, -56, 56, -56)

    this.bottom_left_front = this.initItem('bottom_left_front', 16, 16, 16, 56, -56, 56)
    this.bottom_left_back = this.initItem('bottom_left_back', 16, 16, 16, -56, -56, 56)
    this.bottom_right_front = this.initItem('bottom_right_front', 16, 16, 16, 56, -56, -56)
    this.bottom_right_back = this.initItem('bottom_right_back', 16, 16, 16, -56, -56, -56)
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
  const coords = new Vector3(zero, zero, zero)
  const switchForPick: ISwitch = {
    left: () => {
      coords.x = c.x
      coords.y = c.y
      coords.z = r + c.z
    },
    right: () => {
      coords.x = c.x
      coords.y = c.y
      coords.z = -r + c.z
    },
    top: () => {
      coords.x = c.x
      coords.y = r + c.y
      coords.z = c.z
    },
    bottom: () => {
      coords.x = c.x
      coords.y = -r + c.y
      coords.z = c.z
    },
    front: () => {
      coords.x = r + c.x
      coords.y = c.y
      coords.z = c.z
    },
    back: () => {
      coords.x = -r + c.x
      coords.y = c.y
      coords.z = c.z
    },
    left_front: () => {
      coords.x = r + c.x
      coords.y = c.y
      coords.z = r + c.z
    },
    left_back: () => {
      coords.x = -r + c.x
      coords.y = c.y
      coords.z = r + c.z
    },
    right_front: () => {
      coords.x = r + c.x
      coords.y = c.y
      coords.z = -r + c.z
    },
    right_back: () => {
      coords.x = -r + c.x
      coords.y = c.y
      coords.z = -r + c.z
    },
    top_left: () => {
      coords.x = c.x
      coords.y = r + c.y
      coords.z = r + c.z
    },
    top_right: () => {
      coords.x = c.x
      coords.y = r + c.y
      coords.z = -r + c.z
    },
    top_front: () => {
      coords.x = r + c.x
      coords.y = r + c.y
      coords.z = c.z
    },
    top_back: () => {
      coords.x = -r + c.x
      coords.y = r + c.y
      coords.z = c.z
    },
    bottom_left: () => {
      coords.x = c.x
      coords.y = -r + c.y
      coords.z = r + c.z
    },
    bottom_right: () => {
      coords.x = c.x
      coords.y = -r + c.y
      coords.z = -r + c.z
    },
    bottom_front: () => {
      coords.x = r + c.x
      coords.y = -r + c.y
      coords.z = c.z
    },
    bottom_back: () => {
      coords.x = -r + c.x
      coords.y = -r + c.y
      coords.z = c.z
    },
    top_left_front: () => {
      coords.x = r + c.x
      coords.y = r + c.y
      coords.z = r + c.z
    },
    top_left_back: () => {
      coords.x = -r + c.x
      coords.y = r + c.y
      coords.z = r + c.z
    },
    top_right_front: () => {
      coords.x = r + c.x
      coords.y = r + c.y
      coords.z = -r + c.z
    },
    top_right_back: () => {
      coords.x = -r + c.x
      coords.y = r + c.y
      coords.z = -r + c.z
    },
    bottom_left_front: () => {
      coords.x = r + c.x
      coords.y = -r + c.y
      coords.z = r + c.z
    },
    bottom_left_back: () => {
      coords.x = -r + c.x
      coords.y = -r + c.y
      coords.z = r + c.z
    },
    bottom_right_front: () => {
      coords.x = r + c.x
      coords.y = -r + c.y
      coords.z = -r + c.z
    },
    bottom_right_back: () => {
      coords.x = -r + c.x
      coords.y = -r + c.y
      coords.z = -r + c.z
    },
  }
  if (switchForPick?.[name]) switchForPick[name]()
  camera0.setPosition(coords.x, coords.y, coords.z, true)
  camera0.setLookAt(coords.x, coords.y, coords.z, c.x, c.y, c.z, true)
}
