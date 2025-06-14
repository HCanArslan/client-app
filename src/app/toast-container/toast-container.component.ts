import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss'
})
export class ToastContainerComponent implements OnInit {
  toasts$!: Observable<ToastMessage[]>;
  
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.toasts$ = this.toastService.toasts$;
  }

  /**
   * Remove toast
   */
  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  /**
   * Get icon for toast type
   */
  getToastIcon(type: ToastMessage['type']): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  }

  /**
   * Get CSS class for toast type
   */
  getToastClass(type: ToastMessage['type']): string {
    return `toast-${type}`;
  }

  /**
   * TrackBy function for toast list performance
   */
  trackByToastId(index: number, toast: ToastMessage): string {
    return toast.id;
  }
}
