import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { CreditRequest } from '../models/credit-request.model';
import { CreditResponse } from '../models/credit-response.model';

/**
 * Cliente del orquestador Spring Boot.
 *
 * Responsable de:
 *  - Llamar a POST /api/v1/credit/evaluate
 *  - Transformar errores HTTP en errores del dominio con mensajes en español
 *
 * La UI NUNCA debe hablar directo con HttpClient — siempre pasa por aquí,
 * así si cambiamos el endpoint, la autenticación o el formato, es un
 * solo archivo que modificar.
 */
@Injectable({ providedIn: 'root' })
export class CreditService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.orchestratorUrl}/api/v1/credit`;

  /**
   * Evalúa una solicitud de crédito.
   * @returns Observable con la decisión (APROBADO/RECHAZADO/REVISION_MANUAL)
   *          o con un error descriptivo en español si algo falla.
   */
  evaluate(request: CreditRequest): Observable<CreditResponse> {
    return this.http
      .post<CreditResponse>(`${this.baseUrl}/evaluate`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Health check del orquestador. Útil para el indicador de estado del header.
   */
  healthCheck(): Observable<string> {
    return this.http
      .get(`${this.baseUrl}/health`, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let userMessage = 'Error inesperado al comunicarse con el servicio.';

    if (error.status === 0) {
      userMessage = 'No se pudo conectar al orquestador. Verifique que el servicio esté activo.';
    } else if (error.status === 400 && error.error?.errores) {
      // ProblemDetail RFC 7807 del GlobalExceptionHandler de Spring Boot
      const campos = error.error.errores
        .map((e: { campo: string; mensaje: string }) => `${e.campo}: ${e.mensaje}`)
        .join(', ');
      userMessage = `Datos inválidos → ${campos}`;
    } else if (error.status === 503) {
      userMessage = 'Servicio temporalmente no disponible. Intente de nuevo en unos segundos.';
    } else if (error.error?.detail) {
      userMessage = error.error.detail;
    }

    console.error('[CreditService]', error);
    return throwError(() => new Error(userMessage));
  }
}