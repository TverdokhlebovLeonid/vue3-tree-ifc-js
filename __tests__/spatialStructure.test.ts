import { describe, expect, it } from 'vitest'
import type { IModelElement } from '@/features/ifc-viewing/types/ifc'
import {
  collectSpatialLevels,
  collectSubsetIds,
} from '@/features/ifc-viewing/utils/spatialStructure'

const node = (type: string, children: IModelElement[] = []): IModelElement => ({
  expressID: type.length,
  type,
  children,
})

const element = (
  expressID: number,
  type: string,
  children: IModelElement[] = [],
): IModelElement => ({ expressID, type, children })

describe('collectSpatialLevels', () => {
  it('returns every child of the building that contains storeys', () => {
    const storey = node('IFCBUILDINGSTOREY')
    const grid = node('IFCGRID')
    const building = node('IFCBUILDING', [storey, grid])
    const site = node('IFCSITE', [building])
    const project = node('IFCPROJECT', [site])

    expect(collectSpatialLevels(project)).toEqual([storey, grid])
  })

  it('finds storeys when the site level is missing', () => {
    const storey = node('IFCBUILDINGSTOREY')
    const building = node('IFCBUILDING', [storey])
    const project = node('IFCPROJECT', [building])

    expect(collectSpatialLevels(project)).toEqual([storey])
  })

  it('keeps children of every building', () => {
    const first = node('IFCBUILDINGSTOREY')
    const second = node('IFCBUILDINGSTOREY')
    const project = node('IFCPROJECT', [
      node('IFCSITE', [node('IFCBUILDING', [first]), node('IFCBUILDING', [second])]),
    ])

    expect(collectSpatialLevels(project)).toEqual([first, second])
  })

  it('returns an empty list without a structure', () => {
    expect(collectSpatialLevels(null)).toEqual([])
  })
})

describe('collectSubsetIds', () => {
  it('includes parts nested in an assembly', () => {
    const storey = element(1, 'IFCBUILDINGSTOREY', [
      element(10, 'IFCWALL'),
      element(11, 'IFCELEMENTASSEMBLY', [element(12, 'IFCCOLUMN'), element(13, 'IFCSTAIRFLIGHT')]),
    ])

    expect(collectSubsetIds(storey)).toEqual([10, 11, 12, 13])
  })

  it('skips spaces but keeps the elements inside them', () => {
    const storey = element(1, 'IFCBUILDINGSTOREY', [
      element(20, 'IFCSPACE', [element(21, 'IFCFURNISHINGELEMENT')]),
    ])

    expect(collectSubsetIds(storey)).toEqual([21])
  })
})
