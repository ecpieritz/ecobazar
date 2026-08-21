import { computed, Injectable, signal } from '@angular/core';

export type NotificationKind = 'success' | 'error' | 'info' | 'warning';

export interface AppNotification {
  readonly id: number;
  readonly kind: NotificationKind;
  readonly title: string;
  readonly message: string;
}

export interface NotificationInput {
  readonly kind: NotificationKind;
  readonly title: string;
  readonly message: string;
  readonly duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly state = signal<readonly AppNotification[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;

  readonly notifications = computed(() => this.state());

  show(input: NotificationInput): number {
    const id = ++this.nextId;
    const notification: AppNotification = {
      id,
      kind: input.kind,
      title: input.title,
      message: input.message,
    };
    this.state.update((notifications) => [...notifications.slice(-3), notification]);
    const duration = input.duration ?? 5000;
    if (duration > 0)
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      );
    return id;
  }

  success(message: string, title = 'Success'): number {
    return this.show({ kind: 'success', title, message });
  }

  error(message: string, title = 'Something went wrong'): number {
    return this.show({ kind: 'error', title, message, duration: 7000 });
  }

  dismiss(id: number): void {
    this.state.update((notifications) => notifications.filter((item) => item.id !== id));
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
  }

  clear(): void {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
    this.state.set([]);
  }
}
