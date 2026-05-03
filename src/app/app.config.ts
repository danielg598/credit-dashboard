import { ApplicationConfig, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import localeEsCoExtra from '@angular/common/locales/extra/es-CO';

import { provideNzI18n, es_ES } from 'ng-zorro-antd/i18n';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { routes } from './app.routes';
import { vaultAuthInterceptor } from './core/interceptors/vault-auth.interceptor';

registerLocaleData(localeEsCo, 'es-CO', localeEsCoExtra);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideNzI18n(es_ES),
    { provide: LOCALE_ID, useValue: 'es-CO' },
    provideHttpClient(withInterceptors([vaultAuthInterceptor])),
    // Usamos importProvidersFrom con BrowserAnimationsModule en lugar de
    // provideAnimations() porque NG Zorro 17 tiene un bug conocido con la
    // API moderna: los componentes overlay (message, modal) fallan con
    // NG05105 al renderizarse. BrowserAnimationsModule es el enfoque
    // "legacy" pero es el único 100% compatible.
    importProvidersFrom(BrowserModule, FormsModule, BrowserAnimationsModule),
  ]
};