import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, EMPTY } from 'rxjs';
import { catchError, finalize, tap, map } from 'rxjs/operators';
import { Client, UpdateClientRequest } from '../models/client.model';
import { ClientService } from './client.service';
import { ToastService } from './toast.service';

export interface ClientState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  selectedClientId: number | null;
  lastUpdated: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClientStateService {
  private readonly stateSubject = new BehaviorSubject<ClientState>({
    clients: [],
    isLoading: false,
    error: null,
    selectedClientId: null,
    lastUpdated: null
  });

  // Public observables
  readonly state$ = this.stateSubject.asObservable();
  readonly clients$ = this.state$.pipe(map(state => state.clients));
  readonly isLoading$ = this.state$.pipe(map(state => state.isLoading));
  readonly error$ = this.state$.pipe(map(state => state.error));
  readonly selectedClientId$ = this.state$.pipe(map(state => state.selectedClientId));

  // Computed observables
  readonly selectedClient$ = this.state$.pipe(
    map(state => {
      if (!state.selectedClientId) return null;
      return state.clients.find(client => client.id === state.selectedClientId) || null;
    })
  );

  readonly clientCount$ = this.clients$.pipe(
    map(clients => ({
      total: clients.length,
      active: clients.filter(c => c.status === 'active').length,
      inactive: clients.filter(c => c.status === 'inactive').length
    }))
  );

  private clientService = inject(ClientService);
  private toastService = inject(ToastService);

  /**
   * Load all clients from the API
   */
  loadClients(): Observable<Client[]> {
    this.updateState({ isLoading: true, error: null });

    return this.clientService.getClients().pipe(
      tap(clients => {
        this.updateState({ 
          clients, 
          isLoading: false,
          error: null,
          lastUpdated: new Date()
        });
        console.log('✅ Clients loaded successfully:', clients.length);
      }),
      catchError(error => {
        this.updateState({ 
          isLoading: false, 
          error: error.message 
        });
        this.toastService.error('Error', 'Failed to load clients');
        console.error('❌ Failed to load clients:', error);
        return EMPTY;
      })
    );
  }

  /**
   * Update an existing client
   */
  updateClient(id: number, updates: UpdateClientRequest): Observable<Client> {
    const currentState = this.stateSubject.value;
    const clientIndex = currentState.clients.findIndex(c => c.id === id);
    
    if (clientIndex === -1) {
      throw new Error(`Client with ID ${id} not found`);
    }

    return this.clientService.updateClient(id, updates).pipe(
      tap(updatedClient => {
        const updatedClients = [...currentState.clients];
        updatedClients[clientIndex] = updatedClient;
        
        this.updateState({ 
          clients: updatedClients,
          lastUpdated: new Date()
        });
        
        this.toastService.success('Success', 'Client updated successfully');
        console.log('✅ Client updated successfully:', updatedClient);
      }),
      catchError(error => {
        this.toastService.error('Error', `Failed to update client: ${error.message}`);
        console.error('❌ Failed to update client:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a client
   */
  deleteClient(id: number): Observable<void> {
    const currentState = this.stateSubject.value;
    const clientToDelete = currentState.clients.find(c => c.id === id);
    
    if (!clientToDelete) {
      throw new Error(`Client with ID ${id} not found`);
    }

    return this.clientService.deleteClient(id).pipe(
      tap(() => {
        const updatedClients = currentState.clients.filter(client => client.id !== id);
        this.updateState({ 
          clients: updatedClients,
          lastUpdated: new Date()
        });
        
        this.toastService.success('Success', `Client "${clientToDelete.name}" deleted successfully`);
        console.log('✅ Client deleted successfully:', clientToDelete.name);
      }),
      catchError(error => {
        this.toastService.error('Error', `Failed to delete client: ${error.message}`);
        console.error('❌ Failed to delete client:', error);
        throw error;
      })
    );
  }

  /**
   * Add a new client to the state (after creation)
   */
  addClient(newClient: Client): void {
    const currentState = this.stateSubject.value;
    const updatedClients = [...currentState.clients, newClient];
    
    this.updateState({ 
      clients: updatedClients,
      lastUpdated: new Date()
    });
    
    console.log('✅ Client added to state:', newClient);
  }

  /**
   * Select a client by ID
   */
  selectClient(id: number | null): void {
    this.updateState({ selectedClientId: id });
    console.log('📝 Client selected:', id);
  }

  /**
   * Clear any error state
   */
  clearError(): void {
    this.updateState({ error: null });
  }

  /**
   * Get a client by ID from current state
   */
  getClientById(id: number): Client | null {
    const currentState = this.stateSubject.value;
    return currentState.clients.find(client => client.id === id) || null;
  }

  /**
   * Check if clients need to be refreshed (based on last update time)
   */
  shouldRefreshClients(maxAgeMinutes: number = 5): boolean {
    const currentState = this.stateSubject.value;
    if (!currentState.lastUpdated) return true;
    
    const ageInMinutes = (Date.now() - currentState.lastUpdated.getTime()) / (1000 * 60);
    return ageInMinutes > maxAgeMinutes;
  }

  /**
   * Refresh clients if they're stale
   */
  refreshIfStale(maxAgeMinutes: number = 5): Observable<Client[]> | null {
    if (this.shouldRefreshClients(maxAgeMinutes)) {
      return this.loadClients();
    }
    return null;
  }

  /**
   * Get current state snapshot
   */
  getCurrentState(): ClientState {
    return this.stateSubject.value;
  }

  /**
   * Update the state with partial updates
   */
  private updateState(partialState: Partial<ClientState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  /**
   * Reset state to initial values
   */
  resetState(): void {
    this.stateSubject.next({
      clients: [],
      isLoading: false,
      error: null,
      selectedClientId: null,
      lastUpdated: null
    });
    console.log('🔄 Client state reset');
  }
} 