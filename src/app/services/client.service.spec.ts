import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { ClientService } from './client.service';
import { Client, CreateClientRequest, UpdateClientRequest } from '../models/client.model';

describe('ClientService', () => {
  let service: ClientService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:3000/clients';

  // Mock data
  const mockClient: Client = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    company: 'Tech Corp',
    address: '123 Main St',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockClients: Client[] = [
    mockClient,
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
    }
  ];

  const mockCreateRequest: CreateClientRequest = {
    name: 'New Client',
    email: 'new@example.com',
    phone: '+1111111111',
    company: 'New Company',
    address: '789 Pine St',
    status: 'active'
  };

  const mockUpdateRequest: UpdateClientRequest = {
    id: 1,
    name: 'Updated Client',
    email: 'updated@example.com',
    phone: '+2222222222',
    company: 'Updated Company',
    address: '321 Elm St',
    status: 'inactive'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClientService]
    });

    service = TestBed.inject(ClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getClients()', () => {
    it('should fetch all clients successfully', () => {
      // Act
      service.getClients().subscribe(clients => {
        // Assert
        expect(clients).toEqual(mockClients);
        expect(clients.length).toBe(2);
        expect(clients[0].name).toBe('John Doe');
        expect(clients[1].name).toBe('Jane Smith');
      });

      // Assert HTTP request
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush(mockClients);
    });

    it('should handle 404 error when fetching clients', () => {
      // Arrange
      const consoleSpy = spyOn(console, 'error');

      // Act
      service.getClients().subscribe({
        next: () => fail('Should have failed with 404 error'),
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe('Not Found: Client not found');
        }
      });

      // Assert HTTP request and error response
      const req = httpMock.expectOne(baseUrl);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(consoleSpy).toHaveBeenCalledWith('❌ Client Service Error:', jasmine.any(HttpErrorResponse));
    });

    it('should handle 500 server error when fetching clients', () => {
      // Act
      service.getClients().subscribe({
        next: () => fail('Should have failed with 500 error'),
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe('Internal Server Error: Please try again later');
        }
      });

      // Assert HTTP request and error response
      const req = httpMock.expectOne(baseUrl);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error when fetching clients', () => {
      // Act
      service.getClients().subscribe({
        next: () => fail('Should have failed with network error'),
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe('Client Error: Network error');
        }
      });

      // Assert HTTP request and error response
      const req = httpMock.expectOne(baseUrl);
      req.error(new ProgressEvent('Network error'));
    });
  });

  describe('getClient()', () => {
    it('should fetch client by ID successfully', () => {
      // Arrange
      const clientId = 1;

      // Act
      service.getClient(clientId).subscribe((client: Client) => {
        // Assert
        expect(client).toEqual(mockClient);
        expect(client.id).toBe(clientId);
        expect(client.name).toBe('John Doe');
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`${baseUrl}/${clientId}`);
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush(mockClient);
    });

    it('should handle 404 error when client not found', () => {
      // Arrange
      const clientId = 999;

      // Act
      service.getClient(clientId).subscribe({
        next: () => fail('Should have failed with 404 error'),
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe('Not Found: Client not found');
        }
      });

      // Assert HTTP request and error response
      const req = httpMock.expectOne(`${baseUrl}/${clientId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createClient()', () => {
    it('should create client successfully', () => {
      // Arrange
      const newClient = { ...mockClient, id: 3 };

      // Act
      service.createClient(mockCreateRequest).subscribe(client => {
        // Assert
        expect(client).toEqual(newClient);
        expect(client.name).toBe(mockCreateRequest.name);
        expect(client.email).toBe(mockCreateRequest.email);
      });

      // Assert HTTP request
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCreateRequest);

      // Respond with mock data
      req.flush(newClient);
    });

    it('should handle 400 validation error when creating client', () => {
      // Act
      service.createClient(mockCreateRequest).subscribe({
        next: () => fail('Should have failed with 400 error'),
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe('Bad Request: Invalid client data provided');
        }
      });

      // Assert HTTP request and error response
      const req = httpMock.expectOne(baseUrl);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 409 conflict error when creating client', () => {
      // Act
      service.createClient(mockCreateRequest).subscribe({
        next: () => fail('Should have failed with 409 error'),
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe('Conflict: Client with this email already exists');
        }
      });

      // Assert HTTP request and error response
      const req = httpMock.expectOne(baseUrl);
      req.flush('Conflict', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('updateClient()', () => {
    it('should update client successfully', () => {
      // Arrange
      const clientId = 1;
      const updatedClient = { ...mockClient, ...mockUpdateRequest };
      const consoleSpy = spyOn(console, 'log');

      // Act
      service.updateClient(clientId, mockUpdateRequest).subscribe(client => {
        // Assert
        expect(client).toEqual(updatedClient);
        expect(client.name).toBe(mockUpdateRequest.name);
        expect(client.email).toBe(mockUpdateRequest.email);
        expect(client.status).toBe(mockUpdateRequest.status);
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`${baseUrl}/${clientId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockUpdateRequest);

      // Respond with mock data
      req.flush(updatedClient);

      expect(consoleSpy).toHaveBeenCalledWith('✅ Client updated successfully:', updatedClient);
    });

    it('should handle 404 error when updating non-existent client', () => {
      // Arrange
      const clientId = 999;

      // Act
      service.updateClient(clientId, mockUpdateRequest).subscribe({
        next: () => fail('Should have failed with 404 error'),
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe('Not Found: Client not found');
        }
      });

      // Assert HTTP request and error response
      const req = httpMock.expectOne(`${baseUrl}/${clientId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 422 validation error when updating client', () => {
      // Arrange
      const clientId = 1;

      // Act
      service.updateClient(clientId, mockUpdateRequest).subscribe({
        next: () => fail('Should have failed with 422 error'),
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe('Validation Error: Please check your input data');
        }
      });

      // Assert HTTP request and error response
      const req = httpMock.expectOne(`${baseUrl}/${clientId}`);
      req.flush('Unprocessable Entity', { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('deleteClient()', () => {
    it('should delete client successfully', () => {
      // Arrange
      const clientId = 1;

      // Act
      service.deleteClient(clientId).subscribe(response => {
        // Assert
        expect(response).toBeUndefined(); // DELETE returns void
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`${baseUrl}/${clientId}`);
      expect(req.request.method).toBe('DELETE');

      // Respond with success (no content)
      req.flush(null);
    });

    it('should handle 404 error when deleting non-existent client', () => {
      // Arrange
      const clientId = 999;

      // Act
      service.deleteClient(clientId).subscribe({
        next: () => fail('Should have failed with 404 error'),
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe('Not Found: Client not found');
        }
      });

      // Assert HTTP request and error response
      const req = httpMock.expectOne(`${baseUrl}/${clientId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 403 forbidden error when deleting client', () => {
      // Arrange
      const clientId = 1;

      // Act
      service.deleteClient(clientId).subscribe({
        next: () => fail('Should have failed with 403 error'),
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe('Forbidden: You do not have permission to perform this action');
        }
      });

      // Assert HTTP request and error response
      const req = httpMock.expectOne(`${baseUrl}/${clientId}`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 unauthorized error', () => {
      // Act
      service.getClients().subscribe({
        next: () => fail('Should have failed with 401 error'),
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe('Unauthorized: Please log in to continue');
        }
      });

      // Assert HTTP request and error response
      const req = httpMock.expectOne(baseUrl);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle unknown HTTP error status', () => {
      // Act
      service.getClients().subscribe({
        next: () => fail('Should have failed with unknown error'),
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe("Server Error: 418 - Http failure response for http://localhost:3000/clients: 418 I'm a teapot");
        }
      });

      // Assert HTTP request and error response
      const req = httpMock.expectOne(baseUrl);
      req.flush('Unknown Error', { status: 418, statusText: "I'm a teapot" });
    });
  });
}); 