import { mount } from '@vue/test-utils'
import IfcViewingRequisites from '@/components/IfcViewing/IfcViewingRequisites.vue'
import { mockModelLevels } from './dataMock'
import type { IModelLevels } from '@/types/ifc'

const levelLabel = (component: ReturnType<typeof mount>) =>
  component.findAll('.el-tree .el-text').find((node) => node.text() !== '')

const mountWithModel = (model: IModelLevels[] = structuredClone(mockModelLevels)) => {
  const component = mount(IfcViewingRequisites)
  component.vm.setModel(model)
  return component
}

describe('IfcViewingRequisites test component', () => {
  it('renders the spatial tree', async () => {
    const component = mountWithModel()
    await component.vm.$nextTick()
    expect(component.find('.ifc-requisites').find('b').text()).toBe('Реквизиты')
    expect(component.text()).toContain('Этаж/Уровень')
    expect(component.find('.el-checkbox').classes()).toContain('is-checked')
  })

  it('labels an unknown type as Элемент', async () => {
    const [level] = structuredClone(mockModelLevels)
    const component = mountWithModel([{ ...level, type: 'NO_SUCH_NAME' }])
    await component.vm.$nextTick()
    expect(component.text()).toContain('Элемент')
  })

  it('clears the highlight when the model is replaced', async () => {
    const component = mountWithModel()
    await component.vm.$nextTick()
    await levelLabel(component)?.trigger('click')
    expect(component.find('.el-text--danger').exists()).toBe(true)

    component.vm.setModel(structuredClone(mockModelLevels))
    await component.vm.$nextTick()
    expect(component.find('.el-text--danger').exists()).toBe(false)
  })

  it('highlights a level and clears it on the second click', async () => {
    const component = mountWithModel()
    await component.vm.$nextTick()
    const label = levelLabel(component)
    await label?.trigger('click')
    expect(component.emitted('transfer-level')?.[0]).toEqual([[8800, 8862, 8928]])
    expect(component.find('.el-text--danger').exists()).toBe(true)

    await label?.trigger('click')
    expect(component.emitted('transfer-level')?.[1]).toEqual([[]])
    expect(component.find('.el-text--danger').exists()).toBe(false)
  })

  it('highlights a level without children by its own id', async () => {
    const [level] = structuredClone(mockModelLevels)
    const component = mountWithModel([{ ...level, children: [] }])
    await component.vm.$nextTick()
    await levelLabel(component)?.trigger('click')
    expect(component.emitted('transfer-level')?.[0]).toEqual([[63]])
  })

  it('emits visibility when the checkbox changes', async () => {
    const component = mountWithModel()
    await component.vm.$nextTick()
    await component.get('input[type="checkbox"]').setValue(false)
    expect(component.emitted('level-hide')?.[0]).toEqual([{ customID: '0-level', visible: false }])

    await component.get('input[type="checkbox"]').setValue(true)
    expect(component.emitted('level-hide')?.[1]).toEqual([{ customID: '0-level', visible: true }])
  })
})
