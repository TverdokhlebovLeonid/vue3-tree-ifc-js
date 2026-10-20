import { mount } from '@vue/test-utils'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import type { ComponentWrapperType } from './interfaceIfcTests'
import { mockSlot } from './dataMock'

vi.mock('vue-router', async () => {
  const { mockRoute } = await import('./dataMock')
  return {
    useRoute: () => mockRoute,
  }
})

describe('DefaultLayout test component', () => {
  let component: ComponentWrapperType<InstanceType<typeof DefaultLayout>>

  beforeEach(() => {
    component = mount(DefaultLayout, mockSlot)
  })

  it('Testing the slot', () => {
    expect(component.find('.default-layout').find('.vitest-slot-div').find('p').text()).toBe(
      'Vitest Slot',
    )
  })

  it('Snapshot component', () => {
    expect(component.html()).toMatchSnapshot()
  })

  it('Testing the route', () => {
    expect(
      component
        .find('.default-layout')
        .find('.el-container')
        .find('.el-header')
        .find('span')
        .text(),
    ).toBe('Просмотр IFC файлов - Vitest')
  })
})
