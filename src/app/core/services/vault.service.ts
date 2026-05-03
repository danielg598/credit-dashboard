import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Account, ListAccountsResponse } from '../models/account.model';

/**
 * Cliente del Vault Core (mock local en desarrollo, Thought Machine real
 * cuando se tenga VPN + token productivo).
 *
 * Además de los métodos HTTP, expone un Subject 'accountCreated$' que
 * otros componentes pueden escuchar para reaccionar cuando se crea una
 * cuenta nueva (ej: refrescar la tabla de cuentas sin polling).
 */
@Injectable({ providedIn: 'root' })
export class VaultService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.vaultUrl}/v1`;

  /**
   * Canal de eventos: cada vez que se crea una cuenta nueva,
   * quien llame a notifyAccountCreated() emite el accountId,
   * y todos los componentes suscritos se enteran.
   */
  private accountCreatedSubject = new Subject<string>();
  accountCreated$ = this.accountCreatedSubject.asObservable();

  notifyAccountCreated(accountId: string): void {
    this.accountCreatedSubject.next(accountId);
  }

  /** Lista todas las cuentas. */
  listAccounts(): Observable<ListAccountsResponse> {
    return this.http
      .get<ListAccountsResponse>(`${this.baseUrl}/accounts`)
      .pipe(catchError(this.handleError));
  }

  /** Consulta una cuenta por ID. */
  getAccount(accountId: string): Observable<Account> {
    return this.http
      .get<Account>(`${this.baseUrl}/accounts/${accountId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let userMessage = 'Error al consultar Vault.';
    if (error.status === 0) {
      userMessage = 'Vault no responde. Verifique el microservicio en puerto 9000.';
    } else if (error.status === 401) {
      userMessage = 'Token de autenticación inválido.';
    } else if (error.status === 404) {
      userMessage = 'Recurso no encontrado en Vault.';
    }
    console.error('[VaultService]', error);
    return throwError(() => new Error(userMessage));
  }
}