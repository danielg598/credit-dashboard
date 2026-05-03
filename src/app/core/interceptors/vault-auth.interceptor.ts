import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Interceptor que inyecta el header X-Auth-Token en TODAS las peticiones
 * dirigidas al Mock Vault. Sin este header, el mock (y el Vault real
 * el día de mañana) responde 401 Unauthorized.
 *
 * La detección se hace por el baseUrl del environment, NO por el string
 * "localhost:9000", para que funcione igual en desarrollo y en producción.
 */
export const vaultAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.vaultUrl)) {
    const cloned = req.clone({
      setHeaders: { 'X-Auth-Token': environment.vaultAuthToken }
    });
    return next(cloned);
  }
  return next(req);
};