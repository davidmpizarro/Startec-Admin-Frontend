# StarTec Admin — Panel Administrativo de Admisión y Secretaría Académica (Tecsup)

Panel web administrativo de alta fidelidad para la oficina de **Admisión y Secretaría Académica de Tecsup**. Permite la gestión centralizada del proceso de matrícula, monitoreo en tiempo real de indicadores, auditoría del padrón de postulantes y la asignación de horarios y sesiones para el semestre 2026-I.

---

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) con diseño y estética inspirada en [shadcn/ui](https://ui.shadcn.com/)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Backend Consumido**: [NestJS](https://nestjs.com/) (`http://localhost:3000`)
- **Base de Datos**: PostgreSQL

---

## 🚀 Funcionalidades Principales

### 1. Dashboard de Métricas (`/dashboard`)
- **Tarjetas KPI**:
  - **Total Admitidos**: Contador con incremento porcentual vs. ciclo anterior.
  - **Matriculados Oficiales**: Expedientes finalizados con vacante asignada.
  - **Pagos Pendientes**: Alumnos en liquidación de tesorería / pasarelas de pago.
  - **Biometrías Completadas**: Registros de validación biométrica en campus.
- **Gráfico de Embudo de Matrícula (Paso 1 al Paso 8)**:
  - Visualización del flujo:
    1. *Registro Inicial*
    2. *Carga de Documentos*
    3. *Validación Académica*
    4. *Captura Biométrica*
    5. *Asignación de Horario*
    6. *Liquidación Financiera / Pago*
    7. *Emisión de Matrícula Oficial*
    8. *Inducción y Activación de Cuenta*
  - Monitoreo de conversión inter-paso, alertas de cuellos de botella y porcentaje sobre el total.

### 2. Padrón de Estudiantes (`/estudiantes`)
- **Buscador en tiempo real**: Filtrado por DNI (8 dígitos) o nombres/apellidos.
- **Filtros avanzados**: Por Carrera (C11, C12, C14) y Estado (`PRE_ADMITIDO`, `ADMITIDO`, `MATRICULADO`, `PAGO_PENDIENTE`, `OBSERVADO`).
- **Tabla Paginada**: Navegación por páginas, badges semánticos e indicadores de biometría y horario.
- **Modal "Pre-admitir Nuevo Estudiante"**:
  - Campos: DNI, Nombres, Apellidos, Carrera (predeterminada C11), Sección (predeterminada 1A) y correo institucional automático.
- **Acciones Operativas por Fila**:
  - 🔑 **Resetear Contraseña**: Genera contraseña temporal de acceso.
  - 🖐️ **Resetear Biometría**: Habilita al alumno para re-escanear huellas y rostro.
  - 📅 **Liberar Horario**: Libera la vacante de la sección seleccionada.
- **Exportación**: Generación y descarga instantánea en formato CSV.

### 3. Asignación de Horarios y Secciones (`/horarios`)
- **Visualizador de Sección 1A (C11 - Diseño y Desarrollo de Software)**:
  - Programación de las **5 sesiones semanales** (Lunes a Viernes).
  - Bloques de horario detallados con curso, aula/laboratorio, docente, horario y modalidad (*Laboratorio*, *Teoría*, *Taller*).
  - Indicador de capacidad y ocupación de vacantes (28/32).
- **Formulario Modal para Crear o Editar Sesiones**:
  - Configuración de día, curso, código, horario inicio/fin, aula y docente.

---

## 🔌 Integración con NestJS y Modo Resiliente

La aplicación se comunica con el backend mediante `src/lib/api-client.ts` apuntando a:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Endpoints Consumidos:
| Módulo | Método | Endpoint | Descripción |
|---|---|---|---|
| **Métricas** | `GET` | `/metrics/dashboard` | Resumen de KPIs y pasos del embudo |
| **Estudiantes** | `GET` | `/estudiantes` | Padrón filtrado y paginado |
| **Estudiantes** | `POST` | `/estudiantes/pre-admitir` | Registro de nuevo estudiante pre-admitido |
| **Estudiantes** | `POST` | `/estudiantes/:id/reset-password` | Restablecer contraseña de alumno |
| **Estudiantes** | `POST` | `/estudiantes/:id/reset-biometrics` | Reiniciar validación biométrica |
| **Estudiantes** | `POST` | `/estudiantes/:id/release-schedule` | Liberar horario/vacante asignada |
| **Horarios** | `GET` | `/secciones/1A/sesiones` | Detalle y sesiones de la Sección 1A |
| **Horarios** | `POST` | `/secciones/1A/sesiones` | Crear nueva sesión de clase |
| **Horarios** | `PUT` | `/secciones/1A/sesiones/:id` | Editar sesión de clase existente |
| **Horarios** | `DELETE`| `/secciones/1A/sesiones/:id` | Eliminar sesión de la sección |

> 🛡️ **Modo Resiliente / Local Fallback**:
> Si el servidor NestJS en `http://localhost:3000` se encuentra apagado o en mantenimiento durante las pruebas, el cliente HTTP activa automáticamente un fallback en memoria con datos semilla oficiales de Tecsup. El indicador en la barra superior muestra el estado de conexión sin interrumpir la experiencia de usuario.

---

## 💻 Instrucciones de Ejecución

### 1. Instalar dependencias:
```bash
npm install
```

### 2. Ejecutar en desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000) (o puerto alternativo si el backend NestJS ocupa el 3000).

### 3. Compilar para producción y verificar tipos:
```bash
npm run build
npm run lint
```
