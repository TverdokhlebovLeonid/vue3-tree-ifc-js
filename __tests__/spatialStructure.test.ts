import { describe, expect, it } from 'vitest'
import type { IModelElement } from '@/types/ifc'
import { collectSpatialLevels } from '@/utils/spatialStructure'

const node = (type: string, children: IModelElement[] = []): IModelElement => ({
  expressID: type.length,
  type,
  children,
})

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
