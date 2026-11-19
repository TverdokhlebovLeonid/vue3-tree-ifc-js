import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import IfcViewingBlock from '@/features/ifc-viewing/components/IfcViewingBlock.vue'
import { IFC_VIEWING_TOOLS } from '@/features/ifc-viewing/constants/ifcViewingTools'
import { mockModelLevels } from './dataMock'
import type { IModelLevel } from '@/features/ifc-viewing/types/ifc'

vi.mock('@/features/ifc-viewing/components/IfcViewing.vue', () => ({
  default: defineComponent({
    name: 'IfcViewing',
    props: {
      levelVisibility: { type: Array, required: true },
      levelHighlight: { default: null },
      isFullscreen: { type: Boolean, default: false },
      toolCommand: { default: null },
      activeTool: { type: String, default: '' },
    },
    emits: ['set-model', 'update:activeTool'],
    template: '<div class="viewer-stub" />',
  }),
}))

const fullscreenState = { element: null as Element | null }

const installFullscreen = (): void => {
  Object.defineProperty(document.documentElement, 'requestFullscreen', {
    configurable: true,
    writable: true,
    value: vi.fn(async () => {
      fullscreenState.element = document.documentElement
    }),
  })
  Object.defineProperty(document, 'exitFullscreen', {
    configurable: true,
    writable: true,
    value: vi.fn(async () => {
      fullscreenState.element = null
    }),
  })
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    get: () => fullscreenState.element,
  })
}

const viewerOf = (block: VueWrapper) => block.findComponent({ name: 'IfcViewing' })

const clickButton = async (block: VueWrapper, name: string): Promise<void> => {
  const button = block.findAll('button').find((item) => item.text().includes(name))
  expect(button?.exists()).toBe(true)
  await button!.trigger('click')
}

const showModel = async (block: VueWrapper, levels: IModelLevel[] = mockModelLevels) => {
  viewerOf(block).vm.$emit('set-model', structuredClone(levels))
  await block.vm.$nextTick()
}

describe('IfcViewingBlock', () => {
  let block: VueWrapper

  beforeEach(() => {
    fullscreenState.element = null
    installFullscreen()
    block = mount(IfcViewingBlock)
  })

  afterEach(() => {
    block.unmount()
  })

  it('passes the initial viewer props', () => {
    expect(viewerOf(block).props()).toMatchObject({
      activeTool: '',
      isFullscreen: false,
      toolCommand: null,
      levelHighlight: null,
      levelVisibility: [],
    })
  })

  it('sends each tool click as a new command', async () => {
    await clickButton(block, 'Плоскость')
    expect(viewerOf(block).props('toolCommand')).toEqual({
      key: 1,
      name: IFC_VIEWING_TOOLS.createPlane,
    })

    await clickButton(block, 'Координаты')
    expect(viewerOf(block).props('toolCommand')).toEqual({
      key: 2,
      name: IFC_VIEWING_TOOLS.createCoordinates,
    })
  })

  it('turns off the tool accepted by the viewer', async () => {
    await clickButton(block, 'Плоскость')
    viewerOf(block).vm.$emit('update:activeTool', IFC_VIEWING_TOOLS.createPlane)
    await block.vm.$nextTick()
    expect(block.find('.ifc-tools__buttons_active').text()).toContain('Плоскость')

    await clickButton(block, 'Плоскость')
    expect(viewerOf(block).props('toolCommand')).toEqual({ key: 2, name: '' })
    expect(viewerOf(block).props('activeTool')).toBe(IFC_VIEWING_TOOLS.createPlane)
  })

  it('opens fullscreen from the toolbar and closes it from the button', async () => {
    await showModel(block)
    await clickButton(block, 'Во весь экран')
    await flushPromises()

    const viewer = viewerOf(block)
    expect(viewer.props('isFullscreen')).toBe(true)
    expect(viewer.props('toolCommand')).toBeNull()
    expect(block.classes()).toContain('ifc-viewing-block__fullscreen')
    expect(block.find('.ifc-viewing-block__control-panel').classes()).toContain(
      'ifc-viewing-block__control-panel_fullscreen',
    )
    expect((block.get('.ifc-requisites').element as HTMLElement).style.display).toBe('none')

    await clickButton(block, 'Закрыть')
    await flushPromises()
    expect(viewer.props('isFullscreen')).toBe(false)
    expect((block.get('.ifc-requisites').element as HTMLElement).style.display).toBe('')
    expect(block.find('.ifc-viewing-block__control-panel_close-btn').exists()).toBe(false)
  })

  it('keeps the active tool when fullscreen opens', async () => {
    viewerOf(block).vm.$emit('update:activeTool', IFC_VIEWING_TOOLS.createCoordinates)
    await block.vm.$nextTick()
    await clickButton(block, 'Во весь экран')
    await flushPromises()

    expect(viewerOf(block).props('activeTool')).toBe(IFC_VIEWING_TOOLS.createCoordinates)
    expect(viewerOf(block).props('toolCommand')).toBeNull()
    expect(block.find('.ifc-tools__buttons_active').text()).toContain('Координаты')
  })

  it('shows the model and clears visibility when the model is replaced', async () => {
    await showModel(block)
    expect(block.text()).toContain('Этаж/Уровень')

    block.findComponent({ name: 'ElCheckbox' }).vm.$emit('change', false)
    await block.vm.$nextTick()
    expect(viewerOf(block).props('levelVisibility')).toEqual([
      { customID: '0-level', visible: false },
    ])

    await showModel(block)
    expect(viewerOf(block).props('levelVisibility')).toEqual([])
    expect(block.find('.el-checkbox').classes()).toContain('is-checked')
  })

  it('forwards a level highlight and clears it on the second click', async () => {
    await showModel(block)
    await clickButton(block, 'Этаж/Уровень')
    expect(viewerOf(block).props('levelHighlight')).toEqual([8800, 8862, 8928, 9100, 9101])

    await clickButton(block, 'Этаж/Уровень')
    expect(viewerOf(block).props('levelHighlight')).toEqual([])
  })

  it('keeps the highlight when another level is hidden', async () => {
    const [first] = structuredClone(mockModelLevels)
    const second: IModelLevel = {
      ...structuredClone(first),
      customID: '1-level',
      expressID: 70,
      ids: [700],
      children: [],
    }
    await showModel(block, [first, second])

    const labels = block.findAll('.ifc-requisites__label')
    await labels[1].trigger('click')
    block.findAllComponents({ name: 'ElCheckbox' })[0].vm.$emit('change', false)
    await block.vm.$nextTick()

    expect(viewerOf(block).props('levelHighlight')).toEqual([700])
    expect(viewerOf(block).props('levelVisibility')).toEqual([
      { customID: '0-level', visible: false },
    ])
  })

  it('keeps both visibility changes made in one tick', async () => {
    await showModel(block)
    const checkbox = block.findComponent({ name: 'ElCheckbox' })
    checkbox.vm.$emit('change', false)
    checkbox.vm.$emit('change', true)
    await block.vm.$nextTick()

    expect(viewerOf(block).props('levelVisibility')).toEqual([
      { customID: '0-level', visible: false },
      { customID: '0-level', visible: true },
    ])
  })

  it('clears the highlight when the active level is hidden', async () => {
    await showModel(block)
    await clickButton(block, 'Этаж/Уровень')
    block.findComponent({ name: 'ElCheckbox' }).vm.$emit('change', false)
    await block.vm.$nextTick()

    expect(viewerOf(block).props('levelHighlight')).toEqual([])
    expect(viewerOf(block).props('levelVisibility')).toEqual([
      { customID: '0-level', visible: false },
    ])
    expect(block.find('.ifc-requisites__label_active').exists()).toBe(false)
  })
})
