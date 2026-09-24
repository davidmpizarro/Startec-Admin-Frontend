import { apiClient } from "@/lib/api-client";
import { DashboardMetricsResponse, FunnelStep, KpiMetric } from "@/types/metrics";

// Datos semilla de contingencia para Tecsup
const MOCK_KPIS: { [key: string]: KpiMetric } = {
  totalAdmitidos: {
    title: "Total Admitidos",
    value: 1248,
    formattedValue: "1,248",
    changePercent: 14.8,
    period: "vs. ciclo anterior",
    iconName: "Users",
    variant: "primary",
    description: "Postulantes con vacante asignada en el proceso 2027-I",
  },
  matriculados: {
    title: "Matriculados Oficiales",
    value: 912,
    formattedValue: "912",
    changePercent: 8.2,
    period: "vs. meta ciclo",
    iconName: "GraduationCap",
    variant: "success",
    description: "Expediente completo, pagos liquidados y sección asignada",
  },
  pagosPendientes: {
    title: "Pagos Pendientes",
    value: 186,
    formattedValue: "186",
    changePercent: -5.4,
    period: "cuotas por liquidar",
    iconName: "CreditCard",
    variant: "warning",
    description: "Pendientes de validación en Tesorería / Pasarela BBVA-BCP",
  },
  biometriasCompletadas: {
    title: "Biometrías Completadas",
    value: 1042,
    formattedValue: "1,042",
    changePercent: 22.1,
    period: "83.5% del padrón",
    iconName: "Fingerprint",
    variant: "info",
    description: "Huella dactilar y validación facial RENIEC registradas",
  },
};

const MOCK_FUNNEL: FunnelStep[] = [
  {
    stepNumber: 1,
    name: "Paso 1: Inicia tu experiencia Tecsup",
    shortName: "Bienvenida y acceso al sistema institucional",
    subtitulo: "Bienvenida y acceso al sistema institucional",
    count: 1540,
    conversionFromPrevious: 100,
    dropoffRate: 0,
    status: "completed",
  },
  {
    stepNumber: 2,
    name: "Paso 2: Actualiza tu perfil",
    shortName: "Validación de datos personales y de contacto",
    subtitulo: "Validación de datos personales y de contacto",
    count: 1420,
    conversionFromPrevious: 92.2,
    dropoffRate: 7.8,
    status: "completed",
  },
  {
    stepNumber: 3,
    name: "Paso 3: Carga tus documentos",
    shortName: "Expediente digital y certificados de admisión",
    subtitulo: "Expediente digital y certificados de admisión",
    count: 1310,
    conversionFromPrevious: 92.3,
    dropoffRate: 7.7,
    status: "completed",
  },
  {
    stepNumber: 4,
    name: "Paso 4: Pago de Matrícula",
    shortName: "Liquidación y selección de modalidad de pago",
    subtitulo: "Liquidación y selección de modalidad de pago",
    count: 1042,
    conversionFromPrevious: 79.5,
    dropoffRate: 20.5,
    status: "in_progress",
  },
  {
    stepNumber: 5,
    name: "Paso 5: Pasarela de pagos",
    shortName: "Transacción financiera y procesamiento en pasarela",
    subtitulo: "Transacción financiera y procesamiento en pasarela",
    count: 980,
    conversionFromPrevious: 94.0,
    dropoffRate: 6.0,
    status: "in_progress",
  },
  {
    stepNumber: 6,
    name: "Paso 6: Confirmación de matrícula",
    shortName: "Generación de constancia y conformidad de vacante",
    subtitulo: "Generación de constancia y conformidad de vacante",
    count: 934,
    conversionFromPrevious: 95.3,
    dropoffRate: 4.7,
    status: "attention",
  },
  {
    stepNumber: 7,
    name: "Paso 7: Conoce tu carrera",
    shortName: "Malla curricular, plan de estudios y asignación académica",
    subtitulo: "Malla curricular, plan de estudios y asignación académica",
    count: 912,
    conversionFromPrevious: 97.6,
    dropoffRate: 2.4,
    status: "completed",
  },
  {
    stepNumber: 8,
    name: "Paso 8: Conquista el campus",
    shortName: "Activación de credenciales institucionales e inducción presencial",
    subtitulo: "Activación de credenciales institucionales e inducción presencial",
    count: 875,
    conversionFromPrevious: 95.9,
    dropoffRate: 4.1,
    status: "in_progress",
  },
];

export const metricsService = {
  async getDashboardMetrics(): Promise<DashboardMetricsResponse> {
    try {
      const data = await apiClient<DashboardMetricsResponse>("/dashboard/metricas");
      return data;
    } catch (err) {
      console.error("[metricsService] Error fetching real metrics from NestJS:", err);
      // Fallback resiliente
      return {
        kpis: {
          totalAdmitidos: MOCK_KPIS.totalAdmitidos,
          matriculados: MOCK_KPIS.matriculados,
          pagosPendientes: MOCK_KPIS.pagosPendientes,
          biometriasCompletadas: MOCK_KPIS.biometriasCompletadas,
        },
        funnel: MOCK_FUNNEL,
        lastUpdated: new Date().toISOString(),
        periodName: "Semestre Académico 2027-I (Campus Lima)",
      };
    }
  },
};
