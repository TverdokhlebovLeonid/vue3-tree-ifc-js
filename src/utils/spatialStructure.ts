import type { IModelElement } from '@/types/ifc'

const isStorey = (element: IModelElement): boolean => element.type === 'IFCBUILDINGSTOREY'

const visit = (node: IModelElement, levels: IModelElement[]): void => {
  const children = node.children ?? []
  if (children.some(isStorey)) {
    levels.push(...children)
    return
  }
  children.forEach((child) => visit(child, levels))
}

export const collectSpatialLevels = (root?: IModelElement | null): IModelElement[] => {
  if (!root) return []
  const levels: IModelElement[] = []
  visit(root, levels)
  if (levels.length) return levels
  return root.children?.[0]?.children?.[0]?.children ?? []
}
