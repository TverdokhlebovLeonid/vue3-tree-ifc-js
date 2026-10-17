export type ISwitchChoice = Record<string, () => void>

export interface ITools {
  active: boolean
  icon: string
  popover: string
  name: string
  tool: string
}
