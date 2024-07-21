import { BufferGeometry, ExtrudeGeometry } from 'three'
import type { IParameters } from '@/components/IfcViewing/NavigationCube/interfaceNavCube'

class TextGeometry extends ExtrudeGeometry {
  constructor(text: string, parameters: IParameters) {
    const font = parameters.font
    if (!font) return new BufferGeometry() as ExtrudeGeometry

    const shapes = font.generateShapes(text, parameters.size)

    parameters.depth = parameters.height !== undefined ? parameters.height : 50

    if (parameters.bevelThickness === undefined) parameters.bevelThickness = 10
    if (parameters.bevelSize === undefined) parameters.bevelSize = 8
    if (parameters.bevelEnabled === undefined) parameters.bevelEnabled = false

    super(shapes, parameters)
  }
}

export { TextGeometry }
