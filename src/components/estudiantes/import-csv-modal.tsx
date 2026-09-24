"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Users,
} from "lucide-react";
import { ImportEstudianteDto, ImportStudentsResult } from "@/types/student";
import { studentsService } from "@/services/students.service";
import { useToast } from "@/components/ui/toast";

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text: string): { data: ImportEstudianteDto[]; error?: string } {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
  if (nonEmptyLines.length < 2) {
    return {
      data: [],
      error: "El archivo CSV está vacío o no contiene filas de datos.",
    };
  }

  const headerLine = nonEmptyLines[0];
  const headers = parseCsvLine(headerLine).map((h) =>
    h.toLowerCase().trim().replace(/["']/g, "")
  );

  const getColIndex = (names: string[]): number => {
    return headers.findIndex((h) => names.includes(h));
  };

  const dniIdx = getColIndex(["dni", "documento", "documentonacional"]);
  const nombresIdx = getColIndex([
    "nombres",
    "nombre",
    "firstname",
    "nombrecompleto",
    "nombre_completo",
    "estudiante",
    "alumno",
    "postulante",
  ]);
  const apellidosIdx = getColIndex([
    "apellidos",
    "apellido",
    "lastname",
    "surname",
  ]);
  const correoIdx = getColIndex(["correopersonal", "correo", "email", "mail"]);
  const telefonoIdx = getColIndex(["telefono", "celular", "phone"]);
  const carreraIdx = getColIndex(["carreracodigo", "carrera", "programacodigo"]);

  if (dniIdx === -1 || (nombresIdx === -1 && apellidosIdx === -1)) {
    return {
      data: [],
      error:
        "Cabeceras inválidas. El CSV debe contener las columnas: dni y nombres (o apellidos).",
    };
  }

  const result: ImportEstudianteDto[] = [];

  for (let i = 1; i < nonEmptyLines.length; i++) {
    const cols = parseCsvLine(nonEmptyLines[i]);
    if (cols.length === 0 || (cols.length === 1 && !cols[0].trim())) continue;

    const rawDni = (cols[dniIdx] || "").trim().replace(/\D/g, "");
    const dni = rawDni.padStart(8, "0");
    let nombres = (nombresIdx !== -1 ? cols[nombresIdx] : "") || "";
    let apellidos = (apellidosIdx !== -1 ? cols[apellidosIdx] : "") || "";
    nombres = nombres.trim();
    apellidos = apellidos.trim();

    // Segmentación inteligente y resiliente si apellidos está vacío pero nombres contiene espacios
    if (!apellidos && nombres.includes(" ")) {
      const tokens = nombres.split(/\s+/).filter(Boolean);
      if (tokens.length >= 2) {
        const splitIndex = tokens.length > 3 ? 2 : 1;
        nombres = tokens.slice(0, splitIndex).join(" ");
        apellidos = tokens.slice(splitIndex).join(" ");
      }
    } else if (!nombres && apellidos.includes(" ")) {
      const tokens = apellidos.split(/\s+/).filter(Boolean);
      if (tokens.length >= 2) {
        const splitIndex = tokens.length > 3 ? 2 : 1;
        nombres = tokens.slice(0, splitIndex).join(" ");
        apellidos = tokens.slice(splitIndex).join(" ");
      }
    }

    const correoPersonal =
      correoIdx !== -1 ? (cols[correoIdx] || "").trim() : "";
    const telefono = telefonoIdx !== -1 ? (cols[telefonoIdx] || "").trim() : "";
    const carreraCodigo =
      carreraIdx !== -1
        ? (cols[carreraIdx] || "").trim().toUpperCase()
        : "C24";

    if (dni && (nombres || apellidos)) {
      result.push({
        dni,
        nombres: nombres || apellidos,
        apellidos: apellidos || nombres,
        correoPersonal: correoPersonal || undefined,
        telefono: telefono || undefined,
        carreraCodigo: carreraCodigo || "C24",
      });
    }
  }

  return { data: result };
}

export function ImportCsvModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportCsvModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [parsedStudents, setParsedStudents] = useState<ImportEstudianteDto[]>(
    []
  );
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultSummary, setResultSummary] =
    useState<ImportStudentsResult | null>(null);

  const handleDownloadTemplate = () => {
    const headers =
      "dni,nombres,apellidos,correoPersonal,telefono,carreraCodigo\n";
    const samples = [
      "70213456,Carlos Eduardo,Mendoza Vega,carlos.mendoza@gmail.com,987112233,C24",
      "70324567,Ana Lucía,Ríos Salazar,ana.rios@gmail.com,976223344,C20",
      "70435678,Jorge Luis,Chávez Prado,jorge.chavez@gmail.com,965334455,C16",
      "70546789,Sofía Milagros,García Vargas,sofia.garcia@gmail.com,954445566,C1",
    ].join("\n");

    const blob = new Blob([headers + samples], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_postulantes_startec.csv");
    link.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setParseError(null);
    setResultSummary(null);

    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setParseError("Por favor selecciona un archivo con formato .csv válido.");
      return;
    }

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCsv(text);
      if (parsed.error) {
        setParseError(parsed.error);
        setParsedStudents([]);
      } else {
        setParsedStudents(parsed.data);
      }
    };
    reader.onerror = () => {
      setParseError("Error al leer el archivo en el navegador.");
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setFileName("");
    setFileSize("");
    setParsedStudents([]);
    setParseError(null);
    setResultSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExecuteImport = async () => {
    if (parsedStudents.length === 0) return;

    try {
      setIsProcessing(true);
      const res = await studentsService.importStudentsCsv(parsedStudents);
      setResultSummary(res);

      if (res.insertados > 0) {
        toast({
          title: "Importación masiva completada",
          description: `Se insertaron ${res.insertados} expedientes en PostgreSQL (${res.omitidosPorDuplicado} duplicados omitidos).`,
          type: "success",
        });
        if (onSuccess) {
          onSuccess();
        }
      } else if (res.omitidosPorDuplicado > 0 && res.fallidos === 0) {
        toast({
          title: "Todos los registros ya existían",
          description: `Se omitieron ${res.omitidosPorDuplicado} registros por DNI duplicado.`,
          type: "warning",
        });
      } else {
        toast({
          title: "Importación con observaciones",
          description: `Hubo ${res.fallidos} filas con errores que no pudieron procesarse.`,
          type: "error",
        });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al procesar la importación";
      toast({
        title: "Error en importación",
        description: msg,
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Importación Masiva de Estudiantes (CSV)"
      description="Carga de expedientes de postulantes para Fase 1 (Pre-admisión) con deduplicación y hashing optimizado."
      maxWidth="xl"
      footer={
        <>
          <Button
            variant="outline"
            onClick={handleCloseModal}
            disabled={isProcessing}
          >
            {resultSummary ? "Cerrar" : "Cancelar"}
          </Button>

          {!resultSummary && (
            <Button
              onClick={handleExecuteImport}
              disabled={parsedStudents.length === 0 || isProcessing}
              isLoading={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 font-bold"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isProcessing
                ? "Procesando..."
                : `Importar ${parsedStudents.length} Estudiantes`}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5 text-left">
        {/* Template download banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                Plantilla oficial de postulantes Tecsup
              </p>
              <p className="text-[11px] text-slate-500">
                Formato UTF-8 con cabeceras: dni, nombres, apellidos,
                correoPersonal, telefono, carreraCodigo
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="text-blue-700 border-blue-200 bg-white hover:bg-blue-50 shrink-0 font-semibold"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Descargar Plantilla CSV
          </Button>
        </div>

        {/* Upload Dropzone */}
        {!resultSummary && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />

            {!fileName ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/40 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Arrastra tu archivo CSV aquí o haz clic para seleccionarlo
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Soporta lotes masivos de 500 a 1,500+ registros sin bloqueos de
                  servidor
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-blue-50/60 p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-7 w-7 text-blue-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{fileName}</p>
                    <p className="text-xs text-slate-500">{fileSize}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Eliminar y seleccionar otro"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Error notice */}
        {parseError && (
          <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Processing Spinner / Loading Bar */}
        {isProcessing && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 text-center space-y-3">
            <div className="inline-flex h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
            <div>
              <p className="text-sm font-bold text-blue-950">
                Procesando e insertando padrón en PostgreSQL...
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Generando hashes bcrypt en chunks asíncronos y deduplicando
                expedientes en memoria.
              </p>
            </div>
          </div>
        )}

        {/* Preview Table */}
        {!resultSummary && parsedStudents.length > 0 && !isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-slate-500" />
                Previsualización de registros ({parsedStudents.length} detectados)
              </span>
              <span className="text-[11px] text-slate-400">
                Mostrando las primeras 5 filas
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2 px-3 w-10">#</th>
                    <th className="py-2 px-3">DNI</th>
                    <th className="py-2 px-3">Estudiante</th>
                    <th className="py-2 px-3">Correo Personal</th>
                    <th className="py-2 px-3">Teléfono</th>
                    <th className="py-2 px-3">Carrera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedStudents.slice(0, 5).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                        {item.dni}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {item.apellidos}, {item.nombres}
                      </td>
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                        {item.correoPersonal || "-"}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {item.telefono || "-"}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 text-[10px]">
                          {item.carreraCodigo || "C24"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Result Summary Modal View */}
        {resultSummary && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Recibidos
                </p>
                <p className="text-2xl font-black text-slate-800 mt-1">
                  {resultSummary.totalRecibidos}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Insertados
                </div>
                <p className="text-2xl font-black text-emerald-700 mt-1">
                  {resultSummary.insertados}
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5" />
                  Omitidos
                </div>
                <p className="text-2xl font-black text-amber-700 mt-1">
                  {resultSummary.omitidosPorDuplicado}
                </p>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50/60 p-3.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-red-700 uppercase tracking-wider">
                  <XCircle className="h-3.5 w-3.5" />
                  Fallidos
                </div>
                <p className="text-2xl font-black text-red-700 mt-1">
                  {resultSummary.fallidos}
                </p>
              </div>
            </div>

            {/* Error detail list */}
            {resultSummary.errores && resultSummary.errores.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 space-y-1.5 max-h-40 overflow-y-auto">
                <p className="text-xs font-bold text-red-800">
                  Detalle de filas con errores ({resultSummary.errores.length}):
                </p>
                {resultSummary.errores.slice(0, 10).map((err, idx) => (
                  <p key={idx} className="text-[11px] text-red-700">
                    • <span className="font-semibold">Fila {err.fila}:</span>{" "}
                    {err.motivo}
                  </p>
                ))}
                {resultSummary.errores.length > 10 && (
                  <p className="text-[10px] text-red-500 italic">
                    ... y {resultSummary.errores.length - 10} errores adicionales.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
