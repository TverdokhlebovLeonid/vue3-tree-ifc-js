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
} from 'three'
import { LightColor, NavCubeMaterial } from '@/components/IfcViewing/NavigationCube/NavCubeMaterial'
import { BoxCube, switchPick } from '@/components/IfcViewing/NavigationCube/BoxCube'
import type { IIfcViewerAPI } from '@/components/IfcViewing/interfaceIfcViewing'
import type {
  ICamera,
  IRaycaster,
  IObject3D,
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
    this.mouseOn = false
    this.isKeyMove = true
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
  onHover() {
    if (this.isKeyMove) {
      const _this = this as this
      _this.renderer.domElement.addEventListener('mousemove', function (event: MouseEvent) {
        _this.cast(event)
        _this.mouseOn = true
      })
      _this.renderer.domElement.addEventListener('mouseout', function () {
        _this.mouseOn = false
      })
    }
  }
  hover() {
    const _this = this as this
    const filterElementHover = _this.scene.children.filter((child) => {
      return child.userData.Element
    })
    if (_this.mouseOn) {
      _this.rayCaster.setFromCamera(_this.mouse, _this.camera)
      const intersects = _this.rayCaster.intersectObjects(filterElementHover)
      const found = intersects[0]
      if (found) {
        if (!(found.object as IMeshCube).textCube) {
          ;(found.object as IMeshCube).material = NavCubeMaterial.hoverCube
          _this.renderer.domElement.style.cursor = 'pointer'
        }
      } else {
        _this.renderer.domElement.style.cursor = 'default'
      }
    }
  }
  resetMaterial() {
    for (let i = 0; i < this.scene.children.length; i++) {
      if (
        (this.scene.children as IObject3D[])[i].material &&
        !(this.scene?.children[i] as IMeshCube).textCube
      )
        (this.scene.children as IObject3D[])[i].material = NavCubeMaterial.normalCube
    }
  }

  onPick(ifcModel: IFCModel) {
    const _this = this as this
    const camera = _this.viewer.context.ifcCamera.cameraControls
    const filterElementClick = _this.scene.children.filter((child) => {
      return child.userData.Element
    })
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

      this.resetMaterial()
      this.hover()

      this.renderer.render(this.scene, this.camera)
    }
  }

  onAnimateIfcViewing() {
    const _this = this as this
    const animate = () => {
      if (this.isCanvasRemove) {
        _this.animate()
        requestAnimationFrame(animate)
      }
    }
    animate()
  }

  deleteElement() {
    this.canvas.remove()
    this.isCanvasRemove = false
  }
}
