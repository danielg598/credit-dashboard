import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { VaultService } from '../../core/services/vault.service';
import { Account } from '../../core/models/account.model';

/**
 * Lista de cuentas de préstamo creadas en Vault.
 *
 * Se alimenta de dos fuentes:
 *  1) Al iniciar, hace una carga inicial vía GET /v1/accounts
 *  2) Se suscribe al Subject accountCreated$ del VaultService y se refresca
 *     automáticamente cada vez que se aprueba una solicitud nueva.
 *
 * Usa takeUntil(destroy$) para limpiar la suscripción al destruirse
 * el componente (evita memory leaks y es el estándar moderno de Angular).
 */
@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSpinModule,
  ],
  templateUrl: './accounts-list.component.html',
  styleUrl: './accounts-list.component.scss',
})
export class AccountsListComponent implements OnInit, OnDestroy {
  private vault = inject(VaultService);
  private destroy$ = new Subject<void>();

  // --- Estado ---
  accounts = signal<Account[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // Carga inicial
    this.loadAccounts();

    // Escucha eventos de nueva cuenta creada → refresca la tabla
    this.vault.accountCreated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadAccounts());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Refresco manual. También lo llama el constructor y el Subject. */
  loadAccounts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.vault.listAccounts().subscribe({
      next: (resp) => {
        this.loading.set(false);
        // Orden inverso: las cuentas más nuevas (por timestamp en el ID) primero
        const sorted = [...resp.accounts].sort((a, b) => b.id.localeCompare(a.id));
        this.accounts.set(sorted);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message);
      },
    });
  }

  // --- Helpers para el template ---

  /** Devuelve el color del tag según el estado de la cuenta. */
  tagColor(status: string): string {
    switch (status) {
      case 'ACCOUNT_STATUS_PENDING': return 'gold';
      case 'ACCOUNT_STATUS_OPEN':    return 'green';
      case 'ACCOUNT_STATUS_CLOSED':  return 'default';
      default:                        return 'blue';
    }
  }

  /** Texto legible del estado. */
  statusLabel(status: string): string {
    switch (status) {
      case 'ACCOUNT_STATUS_PENDING': return 'Pendiente';
      case 'ACCOUNT_STATUS_OPEN':    return 'Activa';
      case 'ACCOUNT_STATUS_CLOSED':  return 'Cerrada';
      default:                        return status;
    }
  }

  /** Helpers para leer instance_param_vals sin romper el template si falta la clave. */
  getParam(acc: Account, key: string): string {
    return acc.instance_param_vals?.[key] ?? '—';
  }

  /** Monto como número (para pipe currency). */
  getPrincipal(acc: Account): number {
    return Number(acc.instance_param_vals?.['principal'] ?? 0);
  }

  /** Tasa como número 0-1 (para pipe percent). */
  getRate(acc: Account): number {
    return Number(acc.instance_param_vals?.['annual_interest_rate'] ?? 0);
  }
}