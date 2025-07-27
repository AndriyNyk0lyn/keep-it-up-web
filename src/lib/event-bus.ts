const DEBUG_EMIT_COUNT = Symbol('eventbus:debug-emit-count');
const DEBUG_ACTIVE_LISTENERS = Symbol('eventbus:debug-active-listeners');

class EventBus {
  private target: EventTarget
  private [DEBUG_EMIT_COUNT]: number;
  private [DEBUG_ACTIVE_LISTENERS]: Map<string, Set<EventListener>>;

  constructor() {
    this.target = new EventTarget()
    this[DEBUG_EMIT_COUNT] = 0;
    this[DEBUG_ACTIVE_LISTENERS] = new Map();
  }

  emit<T = unknown>(type: string, data?: T): void {
    this[DEBUG_EMIT_COUNT]++;
    const event = new CustomEvent(type, { detail: data })
    this.target.dispatchEvent(event)
  }

  on<T = unknown>(type: string, listener: (event: CustomEvent<T>) => void): void {
    if (!this[DEBUG_ACTIVE_LISTENERS].has(type)) {
      this[DEBUG_ACTIVE_LISTENERS].set(type, new Set());
    }
    this[DEBUG_ACTIVE_LISTENERS].get(type)!.add(listener as EventListener);
    this.target.addEventListener(type, listener as EventListener)
  }

  off<T = unknown>(type: string, listener: (event: CustomEvent<T>) => void): void {
    this.target.removeEventListener(type, listener as EventListener)
    const listeners = this[DEBUG_ACTIVE_LISTENERS].get(type);
    if (listeners) {
      listeners.delete(listener as EventListener);
      if (listeners.size === 0) {
        this[DEBUG_ACTIVE_LISTENERS].delete(type);
      }
    }
  }

  once<T = unknown>(type: string, listener: (event: CustomEvent<T>) => void): void {
    const wrappedListener = (event: CustomEvent<T>) => {
      listener(event)
      this.off(type, wrappedListener)
    }
    this.on(type, wrappedListener)
  }

  getEmitCount(): number {
    return this[DEBUG_EMIT_COUNT];
  }

  getActiveListenerCount(): number {
    return this[DEBUG_ACTIVE_LISTENERS].size;
  }

  getListenersForEvent(type: string): number {
    return this[DEBUG_ACTIVE_LISTENERS].get(type)?.size || 0;
  }
}

export const eventBus = new EventBus() 