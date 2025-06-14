import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Client } from '../models/client.model';

export interface ClientFilters {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
}

export interface FilterState {
  filters: ClientFilters;
  filteredClients: Client[];
  totalCount: number;
  isFiltering: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientFilterService {
  private readonly filtersSubject = new BehaviorSubject<ClientFilters>({
    searchTerm: '',
    statusFilter: 'all'
  });

  private readonly clientsSubject = new BehaviorSubject<Client[]>([]);

  readonly filters$ = this.filtersSubject.asObservable();
  readonly clients$ = this.clientsSubject.asObservable();

  readonly filteredClients$ = combineLatest([
    this.clients$,
    this.filters$.pipe(
      debounceTime(300), // Debounce filter changes for better performance
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    )
  ]).pipe(
    map(([clients, filters]) => this.applyFilters(clients, filters))
  );

  readonly filterState$: Observable<FilterState> = combineLatest([
    this.filteredClients$,
    this.filters$,
    this.clients$
  ]).pipe(
    map(([filteredClients, filters, allClients]) => ({
      filters,
      filteredClients,
      totalCount: allClients.length,
      isFiltering: this.hasActiveFilters(filters)
    }))
  );

  /**
   * Update the list of clients to filter
   */
  updateClients(clients: Client[]): void {
    this.clientsSubject.next(clients);
  }

  /**
   * Update filter criteria
   */
  updateFilters(filters: Partial<ClientFilters>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...filters });
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filtersSubject.next({
      searchTerm: '',
      statusFilter: 'all'
    });
  }

  /**
   * Get current filter values
   */
  getCurrentFilters(): ClientFilters {
    return this.filtersSubject.value;
  }

  /**
   * Check if any filters are currently active
   */
  hasActiveFilters(filters?: ClientFilters): boolean {
    const currentFilters = filters || this.filtersSubject.value;
    return currentFilters.searchTerm.trim() !== '' || currentFilters.statusFilter !== 'all';
  }

  /**
   * Apply filters to the client list
   */
  private applyFilters(clients: Client[], filters: ClientFilters): Client[] {
    let filtered = [...clients];

    // Apply search filter
    if (filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(client =>
        this.matchesSearchTerm(client, searchTerm)
      );
    }

    // Apply status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === filters.statusFilter);
    }

    return filtered;
  }

  /**
   * Check if client matches search term
   */
  private matchesSearchTerm(client: Client, searchTerm: string): boolean {
    const searchableFields = [
      client.name,
      client.email,
      client.company || '',
      client.phone || ''
    ];

    return searchableFields.some(field =>
      field.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get filter summary for display
   */
  getFilterSummary(filters?: ClientFilters): string {
    const currentFilters = filters || this.filtersSubject.value;
    const parts: string[] = [];

    if (currentFilters.searchTerm.trim()) {
      parts.push(`Search: "${currentFilters.searchTerm.trim()}"`);
    }

    if (currentFilters.statusFilter !== 'all') {
      const statusLabel = currentFilters.statusFilter === 'active' ? 'Active only' : 'Inactive only';
      parts.push(`Status: ${statusLabel}`);
    }

    return parts.length > 0 ? parts.join(', ') : 'No filters applied';
  }
} 