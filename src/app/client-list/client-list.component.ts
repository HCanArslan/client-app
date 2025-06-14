import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ClientService } from '../services/client.service';
import { ToastService } from '../services/toast.service';
import { ClientEditComponent } from '../client-edit/client-edit.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Client } from '../models/client.model';
import { Subject, takeUntil } from 'rxjs';

/**
 * ClientListComponent - Manages the display and interaction with client data
 * 
 * This component demonstrates:
 * - Angular reactive programming with RxJS
 * - OnPush change detection strategy for performance
 * - Component lifecycle management
 * - Modal-based editing and confirmation dialogs
 * - Real-time filtering and search functionality
 * - Professional error handling and user feedback
 */
@Component({
  selector: 'app-client-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ClientEditComponent, ConfirmationDialogComponent],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private clientService = inject(ClientService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // Component state
  clients: Client[] = [];
  filteredClients: Client[] = [];
  isLoading = false;
  error: string | null = null;

  // Modal states
  showEditModal = false;
  showDeleteConfirmation = false;
  editingClient: Client | null = null;
  clientToDelete: Client | null = null;

  // Filter states
  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  showFilters = false;
  filterForm!: FormGroup;

  // Utility method placeholders
  selectedClientId: number | null = null;

  /**
   * Utility for structured logging
   * Provides consistent logging format for debugging and monitoring
   */
  private logger = {
    info: (message: string, context?: any) => {
      console.log(`[ClientListComponent] ${message}`, context || '');
    },
    warn: (message: string, context?: any) => {
      console.warn(`[ClientListComponent] ${message}`, context || '');
    },
    error: (message: string, context?: any) => {
      console.error(`[ClientListComponent] ${message}`, context || '');
    }
  };

  ngOnInit(): void {
    this.logger.info('Component initialized - loading client data');
    this.initializeForm();
    this.loadClients();
  }

  /**
   * Initialize the reactive form for filters
   */
  private initializeForm(): void {
    this.filterForm = this.fb.group({
      name: [''],
      activeOnly: [false],
      showInactive: [false]
    });

    // Subscribe to form changes
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(values => {
        this.searchTerm = values.name || '';
        if (values.activeOnly && values.showInactive) {
          this.statusFilter = 'all';
        } else if (values.activeOnly) {
          this.statusFilter = 'active';
        } else if (values.showInactive) {
          this.statusFilter = 'inactive';
        } else {
          this.statusFilter = 'all';
        }
        this.applyFilters();
      });
  }

  ngOnDestroy(): void {
    this.logger.info('Component destroyed - cleaning up subscriptions');
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads clients from the API with proper error handling
   * Demonstrates reactive programming and error handling patterns
   */
  loadClients(): void {
    this.isLoading = true;
    this.error = null;

    this.clientService.getClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clients) => {
          this.clients = clients;
          this.applyFilters();
          this.isLoading = false;
          this.cdr.markForCheck(); // Trigger change detection
          
          this.logger.info('Clients loaded successfully', {
            count: clients.length,
            activeClients: clients.filter(c => c.status === 'active').length,
            inactiveClients: clients.filter(c => c.status === 'inactive').length
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.message;
          this.cdr.markForCheck(); // Trigger change detection
          
          this.logger.error('Failed to load clients', {
            error: error.message,
            timestamp: new Date().toISOString()
          });
          
          this.toastService.error('Failed to Load Clients', error.message);
        }
      });
  }

  /**
   * Applies search and status filters to the client list
   * Demonstrates client-side filtering and data transformation
   */
  applyFilters(): void {
    let filtered = [...this.clients];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        (client.company && client.company.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === this.statusFilter);
    }

    this.filteredClients = filtered;

    this.logger.info('Filters applied', {
      searchTerm: this.searchTerm,
      statusFilter: this.statusFilter,
      totalClients: this.clients.length,
      filteredCount: this.filteredClients.length
    });
  }

  /**
   * Handles search input changes
   * @param event - Input event from search field
   */
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.applyFilters();
  }

  /**
   * Handles status filter changes
   * @param event - Change event from status select
   */
  onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.statusFilter = target.value as 'all' | 'active' | 'inactive';
    this.applyFilters();
  }

  /**
   * Clears all applied filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.applyFilters();
    
    this.logger.info('Filters cleared - showing all clients');
    this.toastService.info('Filters Cleared', 'All filters have been reset');
  }

  /**
   * Opens the edit modal for a specific client
   * @param client - The client to edit
   */
  editClient(client: Client): void {
    this.editingClient = client;
    this.showEditModal = true;
    
    this.logger.info('Edit modal opened', {
      clientId: client.id,
      clientName: client.name
    });
  }

  /**
   * Handles successful client updates from the edit modal
   * @param updatedClient - The updated client data
   */
  onClientUpdated(updatedClient: Client): void {
    const index = this.clients.findIndex(c => c.id === updatedClient.id);
    if (index !== -1) {
      this.clients[index] = updatedClient;
      this.applyFilters();
      
      this.logger.info('Client updated successfully', {
        clientId: updatedClient.id,
        clientName: updatedClient.name,
        updateTimestamp: updatedClient.updatedAt
      });
      
      this.toastService.success('Client Updated', `"${updatedClient.name}" updated successfully`);
    }
    
    this.closeEditModal();
  }

  /**
   * Closes the edit modal and resets state
   */
  closeEditModal(): void {
    this.showEditModal = false;
    this.editingClient = null;
    
    this.logger.info('Edit modal closed');
  }

  /**
   * Initiates the delete confirmation process
   * @param client - The client to delete
   */
  deleteClient(client: Client): void {
    this.clientToDelete = client;
    this.showDeleteConfirmation = true;
    
    this.logger.info('Delete confirmation requested', {
      clientId: client.id,
      clientName: client.name
    });
  }

  /**
   * Confirms and executes client deletion
   */
  confirmDelete(): void {
    if (!this.clientToDelete) {
      this.logger.warn('Delete confirmation called without selected client');
      return;
    }

    const clientToDelete = this.clientToDelete;
    
    this.clientService.deleteClient(clientToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.clients = this.clients.filter(c => c.id !== clientToDelete.id);
          this.applyFilters();
          
          this.logger.info('Client deleted successfully', {
            deletedClientId: clientToDelete.id,
            deletedClientName: clientToDelete.name,
            remainingClients: this.clients.length
          });
          
          this.toastService.success('Client Deleted', `"${clientToDelete.name}" deleted successfully`);
          this.cancelDelete();
        },
        error: (error) => {
          this.logger.error('Failed to delete client', {
            clientId: clientToDelete.id,
            clientName: clientToDelete.name,
            error: error.message
          });
          
          this.toastService.error('Delete Failed', `Failed to delete client: ${error.message}`);
          this.cancelDelete();
        }
      });
  }

  /**
   * Cancels the delete operation and resets state
   */
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.clientToDelete = null;
    
    this.logger.info('Delete operation cancelled');
  }

  /**
   * Refreshes the client list
   * Provides manual refresh capability for users
   */
  refreshClients(): void {
    this.logger.info('Manual refresh requested');
    this.loadClients();
    this.toastService.info('Refreshing', 'Loading latest client data...');
  }

  /**
   * TrackBy function for ngFor optimization
   * Improves rendering performance by tracking items by ID
   * @param index - Array index
   * @param client - Client object
   * @returns Unique identifier for tracking
   */
  trackByClientId(index: number, client: Client): number {
    return client.id;
  }

  /**
   * Gets the current filter summary for display
   * @returns Human-readable filter description
   */
  getFilterSummary(): string {
    const parts: string[] = [];
    
    if (this.searchTerm) {
      parts.push(`search: "${this.searchTerm}"`);
    }
    
    if (this.statusFilter !== 'all') {
      parts.push(`status: ${this.statusFilter}`);
    }
    
    return parts.length > 0 ? `Filtered by ${parts.join(', ')}` : 'No filters applied';
  }

  /**
   * Determines if any filters are currently active
   * @returns True if filters are applied
   */
  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || this.statusFilter !== 'all';
  }

  /**
   * Toggles the filter panel visibility
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    this.logger.info(`Filter panel ${this.showFilters ? 'opened' : 'closed'}`);
  }

  /**
   * Gets CSS status class for client status
   * @param status - Client status
   * @returns CSS class name
   */
  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  /**
   * Formats date for display
   * @param dateString - ISO date string
   * @returns Formatted date
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  /**
   * Shows delete confirmation dialog for client
   * @param client - Client to delete
   */
  showDeleteConfirmationDialog(client: Client): void {
    this.deleteClient(client);
  }

  /**
   * Handles edit modal cancellation
   */
  onEditCancelled(): void {
    this.closeEditModal();
  }

  /**
   * Handles delete confirmation
   */
  onDeleteConfirmed(): void {
    this.confirmDelete();
  }

  /**
   * Handles delete cancellation
   */
  onDeleteCancelled(): void {
    this.cancelDelete();
  }

  /**
   * Retry loading clients after error
   */
  retryLoad(): void {
    this.refreshClients();
  }

  /**
   * Delete confirmation config for dialog
   */
  get deleteConfirmationConfig() {
    return {
      title: 'Delete Client',
      message: this.clientToDelete ? 
        `Are you sure you want to delete "${this.clientToDelete.name}"? This action cannot be undone.` : 
        'Are you sure you want to delete this client?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger' as const
    };
  }

  /**
   * Whether deletion is in progress
   */
  get isDeleting(): boolean {
    return false; // This would be managed by the delete operation state
  }

  /**
   * Whether edit form is visible (alias for showEditModal)
   */
  get showEditForm(): boolean {
    return this.showEditModal;
  }
}
