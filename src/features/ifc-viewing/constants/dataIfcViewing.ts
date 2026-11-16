import { IFC_VIEWING_TOOLS } from '@/features/ifc-viewing/constants/ifcViewingTools'
import type { ITools } from '@/features/ifc-viewing/types/tools'

export const TOOLS: ITools[] = [
  {
    icon: 'Coin',
    popover: 'Разрезать на плоскости',
    name: 'Плоскость',
    tool: IFC_VIEWING_TOOLS.createPlane,
  },
  {
    icon: 'Coordinate',
    popover: 'Координаты модели',
    name: 'Координаты',
    tool: IFC_VIEWING_TOOLS.createCoordinates,
  },
  {
    icon: 'Box',
    popover: 'Навигационный куб',
    name: 'Куб',
    tool: IFC_VIEWING_TOOLS.navCube,
  },
  {
    icon: 'FullScreen',
    popover: 'Раскрыть на весь экран',
    name: 'Во весь экран',
    tool: IFC_VIEWING_TOOLS.fullScreen,
  },
]

export const TEXT_HELP_PLANE =
  'Двойной клик – появится плоскость. Клик правой кнопкой – плоскость удалится.'
