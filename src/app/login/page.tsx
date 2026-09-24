/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@tecsup.edu.pe");
  const [password, setPassword] = useState("Tecsup2027Admin*");
  const [campus, setCampus] = useState("Campus Lima (Santa Anita)");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      try {
        localStorage.setItem(
          "auth_token",
          "startec_admin_session_" + Date.now().toString(36)
        );
        localStorage.setItem(
          "user_session",
          JSON.stringify({
            name: "Secretaría Académica",
            email,
            role: "ADMINISTRADOR",
            campus,
            period: "2027-I",
          })
        );
      } catch (err) {
        console.error("Storage error:", err);
      }

      toast({
        title: "Sesión iniciada con éxito",
        description: "Bienvenido al Panel Administrativo de Admisión y Matrícula 2027-I.",
        type: "success",
      });

      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#090F1B] via-[#0D1627] to-[#131F38] p-4 text-slate-100">
      {/* Background glowing ambient elements */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#0284C7]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0F182E]/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-auto items-center justify-center rounded-xl bg-white/5 p-2.5 border border-slate-700/60">
            <img
              src="/logo-splash-startec.png"
              alt="Logo Tecsup StarTec"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-0.5 text-xs font-semibold text-sky-400 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Periodo Académico 2027-I</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Portal Administrativo StarTec
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Oficina de Admisión, Matrícula y Secretaría Académica Tecsup
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Correo Institucional
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tecsup.edu.pe"
                className="pl-9 bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Campus Asignado
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900/80 py-2 pl-9 pr-3 text-xs font-medium text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="Campus Lima (Santa Anita)">Campus Lima (Santa Anita)</option>
                <option value="Campus Arequipa">Campus Arequipa</option>
                <option value="Campus Trujillo">Campus Trujillo</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold shadow-lg shadow-sky-600/20 mt-2 cursor-pointer h-10"
          >
            {isLoading ? (
              "Ingresando al sistema..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                Ingresar al Panel Admin
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Footer notes */}
        <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Sistema Seguro con Cifrado Institucional Tecsup</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        StarTec Platform v2.4 • Admisión y Matrícula Tecsup 2027-I
      </div>
    </div>
  );
}
