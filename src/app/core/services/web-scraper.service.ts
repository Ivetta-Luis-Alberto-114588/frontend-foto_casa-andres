import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ScrapeRequest {
  url: string;
  searchTerm?: string;
  priceMax?: number;
  browser?: 'chromium' | 'brave';
}

export interface ScrapeResult {
  success: boolean;
  content: string;
  contentHtml?: string;
  description: string;
  finalUrl?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebScraperService {
  private apiUrl = `${environment.apiUrl}/api/scrape`;

  constructor(private http: HttpClient) { }

  scrapeWebsite(request: ScrapeRequest): Observable<ScrapeResult> {
    // Implementación real llamando al backend Python/Flask
    return this.http.post<ScrapeResult>(this.apiUrl, request).pipe(
      catchError(error => {
        console.error('Error en scraping:', error);
        return of({
          success: false,
          content: '',
          description: '',
          error: error.message || 'Error de conexión con el backend'
        });
      })
    );
  }

  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
