# 🏫 PortalInstitucional — Estructura del Repositorio

## Nomenclatura de Microservicios

| Microservicio | Nombre | Responsabilidad |
|---|---|---|
| MS-AUTH | **Leónidas** | Autenticación, roles y permisos |
| MS-HORARIOS | **Chronos** | Generación y gestión de horarios |
| MS-TSE | **Hydra** | Procesos electorales estudiantiles |
| MS-ASISTENCIA | **Heimdall** | Control y auditoría de asistencia |
| MS-CORREO | **Iris** | Mensajería interna |
| MS-NOTAS | **Regulus** | Calificaciones y rendimiento |
| MS-CIRCULARES | **Hermes** | Documentos oficiales y circulares |
| MS-NOTEBOOKLLM | **Orion** | Herramientas IA para profesores |
| MS-CHATBOT | **Shaula** | Asistente inteligente de la plataforma |

---

## Estructura Completa del Repositorio
├── frontend/                          # Next.js — interfaz de usuario
│   ├── public/
│   └── src/
│       ├── app/                       # Rutas y páginas (App Router)
│       ├── components/                # Componentes reutilizables
│       └── lib/   
├── leonidas/                        
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py            # Login, logout, refresh
│   │   │   │   ├── roles.py           # CRUD de roles
│   │   │   │   ├── permisos.py        # CRUD de permisos
│   │   │   │   └── usuarios.py        # Gestión de usuarios
│   │   │   └── deps.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── rol.py
│   │   │   └── usuario.py
│   │   └── main.py
│
├── chronos/                         
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── horarios.py        # CRUD de horarios
│   │   │   │   ├── secciones.py       # Secciones A/B
│   │   │   │   └── disponibilidad.py  # Disponibilidad de profesores
│   │   │   └── deps.py
│   │   ├── schemas/
│   │   │   ├── horario.py
│   │   │   └── seccion.py
│   │   ├── utils/
│   │   │   └── scheduler_generator.py # Solver CP-SAT
│   │   └── main.py
│
├── hydra/                             # MS-TSE — Procesos electorales
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── electoral.py       # Períodos electorales
│   │   │   │   ├── partidos.py        # Partidos y candidatos
│   │   │   │   ├── mesas.py           # Mesas de votación
│   │   │   │   └── votacion.py        # Proceso de voto
│   │   │   └── deps.py
│   │   ├── schemas/
│   │   │   └── electoral.py
│   │   └── main.py
│
├── heimdall/                          
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── asistencia.py      # Registro de asistencia
│   │   │   │   └── reportes.py        # Informes y reportes
│   │   │   └── deps.py
│   │   ├── schemas/
│   │   │   └── attendance.py
│   │   └── main.py
│
├── iris/                              # MS-CORREO — Mensajería interna
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── correos.py         # CRUD de correos
│   │   │   │   ├── grupos.py          # Grupos de distribución
│   │   │   │   └── ws.py           
│   │   │   └── deps.py
│   │   ├── schemas/
│   │   │   └── correo.py
│   │   └── main.py
│
├── regulus/                           # MS-NOTAS — Calificaciones
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── notas.py           # CRUD de notas
│   │   │   │   └── reportes.py        # Reportes de rendimiento
│   │   │   └── deps.py
│   │   ├── schemas/
│   │   │   └── notas.py
│   │   └── main.py
│
├── hermes/                           
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── circulares.py      # CRUD de circulares
│   │   │   │   ├── plantillas.py      # Machotes y plantillas
│   │   │   │   └── firma.py           # Firma digital
│   │   │   └── deps.py
│   │   ├── schemas/
│   │   │   └── circular.py
│   │   ├── storage/                   # Archivos generados (PDFs, etc.)
│   │   └── main.py
│
├── orion/                             # MS-NOTEBOOKLLM — IA
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── material.py        # Subida y gestión de material
│   │   │   │   ├── quizzes.py         # Generación de quizzes
│   │   │   │   └── generacion.py      # Presentaciones, imágenes, 
│   │   │   └── deps.py
│   │   ├── schemas/
│   │   │   └── material.py
│   │   ├── storage/                   # Material subido por profesores
│   │   └── main.py
│
├── shaula/                            # MS-CHATBOT — Asistente inteligente
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   └── chat.py            # Endpoint de conversación
│   │   │   └── deps.py
│   │   ├── schemas/
│   │   │   └── chat.py
│   │   └── main.py
│
├── docker-compose.yml                 # Levanta todos los servicios
├── .env.example                       # Variables de entorno de referencia
├── .gitignore
└── README.md
```

---

## Puertos por Servicio

| Servicio | Puerto |
|---|---|
| Frontend (Next.js) | `3000` |
| Leónidas (AUTH) | `8001` |
| Chronos (HORARIOS) | `8002` |
| Hydra (TSE) | `8003` |
| Heimdall (ASISTENCIA) | `8004` |
| Iris (CORREO) | `8005` |
| Regulus (NOTAS) | `8006` |
| Hermes (CIRCULARES) | `8007` |
| Orion (NOTEBOOKLLM) | `8008` |
| Shaula (CHATBOT) | `8009` |
| PostgreSQL | `5432` |

---

## Notas de Arquitectura

- **Un solo PostgreSQL** con schemas separados por microservicio (`leonidas`, `chronos`, `hydra`, etc.)
- **Comunicación HTTP** para operaciones sincrónicas usuario↔sistema
- **Transactional Outbox** vía Postgres para eventos asincrónicos entre MS
- **Leónidas valida el JWT** en cada request — todos los demás MS llaman a Leónidas antes de procesar
- **Iris** reemplaza el servidor socket de Node.js — WebSockets implementados en FastAPI nativo
- **`shared/auth_client`** es el helper común que todos los MS usan para validar tokens contra Leónidas sin duplicar código
