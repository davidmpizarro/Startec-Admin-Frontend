import type { Metadata } from "next";
import { AdminLayoutShell } from "@/components/layout/admin-layout-shell";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "StarTec Admin - Tecsup Admisión y Secretaría Académica",
  description:
    "Panel administrativo para la oficina de Admisión y Secretaría Académica de Tecsup. Gestión integral de matrículas, padrón de estudiantes y asignación de horarios.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <ToastProvider>
          <AdminLayoutShell>{children}</AdminLayoutShell>
        </ToastProvider>
      </body>
    </html>
  );
}
