/**
 * Payload que envía el formulario Angular al endpoint
 * POST /api/v1/credit/evaluate del orquestador Spring Boot.
 *
 * Los nombres coinciden 1:1 con CreditRequestDto.java para evitar mappings.
 */
export interface CreditRequest {
  nombre: string;
  cedula: string;
  edad: number;
  ingresosMensuales: number;
  montoSolicitado: number;
  plazoMeses: number;
  historialCrediticio: HistorialCrediticio;
  propositoPrestamo: PropositoPrestamo;
}

export type HistorialCrediticio =
  | 'EXCELENTE'
  | 'BUENO'
  | 'REGULAR'
  | 'MALO'
  | 'SIN_HISTORIAL';

export type PropositoPrestamo =
  | 'VEHICULO'
  | 'VIVIENDA'
  | 'EDUCACION'
  | 'CONSUMO'
  | 'NEGOCIO'
  | 'CONSOLIDACION_DEUDA'
  | 'OTRO';

/**
 * Etiquetas legibles para mostrar en dropdowns del formulario.
 * Mantenemos separados de los enums técnicos para poder cambiar
 * el texto de UI sin tocar la API.
 */
export const HISTORIAL_LABELS: Record<HistorialCrediticio, string> = {
  EXCELENTE:     'Excelente — sin moras',
  BUENO:         'Bueno — moras antiguas pagadas',
  REGULAR:       'Regular — alguna mora reciente',
  MALO:          'Malo — múltiples reportes',
  SIN_HISTORIAL: 'Sin historial — cliente nuevo'
};

export const PROPOSITO_LABELS: Record<PropositoPrestamo, string> = {
  VEHICULO:            'Compra de vehículo',
  VIVIENDA:            'Vivienda',
  EDUCACION:           'Educación',
  CONSUMO:             'Consumo personal',
  NEGOCIO:             'Capital de negocio',
  CONSOLIDACION_DEUDA: 'Consolidación de deudas',
  OTRO:                'Otro'
};