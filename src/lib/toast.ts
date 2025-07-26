import { toast as sonnerToast } from "sonner";
import { nanoid } from "nanoid";
import { eventBus } from "./event-bus";
import type { ToastData, ToastEventData, ToastEvents } from "@/types/toast";

class ToastService {
  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    eventBus.on<ToastEvents["toast:show"]>("toast:show", (event) => {
      this.handleShowToast(event.detail);
    });

    eventBus.on<ToastEvents["toast:dismiss"]>("toast:dismiss", (event) => {
      this.handleDismissToast(event.detail);
    });

    eventBus.on<ToastEvents["toast:clear"]>("toast:clear", () => {
      this.handleClearToasts();
    });
  }

  private handleShowToast(data: ToastEventData): void {
    const { type, message, title, duration, action } = data;

    const toastOptions = {
      id: data.id,
      duration: duration ?? (type === "loading" ? Infinity : 4000),
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
    };

    switch (type) {
      case "success":
        sonnerToast.success(
          title || message,
          title ? { description: message, ...toastOptions } : toastOptions
        );
        break;
      case "error":
        sonnerToast.error(
          title || message,
          title ? { description: message, ...toastOptions } : toastOptions
        );
        break;
      case "warning":
        sonnerToast.warning(
          title || message,
          title ? { description: message, ...toastOptions } : toastOptions
        );
        break;
      case "info":
        sonnerToast.info(
          title || message,
          title ? { description: message, ...toastOptions } : toastOptions
        );
        break;
      case "loading":
        sonnerToast.loading(
          title || message,
          title ? { description: message, ...toastOptions } : toastOptions
        );
        break;
    }
  }

  private handleDismissToast(data: { id: string }): void {
    sonnerToast.dismiss(data.id);
  }

  private handleClearToasts(): void {
    sonnerToast.dismiss();
  }

  show(data: ToastData): string {
    const id = data.id || nanoid();
    const eventData: ToastEventData = { ...data, id };
    eventBus.emit("toast:show", eventData);
    return id;
  }

  success(
    message: string,
    title?: string,
    options?: Partial<ToastData>
  ): string {
    return this.show({ ...options, type: "success", message, title });
  }

  error(message: string, title?: string, options?: Partial<ToastData>): string {
    return this.show({ ...options, type: "error", message, title });
  }

  warning(
    message: string,
    title?: string,
    options?: Partial<ToastData>
  ): string {
    return this.show({ ...options, type: "warning", message, title });
  }

  info(message: string, title?: string, options?: Partial<ToastData>): string {
    return this.show({ ...options, type: "info", message, title });
  }

  loading(
    message: string,
    title?: string,
    options?: Partial<ToastData>
  ): string {
    return this.show({ ...options, type: "loading", message, title });
  }

  dismiss(id: string): void {
    eventBus.emit("toast:dismiss", { id });
  }

  clear(): void {
    eventBus.emit("toast:clear");
  }
}

export const toast = new ToastService();
