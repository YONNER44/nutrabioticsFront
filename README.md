# Nutrabiotics — Frontend

Aplicación Next.js con App Router para la gestión de prescripciones médicas (3 roles: Admin, Médico, Paciente).

## Stack

- **Next.js 15** (App Router) + TypeScript + TailwindCSS
- **Zustand** para estado global (auth persistido en localStorage)
- **Axios** con interceptores para auto-refresh de tokens
- **Recharts** para gráficas del dashboard de Admin
- **react-hot-toast** para notificaciones

## Requisitos previos

- Node.js v18+
- Backend Nutrabiotics corriendo en `http://localhost:3001`

## Instalación y arranque

```bash
npm install
npm run dev
```

La app estará disponible en **http://localhost:3000**.

## Credenciales de prueba

| Rol      | Email            | Contraseña |
|----------|------------------|------------|
| Admin    | admin@test.com   | admin123   |
| Médico   | dr@test.com      | dr123      |
| Paciente | patient@test.com | patient123 |

## Rutas de la app

| Ruta                                | Rol      | Descripción                          |
|-------------------------------------|----------|--------------------------------------|
| /login                              | Todos    | Inicio de sesión                     |
| /doctor/prescriptions               | Médico   | Lista de prescripciones creadas      |
| /doctor/prescriptions/new           | Médico   | Crear nueva prescripción             |
| /doctor/prescriptions/[id]          | Médico   | Detalle y descarga PDF               |
| /patient/prescriptions              | Paciente | Mis prescripciones                   |
| /patient/prescriptions/[id]         | Paciente | Detalle, consumir y descargar PDF    |
| /admin                              | Admin    | Dashboard con métricas y gráficas    |
| /admin/prescriptions                | Admin    | Todas las prescripciones             |

## Variables de entorno (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Flujos principales

1. **Login** → detecta rol → redirige a la sección correcta
2. **Médico** → crea prescripciones con ítems → ve el listado → descarga PDF
3. **Paciente** → ve sus prescripciones → marca como consumida → descarga PDF
4. **Admin** → dashboard con KPIs, gráfica de barras (por día) y torta (por estado), tabla completa

## Scripts de npm

```bash
npm run dev     # Servidor de desarrollo en :3000
npm run build   # Build de producción
npm run start   # Servidor de producción (requiere build)
npm run lint    # Linter
npm test        # Tests unitarios de componentes
npm run test:cov # Tests con reporte de cobertura
```

## Variables de entorno (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Despliegue en producción

> TODO: Documentar URLs de producción (Vercel / Netlify / otro).
