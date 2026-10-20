import { expect, type SnapshotSerializer } from 'vitest'
import { stabilizeElId } from './stabilizeSnapshot'

const elIdSerializer: SnapshotSerializer = {
  test(value) {
    return typeof value === 'string' && value.includes('el-id-')
  },
  serialize(value, config, indentation, depth, refs, printer) {
    return printer(stabilizeElId(String(value)), config, indentation, depth, refs)
  },
}

expect.addSnapshotSerializer(elIdSerializer)
