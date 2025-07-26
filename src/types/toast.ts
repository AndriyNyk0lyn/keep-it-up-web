export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface ToastData {
  id?: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ToastEventData extends ToastData {
  id: string
}

export interface ToastEvents {
  'toast:show': ToastEventData
  'toast:dismiss': { id: string }
  'toast:clear': void
}

export type ToastEventType = keyof ToastEvents 