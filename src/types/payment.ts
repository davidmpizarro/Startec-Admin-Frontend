export interface PagoEstudiante {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  correoPersonal?: string | null;
  correoInstitucional?: string | null;
  telefono?: string | null;
  carrera?: {
    id: string;
    codigo: string;
    nombre: string;
    sede?: string;
  } | null;
  seccion?: {
    id: string;
    codigoSeccion: string;
  } | null;
}

export interface TarjetaInfo {
  marca: "Visa" | "Mastercard" | string;
  ultimos4: string;
  tipo?: string;
}

export interface PagoCulqi {
  id: string;
  estudianteId: string;
  chargeId: string;
  transaccionId: string;
  proveedor: "CULQI_CHECKOUT" | string;
  fechaPago: string;
  concepto: string;
  monto: number;
  moneda: string;
  estado: "APROBADO" | "PENDIENTE" | "RECHAZADO" | string;
  tarjeta: TarjetaInfo;
  estudiante?: PagoEstudiante | null;
}

export interface CuentaPorCobrar {
  id: string;
  estudianteId: string;
  dni: string;
  estudiante: string;
  nombres: string;
  apellidos: string;
  correoPersonal?: string | null;
  telefono?: string | null;
  carrera?: {
    id: string;
    codigo: string;
    nombre: string;
    sede?: string;
  } | null;
  seccion?: {
    id: string;
    codigoSeccion: string;
  } | null;
  concepto: string;
  montoPendiente: number;
  moneda: string;
  diasEnEspera: number;
  estado: "Liquidación Generada" | "PENDIENTE" | string;
  fechaAdmision: string;
}

export interface TesoreriaResumen {
  totalRecaudadoCulqi: number;
  totalTransacciones: number;
  ticketPromedio: number;
  totalPorCobrar: number;
  estudiantesPendientes: number;
}

export interface TesoreriaResponse {
  success: boolean;
  resumen: TesoreriaResumen;
  recaudacionCulqi: PagoCulqi[];
  cuentasPorCobrar: CuentaPorCobrar[];
  data?: PagoCulqi[];
}

// Retrocompatibilidad
export type Pago = PagoCulqi;
export type PagosResumen = TesoreriaResumen;
export type PagosResponse = TesoreriaResponse;
