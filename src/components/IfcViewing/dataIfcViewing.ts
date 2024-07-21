import { IFC_VIEWING_TOOLS } from '@/constants/ifcViewingTools'
import type { ITools } from '@/components/IfcViewing/interfaceIfcViewing'

export const TOOLS: ITools[] = [
  {
    active: false,
    icon: 'Coin',
    popover: 'Разрезать на плоскости',
    name: 'Плоскость',
    tool: IFC_VIEWING_TOOLS.createPlane,
  },
  {
    active: false,
    icon: 'Coordinate',
    popover: 'Координаты модели',
    name: 'Координаты',
    tool: IFC_VIEWING_TOOLS.createCoordinates,
  },
  {
    active: false,
    icon: 'Box',
    popover: 'Навигационный куб',
    name: 'Куб',
    tool: IFC_VIEWING_TOOLS.navCube,
  },
  {
    active: false,
    icon: 'FullScreen',
    popover: 'Раскрыть на весь экран',
    name: 'Во весь экран',
    tool: IFC_VIEWING_TOOLS.fullScreen,
  },
]

export const TEXT_HELP_PLANE =
  'Двойной клик – появится плоскость. Клик правой кнопкой – плоскость удалится.'
