import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$: Observable<ToastMessage[]> = this.toastsSubject.asObservable();

  private defaultDuration = 5000; // 5 seconds

  /**
   * Show success toast
   */
  success(title: string, message: string = '', duration?: number): void {
    this.addToast('success', title, message, duration);
  }

  /**
   * Show error toast
   */
  error(title: string, message: string = '', duration?: number): void {
    this.addToast('error', title, message, duration || 8000); // Errors stay longer
  }

  /**
   * Show warning toast
   */
  warning(title: string, message: string = '', duration?: number): void {
    this.addToast('warning', title, message, duration);
  }

  /**
   * Show info toast
   */
  info(title: string, message: string = '', duration?: number): void {
    this.addToast('info', title, message, duration);
  }

  /**
   * Remove specific toast
   */
  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Add toast to the list
   */
  private addToast(type: ToastMessage['type'], title: string, message: string, duration?: number): void {
    const toast: ToastMessage = {
      id: this.generateId(),
      type,
      title,
      message,
      duration: duration || this.defaultDuration,
      timestamp: new Date()
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto-remove toast after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, toast.duration);
    }
  }

  /**
   * Generate unique ID for toast
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}
