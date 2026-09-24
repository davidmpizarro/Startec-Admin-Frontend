export interface KpiMetric {
  title: string;
  value: number;
  formattedValue: string;
  changePercent: number;
  period: string;
  iconName: "Users" | "GraduationCap" | "CreditCard" | "Fingerprint";
  variant: "primary" | "success" | "warning" | "info";
  description: string;
}

export interface FunnelStep {
  paso?: number;
  stepNumber: number;
  titulo?: string;
  name: string;
  shortName: string;
  subtitulo?: string;
  tag?: string;
  count: number;
  conversionFromPrevious: number; // percentage (0-100)
  dropoffRate: number; // percentage (0-100)
  status: "completed" | "in_progress" | "attention";
}

export interface DashboardMetricsResponse {
  kpis: {
    totalAdmitidos: KpiMetric;
    matriculados: KpiMetric;
    pagosPendientes: KpiMetric;
    biometriasCompletadas: KpiMetric;
  };
  funnel: FunnelStep[];
  lastUpdated: string;
  periodName: string;
}
