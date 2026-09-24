import React from "react";
import { Users, GraduationCap, CreditCard, Fingerprint, TrendingUp, TrendingDown } from "lucide-react";
import { KpiMetric } from "@/types/metrics";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  metric: KpiMetric;
}

export function KpiCard({ metric }: KpiCardProps) {
  const getIcon = () => {
    switch (metric.iconName) {
      case "Users":
        return <Users className="h-5 w-5 text-blue-700" />;
      case "GraduationCap":
        return <GraduationCap className="h-5 w-5 text-emerald-700" />;
      case "CreditCard":
        return <CreditCard className="h-5 w-5 text-amber-700" />;
      case "Fingerprint":
        return <Fingerprint className="h-5 w-5 text-sky-700" />;
      default:
        return <Users className="h-5 w-5 text-blue-700" />;
    }
  };

  const getIconContainerStyle = () => {
    switch (metric.variant) {
      case "primary":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "info":
        return "bg-sky-50 text-sky-700 border-sky-100";
      default:
        return "bg-blue-50 text-blue-700 border-blue-100";
    }
  };

  const isPositive = metric.changePercent >= 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {metric.title}
        </span>
        <div className={cn("p-2.5 rounded-lg border flex items-center justify-center", getIconContainerStyle())}>
          {getIcon()}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-3xl font-bold text-slate-900 tracking-tight">
          {metric.formattedValue}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <div
          className={cn(
            "inline-flex items-center font-semibold",
            isPositive ? "text-emerald-700" : "text-amber-800"
          )}
        >
          {isPositive ? (
            <TrendingUp className="mr-1 h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <TrendingDown className="mr-1 h-3.5 w-3.5 text-amber-600" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {metric.changePercent}%
          </span>
          <span className="ml-1 font-normal text-slate-500">
            {metric.period}
          </span>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 line-clamp-1">
        {metric.description}
      </p>
    </div>
  );
}
