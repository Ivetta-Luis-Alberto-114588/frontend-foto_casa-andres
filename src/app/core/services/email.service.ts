import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { EmailTemplate, SearchResultEmail } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = `${environment.apiUrl}/api/email`;

  constructor(private http: HttpClient) { }

  sendSearchResult(to: string, result: SearchResultEmail): Observable<boolean> {
    const email = this.createEmailTemplate(to, result);
    return this.sendEmail(email);
  }

  private createEmailTemplate(to: string, result: SearchResultEmail): EmailTemplate {
    const subject = result.searchTerm
      ? `Resultados de búsqueda: ${result.searchTerm}`
      : `Contenido extraído de: ${result.url}`;

    const contentSection = result.contentHtml
      ? result.contentHtml
      : `<p>${result.content}</p>`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8f9fa; padding: 20px; margin: 20px 0; }
            .footer { text-align: center; color: #6c757d; font-size: 12px; padding: 20px; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #495057; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Resultados de Búsqueda Web</h1>
            </div>
            <div class="content">
              <div class="info-row">
                <span class="label">URL original:</span> <a href="${result.url}">${result.url}</a>
              </div>
              ${result.finalUrl && result.finalUrl !== result.url ? `<div class="info-row">
                <span class="label">URL con filtros aplicados:</span> <a href="${result.finalUrl}">${result.finalUrl}</a>
              </div>` : ''}
              ${result.searchTerm ? `<div class="info-row">
                <span class="label">Término de búsqueda:</span> ${result.searchTerm}
              </div>` : ''}
              <div class="info-row">
                <span class="label">Fecha:</span> ${new Date(result.executedAt).toLocaleString('es-ES')}
              </div>
              <hr>
              <h3>Descripción</h3>
              <p>${result.description}</p>
              <h3>Resultados</h3>
              ${contentSection}
            </div>
            <div class="footer">
              <p>Este es un correo automático generado por el sistema de búsqueda web.</p>
              <p>Enviado el ${new Date().toLocaleString('es-ES')}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const finalUrlText = result.finalUrl && result.finalUrl !== result.url ? `\nURL con filtros: ${result.finalUrl}` : '';
    const body = `
Resultados de Búsqueda Web
========================

URL original: ${result.url}${finalUrlText}${result.searchTerm ? `\nTérmino de búsqueda: ${result.searchTerm}` : ''}
Fecha: ${new Date(result.executedAt).toLocaleString('es-ES')}

Descripción:
${result.description}

Contenido:
${result.content}

---
Este es un correo automático generado por el sistema de búsqueda web.
Enviado el ${new Date().toLocaleString('es-ES')}
    `;

    return {
      to,
      subject,
      body,
      html
    };
  }

  private sendEmail(email: EmailTemplate): Observable<boolean> {
    // Implementación real llamando al backend Python/Flask
    console.log('Enviando email a backend:', email.to);
    return this.http.post<{success: boolean}>(this.apiUrl, email).pipe(
      map(response => response.success),
      catchError(error => {
        console.error('Error enviando email:', error);
        return of(false);
      })
    );
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
