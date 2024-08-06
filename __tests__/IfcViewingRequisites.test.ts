import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import IfcViewingRequisites from '@/components/IfcViewing/IfcViewingRequisites.vue'
import { nextTick } from 'vue'
import { modelLevels } from './dataMock'

test('Snapshot and render component', async () => {
  const component = mount(IfcViewingRequisites)
  component.vm.modelLevels = modelLevels
  await nextTick()
  expect(component.find('.ifc-requisites').find('b').text()).toBe('Реквизиты')
  expect(component.html()).toMatchSnapshot()
})
