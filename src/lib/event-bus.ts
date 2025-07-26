class EventBus {
  private target: EventTarget

  constructor() {
    this.target = new EventTarget()
  }

  emit<T = unknown>(type: string, data?: T): void {
    const event = new CustomEvent(type, { detail: data })
    this.target.dispatchEvent(event)
  }

  on<T = unknown>(type: string, listener: (event: CustomEvent<T>) => void): void {
    this.target.addEventListener(type, listener as EventListener)
  }

  off<T = unknown>(type: string, listener: (event: CustomEvent<T>) => void): void {
    this.target.removeEventListener(type, listener as EventListener)
  }

  once<T = unknown>(type: string, listener: (event: CustomEvent<T>) => void): void {
    const wrappedListener = (event: CustomEvent<T>) => {
      listener(event)
      this.off(type, wrappedListener)
    }
    this.on(type, wrappedListener)
  }
}

export const eventBus = new EventBus() 