**ActionMetrics**

Bienvenido a ActionMetrics — un proyecto hecho con cariño para gestionar y evaluar objetivos, habilidades y retroalimentación en entornos educativos o de trabajo. Este repositorio contiene una API backend y una interfaz frontend moderna que, juntas, facilitan la creación, evaluación y reporte de objetivos y desempeño.

**Resumen**:
- **Proyecto**: ActionMetrics
- **Estructura**: `backend-evaluacion/` (API y procesamiento) y `front-evaluacion/` (interfaz Next.js)
- **Tono**: Documentación en español, cálida y clara para que cualquier colaborador se sienta bienvenido.

**Características principales**:
- **Gestión de usuarios**: Registro, autenticación y roles.
- **Evaluaciones**: Crear y gestionar evaluaciones por usuario y habilidad.
- **Objetivos y planes de mejora**: Definir objetivos, tipo y seguimiento.
- **Reportes en PDF**: Generación de reportes y exportación.
- **Retroalimentación**: Registro y gestión de retroalimentaciones por usuario.
- **Gráficas y dashboard**: Visualizaciones para seguimiento de progreso.

**Arquitectura**:
- Backend: Node.js + Express, Sequelize como ORM para PostgreSQL.
- Frontend: Next.js (React) con componentes reutilizables y estado manejado con `zustand`.
- Almacenamiento de archivos: en `public/document/` y `public/reports/`.
# ActionMetrics

Resumen técnico
----------------
ActionMetrics es una plataforma modular para la gestión y evaluación de objetivos, habilidades y retroalimentación, diseñada para entornos educativos y organizacionales. Este repositorio contiene dos artefactos principales:

- `backend-evaluacion/`: API RESTful (Node.js + Express) con persistencia en PostgreSQL mediante Sequelize.
- `front-evaluacion/`: aplicación cliente construida con Next.js (React) orientada a un dashboard de administración y visualización.

Objetivo del documento
----------------------
Este README está redactado desde la perspectiva de un ingeniero de sistemas con foco en:

- explicar la arquitectura y decisiones técnicas,
- describir el layout del código y los puntos de integración,
- documentar cómo desplegar, ejecutar y contribuir de forma profesional.

Visión arquitectónica
---------------------
La aplicación sigue una arquitectura monorepo con separación clara entre backend y frontend. Principios y decisiones clave:

- API RESTful con controladores por recurso (controladores → servicios → modelos).
- Persistencia relacional en PostgreSQL; Sequelize como ORM para migraciones y modelos.
- Autenticación y autorización basadas en middleware (ver `middleware/` y `auth/`).
- Exportación de reportes en PDF y manejo de archivos mediante `public/` + `multer`.
- Frontend server-side rendering y routes dinámicas con Next.js para SEO y rendimiento.

Diagrama lógico (resumido)
-------------------------

- Usuario ←→ API (Auth + Roles)
- API ←→ Base de Datos (Postgres via Sequelize)
- API ←→ Servicios (generación de PDF, AI helpers)
- Frontend ←→ API (REST calls desde `src/services`)

Stack tecnológico
-----------------

- Backend: Node.js, Express, Sequelize, PostgreSQL, Multer, pdfmake, OpenAI SDK (si aplica).
- Frontend: Next.js (React 19), Zustand (estado local), Recharts (gráficas), MUI (UI).
- Dev tools: nodemon, eslint, tailwindcss, electron (opcional para empaquetado).

Estructura del repositorio (detallada)
-------------------------------------

- `backend-evaluacion/`
  - `index.js` — punto de entrada del servidor.
  - `controllers/` — controladores por entidad (orquestan validaciones y llamadas a servicios).
  - `models/` — definiciones Sequelize (entidades principales: `usuario`, `roles`, `evaluacion`, `habilidades`, `objetivo`, `resultado_habilidad`, `retroalimentacion`, `plan_mejora`, `tipo_objetivo`).
  - `routes/` — mapeo de rutas hacia controladores.
  - `services/` — lógica de negocio independiente de HTTP (generación de PDF, composición de reportes, integraciones AI, utilidades de datos).
  - `middleware/` — middlewares de autenticación, manejo de archivos y validaciones.
  - `public/` — almacenamiento público para documentos y reportes generados.
  - `db/` — configuración de Sequelize y conexión a la base de datos.

- `front-evaluacion/`
  - `src/pages/` — páginas Next.js.
  - `src/components/` — componentes UI por dominio (dashboard, evaluaciones, formularios).
  - `src/services/` — cliente HTTP y adaptadores de dominio para llamadas a la API.
  - `src/helper/` — funciones utilitarias y validadores de formularios.

Modelado y relaciones (resumen)
------------------------------
El dominio central modela usuarios, evaluaciones y habilidades. Relaciones típicas:

- `Usuario` 1:N `Evaluacion`
- `Evaluacion` N:M `Habilidad` (resultado por habilidad)
- `Objetivo` vinculado a usuarios y evaluaciones, con estado y tipo (`tipo_objetivo`).
- `Retroalimentacion` asociada a `Usuario` y `Evaluacion`.

Pautas de diseño y convenciones
------------------------------

- Rutas REST usan nomenclatura basada en recursos: `/api/usuarios`, `/api/evaluaciones`, `/api/reportes`.
- Validaciones se realizan en backend y frontend; el backend es la fuente de verdad.
- Errores devueltos en formato JSON con campo `error` y `details` para debugging.
- Logs de acceso con `morgan`; uso de variables de entorno para configuración.

Instalación y ejecución (entorno de desarrollo)
----------------------------------------------

Requisitos mínimos:

- Node.js v16+ (preferible v18+)
- npm o pnpm
- PostgreSQL (local o remoto)

Clonar y ejecutar:

```pwsh
git clone https://github.com/Gabriel-yepez/ActionMetrics.git
cd ActionMetrics
```

Backend (desarrollo):

```pwsh
cd backend-evaluacion
npm install
npm run dev    # inicia con nodemon
```

Frontend (desarrollo):

```pwsh
cd ../front-evaluacion
npm install
npm run dev
```

CI/CD y monitoreo
-----------------

- Integración en CI: lint, tests unitarios, build y despliegue automático en `main` o `release`.
- Monitoreo: logs centralizados (ELK/Graylog) y alertas para errores críticos.

Cómo contribuir profesionalmente
--------------------------------

- Abrir un issue describiendo la propuesta o incidencia.
- Crear branch con prefijo `feature/` o `fix/` y un título claro.
- Incluir pruebas unitarias o de integración para cambios funcionales.
- Añadir documentación técnica si se introduce una nueva integración o esquema de datos.

Contacto
--------

Autor: Gabriel (repositorio: `Gabriel-yepez`). Para discusiones técnicas, abrir issues o crear PRs con descripción técnica detallada.