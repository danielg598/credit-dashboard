import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { CreditFormComponent } from './features/credit-form/credit-form.component';
import { AccountsListComponent } from './features/accounts-list/accounts-list.component';
import { CreditResponse } from './core/models/credit-response.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    NzTabsModule,
    NzIconModule,
    CreditFormComponent,
    AccountsListComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  result = signal<CreditResponse | null>(null);
  error = signal<string | null>(null);
  selectedTab = signal(0); // 0 = Evaluar, 1 = Cuentas

  onEvaluated(resp: CreditResponse): void {
    this.result.set(resp);
    this.error.set(null);
  }

  onFailed(err: string): void {
    this.error.set(err);
    this.result.set(null);
  }
}