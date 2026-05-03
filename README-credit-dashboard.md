# credit-dashboard

> **Dashboard web de Lumen**. Interfaz del asesor/cliente para originar
> solicitudes de crédito, visualizar la decisión con su explicación
> generada por IA, y consultar las cuentas activas en Vault Core.

Puerto: **4200** · Angular 17.3 · NG Zorro 17.4 · Tailwind 3.4

---

## Responsabilidades

Esta es la **única** aplicación que el usuario final ve. Sus tareas:

1. Capturar la solicitud en un formulario reactivo con validación en vivo
2. Llamar al orquestador Spring Boot (`:8080`) para evaluar la solicitud
3. Mostrar el resultado: decisión + score + factores SHAP + explicación LLM
4. Mostrar en tabla todas las cuentas creadas en Vault (tab separada)
5. Refrescar automáticamente la tabla cuando se apruebe una solicitud nueva

No habla con Vault directamente en producción (solo para debug). Todo
pasa por el orquestador, que es quien tiene credenciales y autoridad.

---

## Tecnologías y por qué cada una

| Decisión | Justificación |
|---|---|
| **Angular 17 standalone** | Sin NgModules. Bundle ~30% más pequeño. API moderna del framework. |
| **NG Zorro 17.4** | Librería de componentes maduros (form, table, tabs, date-picker) para UI enterprise. Alternativa a Material cuando quieres diseño AntD-style. |
| **Tailwind 3.4** | Utility classes para layout y spacing. Convive con NG Zorro con `preflight:false`. |
| **Signals** | API moderna de reactividad en Angular 17. Reemplaza BehaviorSubject para estado local. |
| **Reactive Forms** | Tipado fuerte con `FormBuilder.nonNullable.group`. Validación declarativa. |
| **RxJS Subject** | Comunicación cross-component (form → tabla de cuentas) sin acoplamiento padre-hijo. |
| **es-CO locale** | Pipes de `currency` y `percent` con formato colombiano (`$ 20.000.000`, `18,56 %`). |

### ¿Por qué Angular y no React?

React hubiera sido más rápido para el MVP, pero:

1. **Thought Machine usa Angular** en su Ops Dashboard (producto que se
   asemeja mucho al nuestro). Hablamos su idioma.
2. **Formularios complejos** — Reactive Forms es superior a react-hook-form
   para 20+ campos con dependencias cruzadas.
3. **TypeScript first-class** — en React lo configuras, en Angular es el
   default.
4. **NG Zorro** es una librería pulida con i18n ES-CO nativo. Ant Design
   de React tendría que venir con ant-design-pro + i18n setup manual.

### ¿Por qué NG Zorro + Tailwind en lugar de solo NG Zorro?

- **NG Zorro** tiene componentes enterprise (tabla con sort/paginación
  built-in, date-picker, form-item con error-tips) pero su sistema de
  layout es débil.
- **Tailwind** hace el grid/spacing/responsive trivial sin escribir CSS.
- Los dos conviven con una config sencilla: `corePlugins.preflight: false`
  para no romper los estilos base de NG Zorro.

Resultado: la productividad de Tailwind para layout + la calidad de los
componentes NG Zorro. Es el combo que usa **Alibaba Cloud Console**.

---

## Estructura del proyecto

```
credit-dashboard/
├── src/
│   ├── app/
│   │   ├── app.component.ts          Shell: header + tabs + footer
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts             Providers (HTTP, i18n, animations)
│   │   ├── app.routes.ts             Rutas (aún vacías, single-page)
│   │   │
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   ├── credit-request.model.ts
│   │   │   │   ├── credit-response.model.ts
│   │   │   │   └── account.model.ts
│   │   │   ├── services/
│   │   │   │   ├── credit.service.ts     Llama Spring Boot :8080
│   │   │   │   └── vault.service.ts      Llama Vault Mock :9000 + Subject
│   │   │   └── interceptors/
│   │   │       └── vault-auth.interceptor.ts   Inyecta X-Auth-Token
│   │   │
│   │   └── features/
│   │       ├── credit-form/              Formulario + botones ejemplo
│   │       │   ├── credit-form.component.ts
│   │       │   ├── credit-form.component.html
│   │       │   └── credit-form.component.scss
│   │       └── accounts-list/            Tabla de cuentas aprobadas
│   │           ├── accounts-list.component.ts
│   │           ├── accounts-list.component.html
│   │           └── accounts-list.component.scss
│   │
│   ├── environments/
│   │   ├── environment.ts                dev (localhost:8080 y :9000)
│   │   └── environment.production.ts     prod (dominios reales)
│   │
│   ├── styles.scss                       Tailwind + overrides NG Zorro
│   ├── theme.less                        Tokens NG Zorro (paleta Lumen)
│   ├── index.html
│   └── main.ts
│
├── angular.json
├── tailwind.config.js
├── package.json
└── README.md                             (este archivo)
```

---

## Setup desde cero

```bash
cd credit-dashboard

npm install
ng serve
```

El dev server arranca en http://localhost:4200 con hot reload.

### Prerrequisitos

- Node.js 20.x
- npm 10.x
- Los 3 servicios backend corriendo:
  - credit-orchestrator en `:8080`
  - vault-mock en `:9000`
  - credit-ai-service en `:8000` (opcional si `APP_AI_MODE=mock`)

---

## Configuración por ambiente

Angular tiene `fileReplacements` en `angular.json` para swap de
`environment.ts` según el target del build:

```json
"configurations": {
  "production": {
    "fileReplacements": [{
      "replace": "src/environments/environment.ts",
      "with":    "src/environments/environment.production.ts"
    }]
  }
}
```

### `environment.ts` (desarrollo)

```ts
export const environment = {
  production: false,
  orchestratorUrl: 'http://localhost:8080',
  vaultUrl:        'http://localhost:9000',
  vaultAuthToken:  'mock-dev-token',
};
```

### `environment.production.ts`

```ts
export const environment = {
  production: true,
  orchestratorUrl: 'https://api.lumen.co',
  vaultUrl:        'https://core-api.tm.blx-demo.com',
  vaultAuthToken:  'PRODUCTION_TOKEN_PLACEHOLDER',
};
```

**Importante**: en producción, el token NO se hardcodea. Se inyecta vía
pipeline de CI/CD (variables de build) o vía API gateway que lo agrega
en tránsito. Este placeholder es solo para mostrar la forma.

### Comandos

```bash
ng serve                                    # dev
ng build                                    # prod default
ng build --configuration=development        # dev build
```

---

## Paleta Lumen

Tokens centralizados en `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      'lumen-primary': '#1e3a8a',   // azul oscuro, headers + branding
      'lumen-accent':  '#0ea5e9',   // azul claro, focus states
      'lumen-success': '#059669',   // verde, APROBADO
      'lumen-danger':  '#dc2626',   // rojo, RECHAZADO
      'lumen-warning': '#d97706',   // ámbar, REVISION_MANUAL
    }
  }
}
```

Usados en el HTML como `text-lumen-primary`, `bg-lumen-success`, etc.

Los mismos colores se aplican a componentes NG Zorro sobrescribiendo en
`styles.scss`:

```scss
.ant-btn-primary {
  background-color: #1e3a8a !important;
  border-color: #1e3a8a !important;
}
```

---

## Flujo de datos

```
┌────────────────┐
│ CreditForm     │
│ Component      │
└───────┬────────┘
        │ submit()
        ▼
┌────────────────┐       HTTP POST
│ CreditService  │──────────────────▶  Spring Boot :8080
│                │◀─────────────────    /api/v1/credit/evaluate
└───────┬────────┘       respuesta
        │
        │ next(response)
        ▼
┌────────────────┐
│ AppComponent   │
│ (resuelve la   │
│  respuesta en  │
│  panel derecho)│
└────────────────┘
        │
        │ si response.vaultAccountId existe:
        ▼
┌────────────────┐       notifyAccountCreated()
│ VaultService   │─────▶ Subject emite
│                │
└───────┬────────┘
        │ accountCreated$ observable
        ▼
┌────────────────┐
│ AccountsList   │ refresca la tabla sin
│ Component      │ clicks del usuario
└────────────────┘
```

**Punto clave**: el formulario **no conoce** la tabla. Se comunican a
través del `Subject` del `VaultService` — que actúa como event bus.
Desacoplamiento total.

---

## `VaultService` con Subject reactivo

```ts
@Injectable({ providedIn: 'root' })
export class VaultService {
  private accountCreatedSubject = new Subject<string>();
  accountCreated$ = this.accountCreatedSubject.asObservable();

  notifyAccountCreated(accountId: string): void {
    this.accountCreatedSubject.next(accountId);
  }

  listAccounts(): Observable<ListAccountsResponse> {
    return this.http.get<ListAccountsResponse>(`${environment.vaultUrl}/v1/accounts`);
  }
}
```

El `AccountsListComponent` se suscribe con `takeUntil(destroy$)` para
evitar memory leaks:

```ts
ngOnInit(): void {
  this.loadAccounts();                   // carga inicial

  this.vault.accountCreated$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.loadAccounts());   // recarga en cada aprobación
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

Este patrón es el estándar moderno de Angular 17 antes de que los
`Signals` reemplacen completamente RxJS para estado cross-component.

---

## Interceptor de autenticación

Para las llamadas directas al Vault Mock (solo desarrollo), inyectamos
automáticamente el `X-Auth-Token`:

```ts
// core/interceptors/vault-auth.interceptor.ts
export const vaultAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.vaultUrl)) {
    const cloned = req.clone({
      headers: req.headers.set('X-Auth-Token', environment.vaultAuthToken),
    });
    return next(cloned);
  }
  return next(req);
};
```

Registrado en `app.config.ts`:

```ts
provideHttpClient(withInterceptors([vaultAuthInterceptor]))
```

**Nota**: en producción el navegador nunca habla directo con Vault — solo
con el orquestador. Este interceptor existe para el tab "Cuentas
aprobadas" en dev.

---

## Formulario reactivo con validación

El formulario usa `FormBuilder.nonNullable.group` (tipado fuerte desde
Angular 14+):

```ts
form = this.fb.nonNullable.group({
  nombre:             ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  cedula:             ['', [Validators.required, Validators.pattern(/^\d{6,10}$/)]],
  edad:               [30, [Validators.required, Validators.min(18), Validators.max(75)]],
  ingresosMensuales:  [3_000_000, [Validators.required, Validators.min(1_000_000)]],
  montoSolicitado:    [10_000_000, [Validators.required, Validators.min(500_000), Validators.max(100_000_000)]],
  plazoMeses:         [36, [Validators.required, Validators.min(6), Validators.max(120)]],
  historialCrediticio:<HistorialCrediticio | null>null,
  propositoPrestamo:  <PropositoPrestamo | null>null,
});
```

Los mensajes de error se muestran en `<ng-template>` scoped por campo,
conectados vía `[nzErrorTip]`:

```html
<nz-form-control [nzErrorTip]="cedulaError">
  <input nz-input formControlName="cedula" />
  <ng-template #cedulaError let-control>
    @if (control) {
      @if (control.hasError('required')) {
        <span>La cédula es obligatoria</span>
      } @else if (control.hasError('pattern')) {
        <span>Debe tener entre 6 y 10 dígitos</span>
      }
    }
  </ng-template>
</nz-form-control>
```

El guard `@if (control)` previene el bug `Cannot read properties of null
(reading 'hasError')` que aparece en NG Zorro cuando el template se
evalúa antes de que el control exista.

---

## Botones "Ejemplo aprobable" / "Ejemplo rechazable"

Arriba del formulario hay 2 botones que **pre-llenan el formulario** con
perfiles extremos. Esto fue una decisión de producto pensada
específicamente para **demo**:

```ts
cargarEjemplo(tipo: 'aprobable' | 'rechazable'): void {
  if (tipo === 'aprobable') {
    this.form.patchValue({
      nombre: 'María Pérez',
      cedula: '1023456789',
      edad: 32,
      ingresosMensuales: 4_500_000,
      montoSolicitado:   20_000_000,
      plazoMeses: 36,
      historialCrediticio: 'BUENO',
      propositoPrestamo:  'VEHICULO',
    });
  } else {
    this.form.patchValue({
      nombre: 'Carlos Testeo',
      cedula: '8888888888',
      edad: 22,
      ingresosMensuales: 1_500_000,
      montoSolicitado:   50_000_000,
      plazoMeses: 24,
      historialCrediticio: 'MALO',
      propositoPrestamo:  'CONSUMO',
    });
  }
}
```

En el pitch: 1 clic rellena, 1 clic evalúa. Durante una demo de 10
minutos, esos 14 campos no se llenan a mano.

---

## Tabla de cuentas con auto-refresh

El `AccountsListComponent` usa `nz-table` con sort, paginación y tags de
estado coloreados por estado de cuenta:

```html
<nz-tag [nzColor]="tagColor(acc.status)">{{ statusLabel(acc.status) }}</nz-tag>
```

donde:
- `ACCOUNT_STATUS_PENDING` → tag dorado "Pendiente"
- `ACCOUNT_STATUS_OPEN` → tag verde "Activa"
- `ACCOUNT_STATUS_CLOSED` → tag gris "Cerrada"

Orden por ID descendente → las más recientes arriba (los IDs incluyen
timestamp Unix).

---

## Estilos: el bug cosmético de NG Zorro + provideAnimations

En Angular 17 + NG Zorro 17.4 hay un bug conocido al usar la API moderna
`provideAnimations()`:

```
ERROR RuntimeError: NG05105: Unexpected synthetic listener @moveUpMotion.done
```

Causa: `provideAnimations()` no registra correctamente algunos listeners
sintéticos de NG Zorro en los componentes de tipo overlay (message,
tooltip).

**Workaround**: usar el enfoque legacy `BrowserAnimationsModule` vía
`importProvidersFrom` en `app.config.ts`:

```ts
providers: [
  // ...
  importProvidersFrom(BrowserModule, FormsModule, BrowserAnimationsModule),
],
```

En lugar de `provideAnimations()`. Es 100% compatible, solo un poco más
verboso. **Reportado en NG Zorro issues**. Workaround oficial hasta la
v18.

---

## i18n — formato colombiano

Registrado en `app.config.ts`:

```ts
import localeEsCo from '@angular/common/locales/es-CO';
import localeEsCoExtra from '@angular/common/locales/extra/es-CO';

registerLocaleData(localeEsCo, 'es-CO', localeEsCoExtra);

providers: [
  provideNzI18n(es_ES),                         // NG Zorro (no tiene es_CO)
  { provide: LOCALE_ID, useValue: 'es-CO' },    // Pipes de Angular
];
```

**Nota**: NG Zorro no tiene bundle `es_CO` — usamos `es_ES` que es muy
similar. El formato de moneda y porcentaje sí usa `es-CO` gracias a
`LOCALE_ID`.

Resultado: `$ 20.000.000` (espacio después del peso) y `18,56 %` (coma
decimal). Estilo exacto del sector financiero colombiano.

---

## Gotchas conocidas

### 1. El cache de `.angular/` confunde los cambios de environment

Si cambias `environment.ts` y ves que el dashboard sigue apuntando a la
URL vieja, limpia:

```powershell
Remove-Item -Recurse -Force .angular -ErrorAction SilentlyContinue
ng serve
```

### 2. Warning `tabSwitchMotion is attempting to animate display`

Cosmético de NG Zorro 17 con Angular 17. **Ignorar**. No afecta
funcionalidad. Resuelto en NG Zorro 18.

### 3. Cambios en `app.config.ts` a veces no son detectados por hot reload

Solución: `Ctrl+C` en el terminal de `ng serve`, relanzar. Toma 5 seg.

---

## Build para producción

```bash
ng build --configuration=production
```

Output en `dist/credit-dashboard/browser/`. Estáticos listos para servir
desde Nginx, CloudFront, S3, o cualquier CDN.

**Budget de tamaño**: `angular.json` limita el initial bundle a **1MB**.
El bundle actual es ~780KB gzipped — saludable para enterprise.

Comando para analizar qué pesa más:

```bash
npm install -g source-map-explorer
source-map-explorer dist/credit-dashboard/browser/main.*.js
```

---

## Próximos pasos

- [ ] Rutas reales con lazy loading (hoy es single-page)
- [ ] Autenticación con OAuth2 / Keycloak
- [ ] Estado global con NgRx Signal Store (hoy usa Subject ad-hoc)
- [ ] Export del resultado a PDF para el cliente
- [ ] Cypress E2E tests
- [ ] Internacionalización real con `@angular/localize`
- [ ] Server-side rendering con Angular Universal si SEO es relevante
- [ ] Progressive Web App (offline mode) si se usa en terreno
