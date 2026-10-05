import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  OrthographicCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  Camera,
  Object3D,
} from 'three'
import { LightColor, NavCubeMaterial } from '@/components/IfcViewing/NavigationCube/NavCubeMaterial'
import { BoxCube, switchPick } from '@/components/IfcViewing/NavigationCube/BoxCube'
import type { IIfcViewerAPI } from '@/types/ifc'
import type {
  ICamera,
  IRaycaster,
  IMeshCube,
} from '@/components/IfcViewing/NavigationCube/interfaceNavCube'
import type { IFCModel } from 'web-ifc-three/IFC/components/IFCModel'

export class NavCube {
  viewer: IIfcViewerAPI
  scene: Scene
  boxCube: BoxCube
  height: number
  width: number
  canvas: HTMLCanvasElement
  perspectiveCamera: PerspectiveCamera
  orthographicCamera: OrthographicCamera
  camera: Camera
  ambientLight: AmbientLight
  directionalLight: DirectionalLight
  renderer: WebGLRenderer
  rayCaster: IRaycaster
  mouse: Vector2
  mouseOn: boolean
  container: HTMLDivElement | null
  isCanvasRemove: boolean
  isKeyMove: boolean
  htmlElementCube: string
  animationFrameId: number
  pickableMeshes: Object3D[]
  hoveredMesh: IMeshCube | null
  lastHoverKey: string
  constructor(viewer: IIfcViewerAPI, htmlElementCube: string) {
    this.viewer = viewer
    this.scene = new Scene()
    this.width = 100
    this.height = 100
    this.isCanvasRemove = true
    this.htmlElementCube = htmlElementCube
    this.container = document.querySelector(htmlElementCube)
    this.canvas = document.createElement('canvas')
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    if (this.container) this.container.appendChild(this.canvas)
    this.perspectiveCamera = new PerspectiveCamera(45, this.width / this.height, 1, 2000)
    const aspect = 0.9
    this.orthographicCamera = new OrthographicCamera(
      this.width / -aspect,
      this.width / aspect,
      this.height / aspect,
      this.height / -aspect,
      -1000,
      1000,
    )
    this.initCamera()
    if ((this.viewer.context.ifcCamera.activeCamera as ICamera).isPerspectiveCamera) {
      this.camera = this.perspectiveCamera
    } else {
      this.camera = this.orthographicCamera
    }
    this.ambientLight = new AmbientLight(LightColor.light, 2)
    this.directionalLight = new DirectionalLight(LightColor.light, 2)
    this.initLight()
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    })
    this.initRenderer()
    this.rayCaster = new Raycaster()
    this.rayCaster.firstHitOnly = true
    this.mouse = new Vector2()
    this.boxCube = new BoxCube(this.scene)
    this.pickableMeshes = this.scene.children.filter((child) => child.userData.Element)
    this.hoveredMesh = null
    this.lastHoverKey = ''
    this.mouseOn = false
    this.isKeyMove = true
    this.animationFrameId = 0
    this.onAnimateIfcViewing()
    this.onHover()
  }

  initCamera() {
    this.perspectiveCamera.userData.Radius = 350
    this.perspectiveCamera.position.z = this.perspectiveCamera.userData.Radius
    this.perspectiveCamera.position.y = this.perspectiveCamera.userData.Radius
    this.perspectiveCamera.position.x = this.perspectiveCamera.userData.Radius
    this.orthographicCamera.userData.Radius = 100
    this.orthographicCamera.position.z = this.orthographicCamera.userData.Radius
    this.orthographicCamera.position.y = this.orthographicCamera.userData.Radius
    this.orthographicCamera.position.x = this.orthographicCamera.userData.Radius
  }

  initLight() {
    this.scene.add(this.ambientLight)
    this.directionalLight.position.set(-100, 0, 0)
    this.directionalLight.target.position.set(-50, 0, 0)
    this.scene.add(this.directionalLight)
    this.scene.add(this.directionalLight.target)
  }
  initRenderer() {
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.localClippingEnabled = true

    this.renderer.domElement.setAttribute('tabindex', '1')
  }
  cast(event: MouseEvent) {
    const bounds = this.renderer.domElement.getBoundingClientRect()
    const x1 = event.clientX - bounds.left
    const y1 = event.clientY - bounds.top
    const x2 = bounds.right - bounds.left
    this.mouse.x = (x1 / x2) * 2 - 1
    const y2 = bounds.bottom - bounds.top
    this.mouse.y = -(y1 / y2) * 2 + 1
  }
  onMouseMove = (event: MouseEvent): void => {
    this.cast(event)
    this.mouseOn = true
    this.updateHover()
  }

  onMouseOut = (): void => {
    this.mouseOn = false
    this.clearHover()
  }

  onHover() {
    if (this.isKeyMove) {
      this.renderer.domElement.addEventListener('mousemove', this.onMouseMove)
      this.renderer.domElement.addEventListener('mouseout', this.onMouseOut)
    }
  }

  clearHover(): void {
    if (this.hoveredMesh) {
      this.hoveredMesh.material = NavCubeMaterial.normalCube
      this.hoveredMesh = null
    }
    this.lastHoverKey = ''
    this.renderer.domElement.style.cursor = 'default'
  }

  updateHover(): void {
    const { x, y, z } = this.camera.rotation
    const key = `${this.mouse.x}:${this.mouse.y}:${x}:${y}:${z}`
    if (key === this.lastHoverKey) return
    this.lastHoverKey = key

    this.rayCaster.setFromCamera(this.mouse, this.camera)
    const found = this.rayCaster.intersectObjects(this.pickableMeshes)[0]
    const mesh = found && !(found.object as IMeshCube).textCube ? (found.object as IMeshCube) : null
    if (mesh === this.hoveredMesh) {
      this.renderer.domElement.style.cursor = mesh ? 'pointer' : 'default'
      return
    }
    if (this.hoveredMesh) this.hoveredMesh.material = NavCubeMaterial.normalCube
    this.hoveredMesh = mesh
    if (!mesh) {
      this.renderer.domElement.style.cursor = 'default'
      return
    }
    mesh.material = NavCubeMaterial.hoverCube
    this.renderer.domElement.style.cursor = 'pointer'
  }

  onPick(ifcModel: IFCModel) {
    const _this = this as this
    const camera = _this.viewer.context.ifcCamera.cameraControls
    const filterElementClick = this.pickableMeshes
    _this.renderer.domElement.onclick = function () {
      if (_this.mouse.x !== 0 || _this.mouse.y !== 0) {
        _this.rayCaster.setFromCamera(_this.mouse, _this.camera)
        const intersects = _this.rayCaster.intersectObjects(filterElementClick)
        const found = intersects[0]
        if (found) {
          switchPick(camera, ifcModel, found.object.name.trim())
        }
      }
    }
  }

  animate() {
    const camera = this.viewer.context.ifcCamera.activeCamera

    const controls = this.viewer.context.ifcCamera.cameraControls
    const r = this.camera.userData.Radius
    if (this.isKeyMove) {
      let vector = new Vector3(
        camera.position.x - controls['_target'].x,
        camera.position.y - controls['_target'].y,
        camera.position.z - controls['_target'].z,
      )
      vector = vector.normalize()
      const newV = new Vector3(0, 0, 0).add(vector.clone().multiplyScalar(r))
      this.camera.position.x = newV.x
      this.camera.position.y = newV.y
      this.camera.position.z = newV.z

      this.camera.rotation.x = camera.rotation.x
      this.camera.rotation.y = camera.rotation.y
      this.camera.rotation.z = camera.rotation.z

      if (this.mouseOn) this.updateHover()

      this.renderer.render(this.scene, this.camera)
    }
  }

  onAnimateIfcViewing() {
    const animate = () => {
      if (!this.isCanvasRemove) return
      this.animate()
      this.animationFrameId = requestAnimationFrame(animate)
    }
    animate()
  }

  dispose() {
    if (!this.isCanvasRemove) return
    this.isCanvasRemove = false
    cancelAnimationFrame(this.animationFrameId)

    this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove)
    this.renderer.domElement.removeEventListener('mouseout', this.onMouseOut)
    this.renderer.domElement.onclick = null

    this.scene.traverse((child) => {
      const mesh = child as { geometry?: { dispose: () => void } }
      mesh.geometry?.dispose()
    })
    this.scene.clear()

    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.canvas.remove()
    this.container = null
  }

  deleteElement() {
    this.dispose()
  }
}
