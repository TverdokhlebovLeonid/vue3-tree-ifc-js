import { stabilizeElId } from './stabilizeSnapshot'

describe('stabilizeElId', () => {
  it('replaces generated Element Plus ids with a stable token', () => {
    const html =
      '<label for="el-id-993-2" id="el-id-993-2"><input id="el-id-12"></label>'
    expect(stabilizeElId(html)).toBe('<label for="el-id" id="el-id"><input id="el-id"></label>')
  })
})