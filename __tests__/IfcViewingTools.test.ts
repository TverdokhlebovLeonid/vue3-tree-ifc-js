import { mount } from '@vue/test-utils'
import { expect } from 'vitest'
import IfcViewingTools from '@/components/IfcViewing/IfcViewingTools.vue'
import { IFC_VIEWING_TOOLS } from '@/constants/ifcViewingTools'
import type { ComponentWrapperType } from './interfaceIfcTests'

describe('IfcViewingTools test component', () => {
  let component: ComponentWrapperType<InstanceType<typeof IfcViewingTools>>

  beforeEach(() => {
    component = mount(IfcViewingTools)
  })

  it('Should render', async () => {
    expect(
      component
        .find('.ifc-tools')
        .find('.ifc-tools__buttons')
        .find('.el-button')
        .find('.el-icon')
        .exists(),
    ).toBe(true)
    expect(
      component
        .find('.ifc-tools__buttons')
        .findAll('span')
        .map((span) => span.text()),
    ).toEqual(['Плоскость', 'Координаты', 'Куб', 'Во весь экран'])
    const button = component.find('button')
    await button.trigger('click')
    expect(component.emitted('tool-selection')).toBeTruthy()
  })

  it('Snapshot component', () => {
    expect(component.html()).toMatchSnapshot()
  })

  it('Function setTools', () => {
    component.vm.setTools(IFC_VIEWING_TOOLS.createPlane)
    expect(component.emitted('tool-selection')?.[0]).toEqual([IFC_VIEWING_TOOLS.createPlane])
    expect(component.vm.activeTool).toBe(IFC_VIEWING_TOOLS.createPlane)
  })

  it('Function setTools(fullScreen)', () => {
    const component = mount(IfcViewingTools)
    component.vm.setTools(IFC_VIEWING_TOOLS.fullScreen)
    expect(component.emitted('open-fullscreen')).toBeTruthy()
  })

  it('Function setTools(same tool)', () => {
    component.vm.activeTool = IFC_VIEWING_TOOLS.navCube
    component.vm.setTools(IFC_VIEWING_TOOLS.navCube)
    expect(component.emitted('tool-selection')?.[0]).toEqual([''])
    expect(component.vm.activeTool).toBe('')
  })

  it('Function startStateTools', () => {
    component.vm.startStateTools()
    expect(component.emitted('tool-selection')?.[0]).toEqual([''])
    expect(component.vm.activeTool).toBe('')
  })

  it('Function cancelTool', () => {
    component.vm.cancelTool()
    expect(component.emitted('tool-selection')?.[0]).toEqual([IFC_VIEWING_TOOLS.cancelPlane])
  })

  it('Function setFullScreen', async () => {
    component.vm.setFullScreen()
    expect(component.emitted('open-fullscreen')).toBeTruthy()
  })
})
