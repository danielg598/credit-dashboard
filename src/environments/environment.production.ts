/**
 * Environment de producción — solo se aplica en build con
 * `ng build --configuration production`.
 * Apunta a los dominios productivos (reemplazar con los reales).
 */
export const environment = {
  production: true,
  orchestratorUrl: 'https://credit-api.lumen.com',
  vaultUrl: 'https://core-api.tm.blx-demo.com',
  vaultAuthToken: 'PRODUCTION_TOKEN_PLACEHOLDER'
};
