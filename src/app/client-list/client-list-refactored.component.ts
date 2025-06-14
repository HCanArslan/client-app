import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { ClientStateService } from '../services/client-state.service';
import { ClientFilterService, FilterState, ClientFilters } from '../services/client-filter.service';
import { Client } from '../models/client.model';

interface ClientListViewModel {
  filterState: FilterState;
  isLoading: boolean;
  error: string | null;
  selectedClientId: number | null;
}

@Component({
  selector: 'app-client-list-refactored',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="client-list-container" *ngIf="vm$ | async as vm">
      <div class="header">
        <h1>🏢 Client Management (Refactored)</h1>
        <p class="subtitle">Clean Architecture Implementation</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="vm.isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading clients...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="vm.error && !vm.isLoading" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Failed to Load Clients</h3>
        <p>{{ vm.error }}</p>
        <button class="retry-btn" (click)="onRetryLoad()">
          🔄 Retry
        </button>
      </div>

      <!-- Client List -->
      <div *ngIf="!vm.isLoading && !vm.error" class="clients-section">
        <!-- Header with Filter Toggle -->
        <div class="section-header">
          <h2>Client List ({{ vm.filterState.filteredClients.length }} of {{ vm.filterState.totalCount }})</h2>
          <div class="header-actions">
            <button class="filter-toggle-btn" (click)="onToggleFilters()" [class.active]="showFilters">
              🔍 {{ showFilters ? 'Hide' : 'Show' }} Filters
            </button>
          </div>
        </div>

        <!-- Filter Panel -->
        <div class="filter-panel" [class.show]="showFilters">
          <form [formGroup]="filterForm" class="filter-form">
            <div class="filter-row">
              <div class="filter-group">
                <label for="searchTerm">🔍 Search by Name, Email, Company, or Phone</label>
                <input 
                  id="searchTerm"
                  type="text" 
                  formControlName="searchTerm" 
                  placeholder="Type to search..."
                  class="filter-input">
              </div>
            </div>
            
            <div class="filter-row">
              <div class="filter-group">
                <label class="filter-label">📊 Status Filter</label>
                <select formControlName="statusFilter" class="filter-select">
                  <option value="all">All Clients</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            <div class="filter-actions">
              <div class="filter-summary">
                <span class="summary-text">{{ getFilterSummary(vm.filterState.filters) }}</span>
              </div>
              <button 
                type="button" 
                class="clear-filters-btn" 
                (click)="onClearFilters()"
                [disabled]="!vm.filterState.isFiltering">
                🧹 Clear Filters
              </button>
            </div>
          </form>
        </div>

        <!-- Empty State -->
        <div *ngIf="vm.filterState.filteredClients.length === 0 && vm.filterState.totalCount === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No Clients Found</h3>
          <p>Start by adding your first client to the database.</p>
        </div>

        <!-- No Results State (when filters are applied) -->
        <div *ngIf="vm.filterState.filteredClients.length === 0 && vm.filterState.totalCount > 0" class="no-results-state">
          <div class="no-results-icon">🔍</div>
          <h3>No Clients Match Your Filters</h3>
          <p>Try adjusting your search criteria or clearing the filters.</p>
          <button class="clear-filters-btn" (click)="onClearFilters()">
            🧹 Clear All Filters
          </button>
        </div>

        <!-- Clients Table -->
        <div *ngIf="vm.filterState.filteredClients.length > 0" class="table-container">
          <table class="clients-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let client of vm.filterState.filteredClients; trackBy: trackByClientId" class="client-row">
                <td class="id-cell">{{ client.id }}</td>
                <td class="name-cell">
                  <div class="client-name">{{ client.name }}</div>
                </td>
                <td class="email-cell">
                  <a [href]="'mailto:' + client.email" class="email-link">
                    {{ client.email }}
                  </a>
                </td>
                <td class="phone-cell">
                  <a [href]="'tel:' + client.phone" class="phone-link">
                    {{ client.phone }}
                  </a>
                </td>
                <td class="company-cell">
                  {{ client.company || 'N/A' }}
                </td>
                <td class="status-cell">
                  <span class="status-badge" [ngClass]="getStatusClass(client.status)">
                    {{ client.status | titlecase }}
                  </span>
                </td>
                <td class="date-cell">
                  {{ formatDate(client.createdAt) }}
                </td>
                <td class="actions-cell">
                  <div class="action-buttons">
                    <button 
                      class="edit-btn" 
                      (click)="onEditClient(client.id)"
                      title="Edit Client">
                      ✏️ Edit
                    </button>
                    <button 
                      class="delete-btn" 
                      (click)="onDeleteClient(client)"
                      title="Delete Client">
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Performance Info -->
        <div class="performance-info" *ngIf="vm.filterState.filteredClients.length > 0">
          <small>
            ⚡ Filtered {{ vm.filterState.filteredClients.length }} clients from {{ vm.filterState.totalCount }} total
            {{ vm.filterState.isFiltering ? '(filters applied with 300ms debounce)' : '' }}
          </small>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./client-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientListRefactoredComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  // Services
  private readonly clientStateService = inject(ClientStateService);
  private readonly filterService = inject(ClientFilterService);
  private readonly fb = inject(FormBuilder);

  // UI State
  showFilters = false;

  // Form
  readonly filterForm = this.createFilterForm();

  // View Model - combines all reactive streams
  readonly vm$ = this.createViewModel();

  ngOnInit(): void {
    this.initializeComponent();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Event Handlers
  onEditClient(clientId: number): void {
    this.clientStateService.selectClient(clientId);
    // In a real app, this would open a modal or navigate to edit page
    console.log('📝 Edit client:', clientId);
  }

  onDeleteClient(client: Client): void {
    if (confirm(`Are you sure you want to delete "${client.name}"?`)) {
      this.clientStateService.deleteClient(client.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => console.log('✅ Client deleted successfully'),
          error: (error) => console.error('❌ Failed to delete client:', error)
        });
    }
  }

  onToggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onClearFilters(): void {
    this.filterService.clearFilters();
    this.filterForm.reset({
      searchTerm: '',
      statusFilter: 'all'
    });
  }

  onRetryLoad(): void {
    this.clientStateService.loadClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  // Utility Methods
  trackByClientId(index: number, client: Client): number {
    return client.id;
  }

  getStatusClass(status: string): string {
    return status === 'active' ? 'status-active' : 'status-inactive';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getFilterSummary(filters: ClientFilters): string {
    return this.filterService.getFilterSummary(filters);
  }

  // Private Methods
  private createFilterForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      statusFilter: ['all']
    });
  }

  private createViewModel() {
    return combineLatest([
      this.filterService.filterState$,
      this.clientStateService.isLoading$,
      this.clientStateService.error$,
      this.clientStateService.selectedClientId$
    ]).pipe(
      map(([filterState, isLoading, error, selectedClientId]) => ({
        filterState,
        isLoading,
        error,
        selectedClientId
      }))
    );
  }

  private initializeComponent(): void {
    // Load initial data
    this.clientStateService.loadClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    // Subscribe to clients changes and update filter service
    this.clientStateService.clients$
      .pipe(takeUntil(this.destroy$))
      .subscribe(clients => {
        this.filterService.updateClients(clients);
      });
  }

  private setupFormSubscriptions(): void {
    // Subscribe to form changes and update filters
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(formValue => {
        this.filterService.updateFilters(formValue);
      });
  }
} 