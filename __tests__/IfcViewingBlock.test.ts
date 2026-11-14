import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import IfcViewingBlock from '@/features/ifc-viewing/components/IfcViewingBlock.vue'
import { mockModelLevels } from './dataMock'

vi.mock('@/features/ifc-viewing/components/IfcViewing.vue', () => ({
  default: defineComponent({
    name: 'IfcViewing',
    props: {
      levelVisibility: { type: Array, required: true },
      levelHighlight: { default: null },
      isFullscreen: { type: Boolean, default: false },
      toolCommand: { default: null },
      activeTool: { type: String, default: '' },
    },
    emits: ['set-model', 'update:activeTool'],
    template: '<div class="viewer-stub" />',
  }),
}))

describe('IfcViewingBlock visibility queue', () => {
  it('keeps both visibility changes made in one tick', async () => {
    const block = mount(IfcViewingBlock)
    const viewer = block.findComponent({ name: 'IfcViewing' })
    viewer.vm.$emit('set-model', structuredClone(mockModelLevels))
    await block.vm.$nextTick()

    const checkbox = block.findComponent({ name: 'ElCheckbox' })
    checkbox.vm.$emit('change', false)
    checkbox.vm.$emit('change', true)
    await block.vm.$nextTick()

    expect(viewer.props('levelVisibility')).toEqual([
      { customID: '0-level', visible: false },
      { customID: '0-level', visible: true },
    ])
  })
})
