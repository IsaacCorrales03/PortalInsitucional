# 🏫 CTP Pavas — Arquitectura de Microservicios

---

## 🔐 MS-AUTH — Autenticación, Roles y Permisos

**Propósito:** Gestionar identidades, sesiones y una jerarquía de roles con herencia de permisos.

**Roles base (jerarquía):**
```
SuperAdmin
  └─ Administrativo
       └─ Coordinador Técnico
       └─ Presidente TSE
  └─ Profesor
  └─ Estudiante
       └─ Presidente TSE (hereda también de Estudiante)
```

Los roles superiores heredan todos los permisos de los inferiores. Los roles especiales (TSE, Coordinador) pueden heredar de múltiples ramas.

**Funcionalidades:**
- Registro, login, logout, refresh de tokens (JWT)
- CRUD de roles y definición de permisos por recurso/acción
- Asignación de roles a usuarios
- Middleware de autorización consumible por todos los demás microservicios
- Auditoría de accesos

**Consumidores:** Todos los demás microservicios validan contra este.

---

## 🛠️ ROL: SuperAdmin

No es un microservicio independiente, sino un **rol especial** dentro de MS-AUTH que desbloquea capacidades cross-sistema:

- Acceso directo a la base de datos (panel admin o CLI)
- Gestión de todos los usuarios, roles y microservicios
- Deploy, configuración y mantenimiento del sistema
- Acceso reservado a desarrolladores y personal IT

---

## 📅 MS-HORARIOS — Gestión de Horarios

**Propósito:** Crear, visualizar y administrar horarios de clases mediante el solver CP-SAT.

**Funcionalidades:**
- Generación automática de horarios con restricciones (secciones A/B, disponibilidad de profesores, sincronización de materias)
- CRUD manual de horarios
- Vista por profesor, sección, aula o materia
- Exportación (PDF, iCal)
- Detección de conflictos en tiempo real

**Usuarios principales:** Coordinadores, Administrativos, Profesores (consulta), Estudiantes (consulta)

---

## 🗳️ MS-TSE — Procesos Electorales Estudiantiles

**Propósito:** Gestionar todo el ciclo electoral del Tribunal Supremo de Elecciones estudiantil.

**Funcionalidades:**
- Registro y aprobación/rechazo de partidos políticos y candidatos
- Creación y administración de mesas de votación
- Gestión del padrón electoral (estudiantes habilitados)
- Apertura y cierre de períodos de votación
- Conteo de votos y publicación de resultados
- Auditoría del proceso electoral

**Usuarios principales:** Presidente TSE, Administrativos, Estudiantes (votar/postularse)

---

## 📋 MS-ASISTENCIA — Control de Asistencia

**Propósito:** Registrar y auditar la asistencia de estudiantes y profesores.

**Funcionalidades:**
- Registro de asistencia por clase/fecha
- Consulta de asistencia individual y grupal
- Generación de reportes e informes (PDF/Excel)
- Alertas por ausencias excesivas
- API consumible por MS-NOTAS (asistencia afecta la nota)
- Auditoría y corrección de registros

**Usuarios principales:** Profesores (registrar), Administrativos (auditar), Estudiantes (consultar la propia)

---

## 📧 MS-CORREO — Mensajería Interna

**Propósito:** Sistema de correo interno entre usuarios de la plataforma.

**Funcionalidades:**
- Redactar, enviar y recibir correos
- Bandeja de entrada, enviados, borradores, papelera
- Hilos de conversación
- Adjuntos
- Creación de grupos/listas de distribución para envíos masivos
- Búsqueda y filtrado de mensajes
- Notificaciones en tiempo real

**Usuarios principales:** Todos

---

## 🤖 MS-NOTEBOOKLLM — Herramientas IA para Profesores

**Propósito:** Integración con NotebookLLM para que profesores generen material educativo asistido por IA.

**Funcionalidades:**
- Subida y gestión de material de referencia (PDFs, notas, libros)
- Generación de quizzes y evaluaciones
- Creación de presentaciones y resúmenes
- Generación de imágenes ilustrativas
- Organización del material por materia/unidad

**Usuarios principales:** Profesores, Coordinadores

---

## 📄 MS-CIRCULARES — Documentos Oficiales

**Propósito:** Automatizar la creación, firma y distribución de documentos administrativos oficiales.

**Funcionalidades:**
- Redacción de oficios, folios, actas y circulares mediante plantillas/machotes
- Firma digital automática según jerarquía
- Numeración y foliado automático
- Distribución interna (conecta con MS-CORREO)
- Auditoría de documentos (quién creó, aprobó, distribuyó)
- Repositorio de documentos históricos

**Usuarios principales:** Administrativos, Coordinadores, Director

---

## 📝 MS-NOTAS — Gestión de Calificaciones

**Propósito:** Registrar y calcular la nota oficial de cada estudiante de forma progresiva.

**Funcionalidades:**
- CRUD de notas por rubro (tareas, exámenes, proyectos, participación)
- Cálculo automático de nota ponderada
- Integración con MS-ASISTENCIA (asistencia suma a la nota)
- Vista del estudiante de su propio avance
- Cierre de período y nota final oficial
- Reportes de rendimiento por grupo/materia

**Usuarios principales:** Profesores (gestionar), Estudiantes (consultar), Administrativos (auditar)

---

## 💬 MS-CHATBOT — Asistente Inteligente de la Plataforma

**Propósito:** Asistente conversacional con conocimiento completo del sistema, disponible para todos los usuarios.

**Funcionalidades:**
- Responde preguntas sobre la plataforma (cómo usar funcionalidades, dónde encontrar algo)
- Acceso de solo lectura a todas las APIs según el rol del usuario
- Contexto personalizado: el chatbot sabe quién es el usuario y qué permisos tiene
- Asistencia en trámites comunes (consultar horario, ver notas, encontrar circulares)
- Historial de conversación por sesión

**Usuarios principales:** Todos

---

## 🗺️ Mapa de Dependencias

```
MS-AUTH ◄────────────────── Todos los microservicios (validan permisos aquí)

MS-NOTAS ◄── MS-ASISTENCIA  (la asistencia alimenta la nota)
MS-NOTAS ◄── MS-NOTEBOOKLLM (material de quizzes puede generar rúbricas)

MS-CIRCULARES ──► MS-CORREO  (distribución de documentos)

MS-CHATBOT ──► Todas las APIs (lectura según rol)

MS-TSE ◄── MS-AUTH           (roles TSE específicos)
MS-HORARIOS ◄── MS-AUTH      (roles de coordinador/prof/estudiante)
```

---
