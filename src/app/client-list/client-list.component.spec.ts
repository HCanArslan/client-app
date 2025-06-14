import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ClientListComponent } from './client-list.component';
import { ClientService } from '../services/client.service';
import { ToastService } from '../services/toast.service';
import { Client } from '../models/client.model';

describe('ClientListComponent', () => {
  let component: ClientListComponent;
  let fixture: ComponentFixture<ClientListComponent>;
  let clientService: jasmine.SpyObj<ClientService>;
  let toastService: jasmine.SpyObj<ToastService>;

  // Mock data
  const mockClients: Client[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      company: 'Tech Corp',
      address: '123 Main St',
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1987654321',
      company: 'Design Studio',
      address: '456 Oak Ave',
      status: 'inactive',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@techcorp.com',
      phone: '+1555555555',
      company: 'Tech Corp',
      address: '789 Pine St',
      status: 'active',
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z'
    }
  ];

  beforeEach(async () => {
    // Create spies for services
    const clientServiceSpy = jasmine.createSpyObj('ClientService', [
      'getClients',
      'updateClient',
      'deleteClient'
    ]);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'success',
      'error',
      'info',
      'warning'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ClientListComponent,
        FormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ClientService, useValue: clientServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientListComponent);
    component = fixture.componentInstance;
    clientService = TestBed.inject(ClientService) as jasmine.SpyObj<ClientService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;

    // Setup default service responses
    clientService.getClients.and.returnValue(of(mockClients));
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.clients).toEqual([]);
      expect(component.filteredClients).toEqual([]);
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeNull();
      expect(component.showEditModal).toBeFalse();
      expect(component.showDeleteConfirmation).toBeFalse();
      expect(component.searchTerm).toBe('');
      expect(component.statusFilter).toBe('all');
    });

    it('should load clients on initialization', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(clientService.getClients).toHaveBeenCalled();
      expect(component.clients).toEqual(mockClients);
      expect(component.filteredClients).toEqual(mockClients);
      expect(component.isLoading).toBeFalse();
    });

    it('should handle error when loading clients fails', () => {
      // Arrange
      const errorMessage = 'Failed to load clients';
      clientService.getClients.and.returnValue(throwError(() => new Error(errorMessage)));

      // Act
      component.ngOnInit();

      // Assert
      expect(component.error).toBe(errorMessage);
      expect(component.isLoading).toBeFalse();
      expect(toastService.error).toHaveBeenCalled();
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      component.clients = mockClients;
      component.applyFilters();
    });

    describe('Search Filtering', () => {
      it('should filter clients by name (case-insensitive)', () => {
        // Act
        component.searchTerm = 'john';
        component.applyFilters();

        // Assert
        expect(component.filteredClients.length).toBe(1);
        expect(component.filteredClients[0].name).toBe('John Doe');
      });

      it('should filter clients by email', () => {
        // Act
        component.searchTerm = 'jane.smith';
        component.applyFilters();

        // Assert
        expect(component.filteredClients.length).toBe(1);
        expect(component.filteredClients[0].email).toBe('jane.smith@example.com');
      });

      it('should filter clients by company', () => {
        // Act
        component.searchTerm = 'tech corp';
        component.applyFilters();

        // Assert
        expect(component.filteredClients.length).toBe(2);
        expect(component.filteredClients.every(c => 
          c.company?.toLowerCase().includes('tech corp')
        )).toBeTruthy();
      });

      it('should return all clients when search term is empty', () => {
        // Act
        component.searchTerm = '';
        component.applyFilters();

        // Assert
        expect(component.filteredClients.length).toBe(3);
        expect(component.filteredClients).toEqual(mockClients);
      });

      it('should return empty array when no clients match search term', () => {
        // Act
        component.searchTerm = 'nonexistent';
        component.applyFilters();

        // Assert
        expect(component.filteredClients.length).toBe(0);
      });
    });

    describe('Status Filtering', () => {
      it('should filter active clients only', () => {
        // Act
        component.statusFilter = 'active';
        component.applyFilters();

        // Assert
        expect(component.filteredClients.length).toBe(2);
        expect(component.filteredClients.every(c => c.status === 'active')).toBeTruthy();
      });

      it('should filter inactive clients only', () => {
        // Act
        component.statusFilter = 'inactive';
        component.applyFilters();

        // Assert
        expect(component.filteredClients.length).toBe(1);
        expect(component.filteredClients.every(c => c.status === 'inactive')).toBeTruthy();
      });

      it('should show all clients when status filter is "all"', () => {
        // Act
        component.statusFilter = 'all';
        component.applyFilters();

        // Assert
        expect(component.filteredClients.length).toBe(3);
        expect(component.filteredClients).toEqual(mockClients);
      });
    });

    describe('Combined Filtering', () => {
      it('should apply both search and status filters', () => {
        // Act
        component.searchTerm = 'tech corp';
        component.statusFilter = 'active';
        component.applyFilters();

        // Assert
        expect(component.filteredClients.length).toBe(2);
        expect(component.filteredClients.every(c => 
          c.status === 'active' && c.company?.toLowerCase().includes('tech corp')
        )).toBeTruthy();
      });

      it('should handle search change events', () => {
        // Arrange
        const event = { target: { value: 'john' } } as any;
        spyOn(component, 'applyFilters');

        // Act
        component.onSearchChange(event);

        // Assert
        expect(component.searchTerm).toBe('john');
        expect(component.applyFilters).toHaveBeenCalled();
      });

      it('should handle status filter change events', () => {
        // Arrange
        const event = { target: { value: 'active' } } as any;
        spyOn(component, 'applyFilters');

        // Act
        component.onStatusFilterChange(event);

        // Assert
        expect(component.statusFilter).toBe('active');
        expect(component.applyFilters).toHaveBeenCalled();
      });

      it('should clear all filters', () => {
        // Arrange
        component.searchTerm = 'test';
        component.statusFilter = 'active';
        spyOn(component, 'applyFilters');

        // Act
        component.clearFilters();

        // Assert
        expect(component.searchTerm).toBe('');
        expect(component.statusFilter).toBe('all');
        expect(component.applyFilters).toHaveBeenCalled();
        expect(toastService.info).toHaveBeenCalled();
      });
    });
  });

  describe('Client Operations', () => {
    beforeEach(() => {
      component.clients = mockClients;
    });

    it('should open edit modal for a client', () => {
      // Act
      component.editClient(mockClients[0]);

      // Assert
      expect(component.editingClient).toEqual(mockClients[0]);
      expect(component.showEditModal).toBeTruthy();
    });

    it('should handle client update', () => {
      // Arrange
      const updatedClient = { ...mockClients[0], name: 'Updated Name' };
      component.clients = [...mockClients];
      spyOn(component, 'applyFilters');

      // Act
      component.onClientUpdated(updatedClient);

      // Assert
      expect(component.clients[0].name).toBe('Updated Name');
      expect(component.applyFilters).toHaveBeenCalled();
      expect(toastService.success).toHaveBeenCalled();
    });

    it('should close edit modal', () => {
      // Arrange
      component.showEditModal = true;
      component.editingClient = mockClients[0];

      // Act
      component.closeEditModal();

      // Assert
      expect(component.showEditModal).toBeFalsy();
      expect(component.editingClient).toBeNull();
    });

    it('should open delete confirmation dialog', () => {
      // Act
      component.deleteClient(mockClients[0]);

      // Assert
      expect(component.clientToDelete).toEqual(mockClients[0]);
      expect(component.showDeleteConfirmation).toBeTruthy();
    });

    it('should confirm and delete client successfully', () => {
      // Arrange
      component.clientToDelete = mockClients[0];
      component.clients = [...mockClients];
      clientService.deleteClient.and.returnValue(of(void 0));
      spyOn(component, 'applyFilters');

      // Act
      component.confirmDelete();

      // Assert
      expect(clientService.deleteClient).toHaveBeenCalledWith(1);
      expect(component.clients.length).toBe(2);
      expect(component.applyFilters).toHaveBeenCalled();
      expect(component.showDeleteConfirmation).toBeFalsy();
      expect(toastService.success).toHaveBeenCalled();
    });

    it('should handle delete error', () => {
      // Arrange
      component.clientToDelete = mockClients[0];
      const errorMessage = 'Delete failed';
      clientService.deleteClient.and.returnValue(throwError(() => new Error(errorMessage)));

      // Act
      component.confirmDelete();

      // Assert
      expect(toastService.error).toHaveBeenCalled();
    });

    it('should cancel delete operation', () => {
      // Arrange
      component.showDeleteConfirmation = true;
      component.clientToDelete = mockClients[0];

      // Act
      component.cancelDelete();

      // Assert
      expect(component.showDeleteConfirmation).toBeFalsy();
      expect(component.clientToDelete).toBeNull();
    });
  });

  describe('Utility Methods', () => {
    it('should track clients by ID', () => {
      // Act
      const result = component.trackByClientId(0, mockClients[0]);

      // Assert
      expect(result).toBe(1);
    });

    it('should provide filter summary', () => {
      // Arrange
      component.clients = mockClients;
      component.filteredClients = [mockClients[0]];

      // Act
      const summary = component.getFilterSummary();

      // Assert
      expect(summary).toContain('1 of 3');
    });

    it('should detect active filters', () => {
      // Test no active filters
      component.searchTerm = '';
      component.statusFilter = 'all';
      expect(component.hasActiveFilters()).toBeFalsy();

      // Test with search term
      component.searchTerm = 'test';
      expect(component.hasActiveFilters()).toBeTruthy();

      // Test with status filter
      component.searchTerm = '';
      component.statusFilter = 'active';
      expect(component.hasActiveFilters()).toBeTruthy();
    });

    it('should refresh clients', () => {
      // Arrange
      spyOn(component, 'loadClients');

      // Act
      component.refreshClients();

      // Assert
      expect(component.loadClients).toHaveBeenCalled();
      expect(toastService.info).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should cleanup subscriptions on destroy', () => {
      // Arrange
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      // Act
      component.ngOnDestroy();

      // Assert
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
}); 