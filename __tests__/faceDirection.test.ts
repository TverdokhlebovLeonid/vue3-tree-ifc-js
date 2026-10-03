import { describe, expect, it } from 'vitest'
import { faceDirection } from '@/components/IfcViewing/NavigationCube/BoxCube'

describe('faceDirection', () => {
  it('keeps the six face axes', () => {
    expect(faceDirection('front')).toEqual([1, 0, 0])
    expect(faceDirection('back')).toEqual([-1, 0, 0])
    expect(faceDirection('top')).toEqual([0, 1, 0])
    expect(faceDirection('bottom')).toEqual([0, -1, 0])
    expect(faceDirection('left')).toEqual([0, 0, 1])
    expect(faceDirection('right')).toEqual([0, 0, -1])
  })

  it('combines edges and corners', () => {
    expect(faceDirection('left_front')).toEqual([1, 0, 1])
    expect(faceDirection('top_left_back')).toEqual([-1, 1, 1])
    expect(faceDirection('bottom_right_front')).toEqual([1, -1, -1])
  })

  it('ignores an unknown face', () => {
    expect(faceDirection('unknown')).toBeNull()
  })
})
