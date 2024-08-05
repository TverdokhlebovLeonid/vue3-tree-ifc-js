import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import IfcViewingTools from '@/components/IfcViewing/IfcViewingTools.vue'
import { IFC_VIEWING_TOOLS } from '@/constants/ifcViewingTools'

test('Should render', async () => {
  const component = mount(IfcViewingTools)
  expect(component.find('.ifc-tools').find('.ifc-tools__buttons').exists()).toBe(true)
})

test('function setTools', async () => {
  const component = mount(IfcViewingTools)
  component.vm.setTools(IFC_VIEWING_TOOLS.createPlane)
  expect(component.emitted('tool-selection')).toBeTruthy()
})
test('function setTools(fullScreen)', async () => {
  const component = mount(IfcViewingTools)
  component.vm.setTools(IFC_VIEWING_TOOLS.fullScreen)
  expect(component.emitted('open-fullscreen')).toBeTruthy()
})
