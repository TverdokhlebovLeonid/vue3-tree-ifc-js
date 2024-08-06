import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import IfcViewingTools from '@/components/IfcViewing/IfcViewingTools.vue'
import { IFC_VIEWING_TOOLS } from '@/constants/ifcViewingTools'

test('Should render', async () => {
  const component = mount(IfcViewingTools)
  expect(
    component
      .find('.ifc-tools')
      .find('.ifc-tools__buttons')
      .find('.el-button')
      .find('.el-icon')
      .exists(),
  ).toBe(true)
})

test('function setTools', async () => {
  const component = mount(IfcViewingTools)
  component.vm.setTools(IFC_VIEWING_TOOLS.createPlane)
  expect(component.emitted('tool-selection')?.[0]).toEqual([IFC_VIEWING_TOOLS.createPlane])
})
test('function setTools(fullScreen)', async () => {
  const component = mount(IfcViewingTools)
  component.vm.setTools(IFC_VIEWING_TOOLS.fullScreen)
  expect(component.emitted('open-fullscreen')).toBeTruthy()
})
test('function setTools(same tool)', async () => {
  const component = mount(IfcViewingTools)
  component.vm.activeTool = IFC_VIEWING_TOOLS.navCube
  component.vm.setTools(IFC_VIEWING_TOOLS.navCube)
  expect(component.emitted('tool-selection')?.[0]).toEqual([''])
})

test('function startStateTools', async () => {
  const component = mount(IfcViewingTools)
  component.vm.startStateTools()
  expect(component.emitted('tool-selection')?.[0]).toEqual([''])
})

test('function cancelTool', async () => {
  const component = mount(IfcViewingTools)
  component.vm.cancelTool()
  expect(component.emitted('tool-selection')?.[0]).toEqual([IFC_VIEWING_TOOLS.cancelPlane])
})

test('function setFullScreen', async () => {
  const component = mount(IfcViewingTools)
  component.vm.setFullScreen()
  expect(component.emitted('open-fullscreen')).toBeTruthy()
})
