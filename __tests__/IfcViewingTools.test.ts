import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import IfcViewingTools from '@/features/ifc-viewing/components/IfcViewingTools.vue'
import { TOOLS } from '@/features/ifc-viewing/constants/dataIfcViewing'
import { IFC_VIEWING_TOOLS } from '@/features/ifc-viewing/constants/ifcViewingTools'

const clickButton = async (wrapper: VueWrapper, name: string): Promise<void> => {
  const button = wrapper.findAll('button').find((item) => item.text().includes(name))
  expect(button?.exists()).toBe(true)
  await button!.trigger('click')
}

describe('IfcViewingTools test component', () => {
  const mountTools = (activeTool = '') => mount(IfcViewingTools, { props: { activeTool } })

  it('Should render', async () => {
    const component = mountTools()
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
    const coordinateTip = component
      .findAllComponents({ name: 'ElTooltip' })
      .find((tip) => tip.text().includes('Координаты'))
    expect(coordinateTip?.props('content')).toBe('Координаты модели')
    await clickButton(component, 'Плоскость')
    expect(component.emitted('tool-selection')?.[0]).toEqual([IFC_VIEWING_TOOLS.createPlane])
  })

  it('Snapshot component', () => {
    expect(mountTools().html()).toMatchSnapshot()
  })

  it('selects a tool from its button', async () => {
    const component = mountTools()
    await clickButton(component, 'Плоскость')
    expect(component.emitted('tool-selection')?.[0]).toEqual([IFC_VIEWING_TOOLS.createPlane])
    await component.setProps({ activeTool: IFC_VIEWING_TOOLS.createPlane })
    expect(component.find('.ifc-tools__buttons_active').text()).toContain('Плоскость')
    const planeTip = component
      .findAllComponents({ name: 'ElTooltip' })
      .find((tip) => tip.text().includes('Плоскость'))
    expect(planeTip?.props('content')).toBe('Отключить инструмент')
  })

  it('opens fullscreen from its button', async () => {
    const component = mountTools(IFC_VIEWING_TOOLS.createCoordinates)
    await clickButton(component, 'Во весь экран')
    expect(component.emitted('open-fullscreen')).toHaveLength(1)
    expect(component.emitted('tool-selection')).toBeUndefined()
    expect(component.find('.ifc-tools__buttons_active').text()).toContain('Координаты')
  })

  it('turns the active tool off from its button', async () => {
    const selected = mountTools(IFC_VIEWING_TOOLS.navCube)
    expect(selected.find('.ifc-tools__buttons_active').text()).toContain('Куб')
    await clickButton(selected, 'Куб')
    expect(selected.emitted('tool-selection')?.[0]).toEqual([''])
    expect(selected.find('.ifc-tools__buttons_active').text()).toContain('Куб')
  })

  it('cancels the plane from its button', async () => {
    const component = mountTools(IFC_VIEWING_TOOLS.createPlane)
    await clickButton(component, 'Отмена')
    expect(component.emitted('tool-selection')?.[0]).toEqual([IFC_VIEWING_TOOLS.cancelPlane])
  })

  it('does not store the active flag on the shared tool list', async () => {
    const component = mountTools(IFC_VIEWING_TOOLS.createPlane)
    await clickButton(component, 'Координаты')
    expect(TOOLS.every((tool) => !('active' in tool))).toBe(true)
  })
})
