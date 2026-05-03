import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { CreditService } from '../../core/services/credit.service';
import { VaultService } from '../../core/services/vault.service';
import { CreditResponse } from '../../core/models/credit-response.model';
import {
  HistorialCrediticio,
  PropositoPrestamo,
  HISTORIAL_LABELS,
  PROPOSITO_LABELS,
} from '../../core/models/credit-request.model';



@Component({
  selector: 'app-credit-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzAlertModule,
  ],
  templateUrl: './credit-form.component.html',
  styleUrl: './credit-form.component.scss'
})
export class CreditFormComponent {
  // --- Servicios inyectados ---
  private fb = inject(FormBuilder);
  private creditService = inject(CreditService);
  private vaultService = inject(VaultService);

  // --- Signals de estado ---
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // --- Output al componente padre ---
  @Output() evaluated = new EventEmitter<CreditResponse>();
  @Output() failed = new EventEmitter<string>();

  // --- Opciones de los dropdowns ---
  historialOptions = Object.entries(HISTORIAL_LABELS).map(([value, label]) => ({
    value: value as HistorialCrediticio,
    label,
  }));

  propositoOptions = Object.entries(PROPOSITO_LABELS).map(([value, label]) => ({
    value: value as PropositoPrestamo,
    label,
  }));

  // --- Formulario reactivo ---
  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    cedula: ['', [Validators.required, Validators.pattern(/^\d{6,10}$/)]],
    edad: [30, [Validators.required, Validators.min(18), Validators.max(75)]],
    ingresosMensuales: [
      3000000,
      [Validators.required, Validators.min(1_000_000)],
    ],
    montoSolicitado: [
      10_000_000,
      [Validators.required, Validators.min(500_000), Validators.max(100_000_000)],
    ],
    plazoMeses: [36, [Validators.required, Validators.min(6), Validators.max(120)]],
    historialCrediticio: <HistorialCrediticio | null>null,
    propositoPrestamo: <PropositoPrestamo | null>null,
  });

  constructor() {
    // Validadores condicionales para los dropdowns (nonNullable.group no
    // funciona bien con null inicial, así que los marcamos required aquí).
    this.form.controls.historialCrediticio.addValidators(Validators.required);
    this.form.controls.propositoPrestamo.addValidators(Validators.required);
  }

  /**
   * Pre-llena el formulario con un caso típico para facilitar la demo del pitch.
   * Se llama desde un botón "Cargar ejemplo" en el template.
   */
  cargarEjemplo(tipo: 'aprobable' | 'rechazable'): void {
    if (tipo === 'aprobable') {
      this.form.patchValue({
        nombre: 'María Pérez',
        cedula: '1023456789',
        edad: 32,
        ingresosMensuales: 4_500_000,
        montoSolicitado: 20_000_000,
        plazoMeses: 36,
        historialCrediticio: 'BUENO',
        propositoPrestamo: 'VEHICULO',
      });
    } else {
      this.form.patchValue({
        nombre: 'Carlos Testeo',
        cedula: '8888888888',
        edad: 22,
        ingresosMensuales: 1_500_000,
        montoSolicitado: 50_000_000,
        plazoMeses: 24,
        historialCrediticio: 'MALO',
        propositoPrestamo: 'CONSUMO',
      });
    }
  }

  formatterCurrency = (value: number): string =>
    value == null ? '' : `$ ${value.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

  parserCurrency = (value: string): string => value.replace(/\$\s?|\./g, '');

  /**
   * Envía el formulario al backend.
   * Si hay errores de validación, marca todos los campos como tocados
   * para que se muestren los mensajes de error.
   */
  onSubmit(): void {
    // Validación: si hay errores, mostrarlos
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      this.errorMessage.set('Por favor completa los campos marcados en rojo.');
      return;
    }

    // Limpiamos estado previo
    this.loading.set(true);
    this.errorMessage.set(null);

    // getRawValue() devuelve el objeto con tipos no-null por el nonNullable.group
    const payload = this.form.getRawValue() as {
      nombre: string;
      cedula: string;
      edad: number;
      ingresosMensuales: number;
      montoSolicitado: number;
      plazoMeses: number;
      historialCrediticio: HistorialCrediticio;
      propositoPrestamo: PropositoPrestamo;
    };

    this.creditService.evaluate(payload).subscribe({
      next: (resp) => {
        this.loading.set(false);
        this.evaluated.emit(resp);
        if (resp.vaultAccountId) {
          this.vaultService.notifyAccountCreated(resp.vaultAccountId);
        }
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMessage.set(err.message);
        this.failed.emit(err.message);
      },
    });
  }
}
