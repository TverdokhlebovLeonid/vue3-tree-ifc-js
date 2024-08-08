import type { VueWrapper } from '@vue/test-utils'
import type { ComponentPublicInstance } from 'vue'

export type ComponentWrapperType<T> = VueWrapper<ComponentPublicInstance & T>
