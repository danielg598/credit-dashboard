/**
 * Respuesta del orquestador tras evaluar una solicitud.
 * Mapea 1:1 a CreditResponseDto.java.
 */
export interface CreditResponse {
  decisionId: string;
  decision: Decision;
  montoAprobado: number;
  tasaInteresEA: number;        // ej: 0.185 = 18.5% EA
  cuotaMensual: number;
  plazoMeses: number;
  score: number;                // 0-1000
  probabilidadDefault: number;  // 0.0 - 1.0
  factoresClave: FactorClave[];
  explicacion: string;
  razonRechazo: string | null;  // null si aprobado
  vaultAccountId: string | null;
  modeloVersion: string;
  latenciaMs: number;
  timestamp: string;
}

export type Decision = 'APROBADO' | 'RECHAZADO' | 'REVISION_MANUAL';

export interface FactorClave {
  factor: string;
  impacto: number;
  descripcion: string;
  direction: 'AUMENTA_RIESGO' | 'REDUCE_RIESGO';
}