"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  currentCount: number;
  entityName?: string; // Ej: "estudiantes registrados", "documentos"
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[]; // Por defecto: [10, 25, 50, 100]
  isLoading?: boolean;
  pageSizeMode?: "select" | "input"; // "input" para input numérico, "select" para dropdown
}

export function TablePagination({
  currentPage,
  totalPages,
  pageSize = 10,
  totalItems,
  currentCount,
  entityName = "registros",
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  isLoading = false,
  pageSizeMode = "select",
}: TablePaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || 1);

  // Estado para el modo input numérico de tamaño de página
  const [inputValue, setInputValue] = useState<string>(String(pageSize || 10));
  const [lastValidValue, setLastValidValue] = useState<number>(pageSize || 10);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar si pageSize cambia desde fuera
  useEffect(() => {
    if (
      pageSize &&
      pageSize >= 1 &&
      pageSize <= 500 &&
      pageSize !== lastValidValue
    ) {
      setLastValidValue(pageSize);
      setInputValue(String(pageSize));
    }
  }, [pageSize, lastValidValue]);

  // Aplicar cambio de tamaño de página
  const applyInputSize = (valStr: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const num = parseInt(valStr.trim(), 10);

    // Si queda vacío o inválido (fuera del rango 1 a 500), vuelve al último valor válido
    if (!valStr.trim() || isNaN(num) || num < 1 || num > 500) {
      setInputValue(String(lastValidValue));
      return;
    }

    setInputValue(String(num));

    if (num !== lastValidValue) {
      setLastValidValue(num);
      onPageSizeChange(num);
      onPageChange(1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Filtra y bloquea letras, símbolos o cualquier caracter que no sea dígito
    const cleanDigits = e.target.value.replace(/\D/g, "");
    setInputValue(cleanDigits);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce de ~400ms
    debounceTimerRef.current = setTimeout(() => {
      const num = parseInt(cleanDigits, 10);
      if (!isNaN(num) && num >= 1 && num <= 500) {
        if (num !== lastValidValue) {
          setLastValidValue(num);
          onPageSizeChange(num);
          onPageChange(1);
        }
      }
    }, 400);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Teclas de navegación y edición permitidas
    if (
      [
        "Backspace",
        "Delete",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(e.key)
    ) {
      return;
    }

    // Atajos de teclado (Ctrl/Cmd + C, V, A, Z, etc.)
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Enter aplica el cambio inmediatamente
    if (e.key === "Enter") {
      e.preventDefault();
      applyInputSize(inputValue);
      return;
    }

    // Bloquea letras, "e", "E", "+", "-", ".", "," y cualquier otro no-dígito
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteText = e.clipboardData.getData("text");
    const clean = pasteText.replace(/\D/g, "");
    if (clean) {
      const combined = (inputValue + clean).slice(0, 3);
      setInputValue(combined);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const num = parseInt(combined, 10);
        if (!isNaN(num) && num >= 1 && num <= 500) {
          if (num !== lastValidValue) {
            setLastValidValue(num);
            onPageSizeChange(num);
            onPageChange(1);
          }
        }
      }, 400);
    }
  };

  const handleInputBlur = () => {
    applyInputSize(inputValue);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    onPageSizeChange(newSize);
    onPageChange(1);
  };

  // Limpiar timer de debounce al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
      {/* Lado Izquierdo: texto informativo */}
      <p>
        Mostrando <span className="font-semibold text-slate-800">{currentCount}</span> de{" "}
        <span className="font-semibold text-slate-800">{totalItems}</span> {entityName}
      </p>

      {/* Lado Derecho */}
      <div className="flex items-center gap-3">
        {/* Selector de Filas */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
          <span className="font-medium text-slate-600">Filas:</span>
          {pageSizeMode === "input" ? (
            <input
              type="number"
              min={1}
              max={500}
              step={1}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onPaste={handleInputPaste}
              onBlur={handleInputBlur}
              disabled={isLoading}
              className="h-8 w-14 rounded-md border border-slate-300 bg-white px-2 text-center text-xs font-semibold text-slate-700 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Filas por página"
            />
          ) : (
            <select
              value={pageSize}
              onChange={handleSelectChange}
              disabled={isLoading}
              className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              aria-label="Filas por página"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Botón Anterior */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2.5 text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-2xs"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>

        {/* Indicador de Página */}
        <span className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap px-1">
          Pág. {currentPage} de {totalPages || 1}
        </span>

        {/* Botón Siguiente */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= safeTotalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2.5 text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-2xs"
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
