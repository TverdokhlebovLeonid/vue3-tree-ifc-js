import { ShapePath, Shape } from 'three'
import type {
  ISwitch,
  IFontJSON,
  IFontJSONGlyphs,
  IFontGlyphs,
} from '@/components/IfcViewing/NavigationCube/interfaceNavCube'

export class Font {
  type: string
  data: IFontJSON
  isFont: boolean
  constructor(data: IFontJSON) {
    this.type = 'Font'
    this.data = data
    this.isFont = false
  }

  generateShapes(text: string, size = 100) {
    const shapes: [] = []
    const paths: ShapePath[] = createPaths(text, size, this.data)
    for (let p = 0, pl = paths.length; p < pl; p++) {
      Array.prototype.push.apply(shapes, paths[p].toShapes(false) as Shape[])
    }

    return shapes
  }
}

function createPaths(text: string, size: number, data: IFontJSON) {
  const chars = Array.from(text)
  const scale = size / data.resolution
  const line_height =
    (data.boundingBox.yMax - data.boundingBox.yMin + data.underlineThickness) * scale

  const paths = []

  let offsetX = 0,
    offsetY = 0

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]

    if (char === '\n') {
      offsetX = 0
      offsetY -= line_height
    } else {
      const ret = createPath(char, scale, offsetX, offsetY, data)
      if (ret) {
        offsetX += ret.offsetX
        paths.push(ret.path)
      }
    }
  }
  return paths
}

function createPath(
  char: string,
  scale: number,
  offsetX: number,
  offsetY: number,
  data: IFontJSON,
) {
  const glyph: IFontGlyphs = (data.glyphs as IFontJSONGlyphs)[char] || data.glyphs['?']
  const path = new ShapePath()

  let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2
  if (glyph.o) {
    const outline = glyph._cachedOutline || (glyph._cachedOutline = glyph.o.split(' '))
    for (let i = 0, l = outline.length; i < l; ) {
      const action = outline[i++]

      const switchCreatePath: ISwitch = {
        m: () => {
          x = +outline[i++] * scale + offsetX
          y = +outline[i++] * scale + offsetY
          path.moveTo(x, y)
        },
        l: () => {
          x = +outline[i++] * scale + offsetX
          y = +outline[i++] * scale + offsetY
          path.lineTo(x, y)
        },
        q: () => {
          cpx = +outline[i++] * scale + offsetX
          cpy = +outline[i++] * scale + offsetY
          cpx1 = +outline[i++] * scale + offsetX
          cpy1 = +outline[i++] * scale + offsetY
          path.quadraticCurveTo(cpx1, cpy1, cpx, cpy)
        },
        b: () => {
          cpx = +outline[i++] * scale + offsetX
          cpy = +outline[i++] * scale + offsetY
          cpx1 = +outline[i++] * scale + offsetX
          cpy1 = +outline[i++] * scale + offsetY
          cpx2 = +outline[i++] * scale + offsetX
          cpy2 = +outline[i++] * scale + offsetY
          path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cpx, cpy)
        },
      }
      if (switchCreatePath?.[action]) switchCreatePath[action]()
    }
  }

  return { offsetX: (glyph.ha as number) * scale, path: path }
}

Font.prototype.isFont = true
