import type { IModelElement } from '@/features/ifc-viewing/types/ifc'

const SKIPPED_IFC_TYPES = new Set(['IFCSPACE'])

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

const visitSubsetIds = (nodes: IModelElement[], ids: number[]): void => {
  for (const node of nodes) {
    if (!SKIPPED_IFC_TYPES.has(node.type)) ids.push(node.expressID)
    visitSubsetIds(node.children ?? [], ids)
  }
}

export const collectSubsetIds = (element: IModelElement): number[] => {
  const ids: number[] = []
  visitSubsetIds(element.children ?? [], ids)
  return ids
}
