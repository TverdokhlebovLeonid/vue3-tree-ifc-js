import { mount } from '@vue/test-utils'
import IfcViewingRequisites from '@/components/IfcViewing/IfcViewingRequisites.vue'
import { mockModelLevels } from './dataMock'
import type { ComponentWrapperType } from './interfaceIfcTests'

const TEST_ID = 63

describe('IfcViewingRequisites test component', () => {
  let component: ComponentWrapperType<InstanceType<typeof IfcViewingRequisites>>

  beforeEach(() => {
    component = mount(IfcViewingRequisites)
  })

  it('Snapshot and render component', async () => {
    component.vm.modelLevels = mockModelLevels
    await component.vm.$nextTick()
    expect(component.find('.ifc-requisites').find('b').text()).toBe('Реквизиты')
    expect(component.html()).toMatchSnapshot()
  })

  it('Function setElementName', () => {
    const func = component.vm.setElementName
    const name = 'IFCBUILDINGSTOREY'
    expect(func(name)).toBe('Этаж/Уровень')
    const nameDefault = 'NO_SUCH_NAME'
    expect(func(nameDefault)).toBe('Элемент')
  })

  it('Function setModel', () => {
    component.vm.setModel(mockModelLevels)
    expect(component.vm.modelLevels[0].customID).toBe('0-level')
    expect(component.vm.levelActive).toBe(null)
  })

  it('Function transferLevel', () => {
    component.vm.levelActive = TEST_ID
    component.vm.transferLevel(mockModelLevels, TEST_ID)
    expect(component.vm.levelActive).toBe(null)
    expect(component.emitted('transfer-level')?.[0]).toEqual([[]])
  })

  it('Function transferLevel(same id)', () => {
    component.vm.levelActive = 50
    component.vm.transferLevel(mockModelLevels, TEST_ID)
    expect(component.vm.levelActive).toBe(TEST_ID)
    expect(component.emitted('transfer-level')?.[0]).toEqual([[TEST_ID]])
  })

  it('Function setLevelHide', () => {
    component.vm.setLevelHide('50', true)
    expect(component.emitted('level-hide')?.[0]).toEqual([{ customID: '50', check: true }])
  })
})
