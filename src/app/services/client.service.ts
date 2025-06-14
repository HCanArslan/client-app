import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Client, CreateClientRequest, UpdateClientRequest } from '../models/client.model';

/**
 * ClientService - Handles HTTP operations for client management
 * 
 * This service demonstrates:
 * - RESTful API integration with proper error handling
 * - TypeScript interfaces for type safety
 * - RxJS operators for data transformation
 * - Angular dependency injection patterns
 * - Cross-platform compatibility (browser/server)
 */
@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly baseUrl = 'http://localhost:3000/clients';
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  /**
   * Retrieves all clients from the API
   * @returns Observable<Client[]> - Stream of client data
   */
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves a single client by ID
   * @param id - The client ID to fetch
   * @returns Observable<Client> - Stream of client data
   */
  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Creates a new client
   * @param client - The client data to create
   * @returns Observable<Client> - Stream of created client data
   */
  createClient(client: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(this.baseUrl, client).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Updates an existing client using PUT request
   * @param id - The client ID to update
   * @param client - The updated client data
   * @returns Observable<Client> - Stream of updated client data
   */
  updateClient(id: number, client: UpdateClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/${id}`, client).pipe(
      map((response: Client) => {
        // Log successful operations for debugging and monitoring
        this.logInfo('Client updated successfully', { id, updatedClient: response });
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Deletes a client by ID
   * @param id - The client ID to delete
   * @returns Observable<void> - Stream indicating completion
   */
  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Centralized error handling for HTTP operations
   * Demonstrates proper error handling patterns and user-friendly messaging
   * 
   * @param error - The HTTP error response
   * @returns Observable<never> - Error stream
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred';

    // Check if we're in browser environment and if error is a client-side error
    if (isPlatformBrowser(this.platformId) && error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
      this.logError('Client-side error occurred', error.error);
    } else {
      // Server-side error - provide user-friendly messages based on status codes
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: Invalid client data provided';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please log in to continue';
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission to perform this action';
          break;
        case 404:
          errorMessage = 'Not Found: Client not found';
          break;
        case 409:
          errorMessage = 'Conflict: Client with this email already exists';
          break;
        case 422:
          errorMessage = 'Validation Error: Please check your input data';
          break;
        case 500:
          errorMessage = 'Internal Server Error: Please try again later';
          break;
        default:
          errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
      
      this.logError('Server error occurred', { 
        status: error.status, 
        message: error.message,
        url: error.url 
      });
    }

    this.logError('HTTP operation failed', { 
      errorMessage, 
      originalError: error 
    });
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Structured logging for informational messages
   * @param message - The log message
   * @param context - Additional context data
   */
  private logInfo(message: string, context?: any): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log(`[ClientService] ${message}`, context || '');
    }
  }

  /**
   * Structured logging for error messages
   * @param message - The error message
   * @param context - Additional error context
   */
  private logError(message: string, context?: any): void {
    if (isPlatformBrowser(this.platformId)) {
      console.error(`[ClientService] ${message}`, context || '');
    }
  }
} 