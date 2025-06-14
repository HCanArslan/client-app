import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Client, CreateClientRequest, UpdateClientRequest } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class MockClientService {
  private clients: Client[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      company: 'Acme Corp',
      address: '123 Main St, Anytown, USA',
      status: 'active',
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-01-15').toISOString()
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-987-6543',
      company: 'Tech Solutions Inc',
      address: '456 Oak Ave, Somewhere, USA',
      status: 'active',
      createdAt: new Date('2024-01-20').toISOString(),
      updatedAt: new Date('2024-01-20').toISOString()
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '+1-555-456-7890',
      company: 'Global Industries',
      address: '789 Pine Rd, Elsewhere, USA',
      status: 'inactive',
      createdAt: new Date('2024-01-10').toISOString(),
      updatedAt: new Date('2024-01-25').toISOString()
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      phone: '+1-555-789-0123',
      company: 'Startup Ventures',
      address: '321 Elm St, Nowhere, USA',
      status: 'active',
      createdAt: new Date('2024-02-01').toISOString(),
      updatedAt: new Date('2024-02-01').toISOString()
    }
  ];

  private nextId = 5;

  /**
   * Get all clients
   */
  getClients(): Observable<Client[]> {
    return of([...this.clients]).pipe(delay(500)); // Simulate network delay
  }

  /**
   * Get a single client by ID
   */
  getClient(id: number): Observable<Client> {
    const client = this.clients.find(c => c.id === id);
    if (client) {
      return of({ ...client }).pipe(delay(300));
    } else {
      return throwError(() => new Error('Client not found'));
    }
  }

  /**
   * Create a new client
   */
  createClient(clientData: CreateClientRequest): Observable<Client> {
    const newClient: Client = {
      id: this.nextId++,
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.clients.push(newClient);
    return of({ ...newClient }).pipe(delay(400));
  }

  /**
   * Update an existing client
   */
  updateClient(id: number, clientData: UpdateClientRequest): Observable<Client> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index !== -1) {
      const updatedClient: Client = {
        ...this.clients[index],
        ...clientData,
        updatedAt: new Date().toISOString()
      };
      
      this.clients[index] = updatedClient;
      return of({ ...updatedClient }).pipe(delay(400));
    } else {
      return throwError(() => new Error('Client not found'));
    }
  }

  /**
   * Delete a client
   */
  deleteClient(id: number): Observable<void> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index !== -1) {
      this.clients.splice(index, 1);
      return of(undefined).pipe(delay(300));
    } else {
      return throwError(() => new Error('Client not found'));
    }
  }
} 