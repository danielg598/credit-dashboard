/**
 * Environment por defecto (desarrollo local).
 * Cuando compiles para producción con `ng build --configuration production`,
 * Angular reemplaza este archivo por environment.production.ts automáticamente.
 */
export const environment = {
  production: false,
  orchestratorUrl: 'http://localhost:8080',
  vaultUrl: 'http://localhost:9000',
  vaultAuthToken: 'mock-dev-token'
};