import { mount } from '@vue/test-utils'
import IfcViewingRequisites from '@/features/ifc-viewing/components/IfcViewingRequisites.vue'
import { mockModelLevels } from './dataMock'
import type { IModelLevels } from '@/features/ifc-viewing/types/ifc'

const levelLabel = (component: ReturnType<typeof mount>) =>
  component.find('.ifc-requisites__label')

const mountWithModel = (model: IModelLevels[] = structuredClone(mockModelLevels)) =>
  mount(IfcViewingRequisites, { props: { modelLevels: model } })

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
    await levelLabel(component).trigger('click')
    expect(component.find('.ifc-requisites__label_active').exists()).toBe(true)

    await component.setProps({ modelLevels: structuredClone(mockModelLevels) })
    await component.vm.$nextTick()
    expect(component.find('.ifc-requisites__label_active').exists()).toBe(false)
  })

  it('highlights a level without spaces and clears it on the second click', async () => {
    const component = mountWithModel()
    await component.vm.$nextTick()
    const label = levelLabel(component)
    expect(label.element.tagName).toBe('BUTTON')
    expect(label.attributes('type')).toBe('button')
    await label.trigger('click')
    expect(component.emitted('transfer-level')?.[0]).toEqual([[8800, 8862, 8928, 9100, 9101]])
    expect(component.find('.ifc-requisites__label_active').exists()).toBe(true)

    await label.trigger('click')
    expect(component.emitted('transfer-level')?.[1]).toEqual([[]])
    expect(component.find('.ifc-requisites__label_active').exists()).toBe(false)
  })

  it('highlights a leaf by its own id', async () => {
    const component = mountWithModel([
      {
        visible: true,
        customID: '0-level',
        expressID: 63,
        type: 'IFCWALL',
        children: [],
      } as unknown as IModelLevels,
    ])
    await component.vm.$nextTick()
    await levelLabel(component).trigger('click')
    expect(component.emitted('transfer-level')?.[0]).toEqual([[63]])
  })

  it('highlights nothing when the level subset has no ids', async () => {
    const [level] = structuredClone(mockModelLevels)
    const component = mountWithModel([
      { ...level, ids: [], children: [{ expressID: 9000, type: 'IFCSPACE', children: [] }] },
    ])
    await component.vm.$nextTick()
    await levelLabel(component).trigger('click')
    expect(component.emitted('transfer-level')?.[0]).toEqual([[]])
  })

  it('clears the highlight when the active level is hidden', async () => {
    const component = mountWithModel()
    await component.vm.$nextTick()
    await levelLabel(component).trigger('click')
    await component.get('input[type="checkbox"]').setValue(false)

    expect(component.emitted('level-hide')?.[0]).toEqual([{ customID: '0-level', visible: false }])
    expect(component.emitted('transfer-level')?.at(-1)).toEqual([[]])
    expect(component.find('.ifc-requisites__label_active').exists()).toBe(false)
  })

  it('emits visibility when the checkbox changes', async () => {
    const component = mountWithModel()
    await component.vm.$nextTick()
    await component.get('input[type="checkbox"]').setValue(false)
    expect(component.emitted('level-hide')?.[0]).toEqual([{ customID: '0-level', visible: false }])

    await component.get('input[type="checkbox"]').setValue(true)
    expect(component.emitted('level-hide')?.[1]).toEqual([{ customID: '0-level', visible: true }])
    expect(component.emitted('transfer-level')).toBeUndefined()
  })
})
