import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import IfcViewingRequisites from '@/components/IfcViewing/IfcViewingRequisites.vue'
import { nextTick } from 'vue'
import { modelLevels } from './dataMock'

const TEST_ID = 63

test('Snapshot and render component', async () => {
  const component = mount(IfcViewingRequisites)
  component.vm.modelLevels = modelLevels
  await nextTick()
  expect(component.find('.ifc-requisites').find('b').text()).toBe('Реквизиты')
  expect(component.html()).toMatchSnapshot()
})

test('Function setElementName', async () => {
  const component = mount(IfcViewingRequisites)
  const func = component.vm.setElementName
  const name = 'IFCBUILDINGSTOREY'
  expect(func(name)).toBe('Этаж/Уровень')
  const nameDefault = 'NO_SUCH_NAME'
  expect(func(nameDefault)).toBe('Элемент')
})

test('Function setModel', async () => {
  const component = mount(IfcViewingRequisites)
  component.vm.setModel(modelLevels)
  expect(component.vm.modelLevels[0].customID).toBe('0-level')
  expect(component.vm.levelActive).toBe(null)
})

test('Function transferLevel', async () => {
  const component = mount(IfcViewingRequisites)
  component.vm.levelActive = TEST_ID
  component.vm.transferLevel(modelLevels, TEST_ID)
  expect(component.vm.levelActive).toBe(null)
  expect(component.emitted('transfer-level')?.[0]).toEqual([[]])
})

test('Function transferLevel(same id)', async () => {
  const component = mount(IfcViewingRequisites)
  component.vm.levelActive = 50
  component.vm.transferLevel(modelLevels, TEST_ID)
  expect(component.vm.levelActive).toBe(TEST_ID)
  expect(component.emitted('transfer-level')?.[0]).toEqual([[TEST_ID]])
})

test('Function setLevelHide', async () => {
  const component = mount(IfcViewingRequisites)
  component.vm.setLevelHide('50', true)
  expect(component.emitted('level-hide')?.[0]).toEqual([{ customID: '50', check: true }])
})
