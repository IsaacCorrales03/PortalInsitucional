# Documentación de Endpoints API Portal Institucional

## Health & Root

### `GET /health`
- **Descripción**: Verifica que el servicio esté en línea
- **Parámetros**: Ninguno
- **Respuesta** (200):
```json
{
  "status": "ok",
  "message": "el servicio está en linea",
  "environment": "development"
}
```

### `GET /`
- **Descripción**: Endpoint raíz de la API
- **Parámetros**: Ninguno
- **Respuesta** (200):
```json
{
  "message": "API Portal Institucional activa"
}
```

### `GET /test-db`
- **Descripción**: Verifica la conexión a la base de datos
- **Parámetros**: Ninguno
- **Respuesta** (200):
```json
{
  "message": "DB conectada"
}
```

---

## Autenticación (`/auth`)

### `POST /auth/login`
- **Descripción**: Autentica un usuario y retorna token JWT
- **Parámetros** (Body - JSON):
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```
- **Respuesta** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```
- **Errores**:
  - `401`: Credenciales inválidas
  - `403`: Usuario inactivo

---

## Administración de Usuarios (`/admin/users`)

### `GET /admin/users`
- **Descripción**: Lista todos los usuarios
- **Autenticación**: Requiere permiso `manage_users`
- **Parámetros**: Ninguno
- **Respuesta** (200):
```json
[
  {
    "id": 1,
    "email": "usuario@example.com",
    "full_name": "Juan Pérez",
    "is_active": true
  }
]
```

### `POST /admin/users/create`
- **Descripción**: Crea un nuevo usuario (la contraseña se genera automáticamente)
- **Autenticación**: Requiere permiso `manage_users`
- **Parámetros** (Body - JSON):
```json
{
  "email": "nuevo@example.com",
  "full_name": "María García",
  "national_id": "12345678",
  "role": "estudiante"  // "profesor" | "estudiante" | "admin"
}
```
- **Respuesta** (200):
```json
{
  "id": 2,
  "email": "nuevo@example.com",
  "role": "estudiante",
  "password": "xY9pQw2mK8vL"
}
```
- **Errores**:
  - `400`: Email o cédula ya registrados
  - `404`: Rol no existe

### `PUT /admin/users/{user_id}`
- **Descripción**: Edita datos de un usuario
- **Autenticación**: Requiere permiso `manage_users`
- **Parámetros** (Query):
  - `user_id` (Path): ID del usuario
  - `full_name` (Query, opcional): Nuevo nombre completo
  - `is_active` (Query, opcional): Estado activo/inactivo
  - `role_name` (Query, opcional): Nuevo rol
- **Respuesta** (200):
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "full_name": "Juan Pérez García",
  "is_active": true
}
```
- **Errores**:
  - `404`: Usuario no encontrado
  - `400`: Rol no existe

### `DELETE /admin/users/{user_id}`
- **Descripción**: Elimina un usuario
- **Autenticación**: Requiere permiso `manage_users`
- **Parámetros**: `user_id` (Path)
- **Respuesta** (200):
```json
{
  "detail": "Usuario nuevo@example.com eliminado"
}
```
- **Errores**:
  - `404`: Usuario no encontrado

---

## Gestión de Cursos (`/admin/courses`)

### `GET /admin/courses`
- **Descripción**: Lista todos los cursos
- **Autenticación**: Requiere permiso `manage_courses`
- **Parámetros**: Ninguno
- **Respuesta** (200):
```json
[
  {
    "id": 1,
    "name": "Matemática I",
    "description": "Álgebra y geometría",
    "specialty_id": 1,
    "year_level": 1
  }
]
```

### `GET /admin/courses/{course_id}`
- **Descripción**: Obtiene un curso específico
- **Autenticación**: Requiere permiso `manage_courses`
- **Parámetros**: `course_id` (Path)
- **Respuesta** (200):
```json
{
  "id": 1,
  "name": "Matemática I",
  "description": "Álgebra y geometría",
  "specialty_id": 1,
  "year_level": 1
}
```
- **Errores**:
  - `404`: Curso no encontrado

### `POST /admin/courses`
- **Descripción**: Crea un nuevo curso
- **Autenticación**: Requiere permiso `manage_courses`
- **Parámetros** (Body - JSON):
```json
{
  "name": "Física II",
  "description": "Electromagnetismo",
  "specialty_id": 1,
  "year_level": 2
}
```
- **Respuesta** (201):
```json
{
  "id": 2,
  "name": "Física II"
}
```
- **Errores**:
  - `404`: Especialidad no encontrada

### `PUT /admin/courses/{course_id}`
- **Descripción**: Actualiza un curso
- **Autenticación**: Requiere permiso `manage_courses`
- **Parámetros** (Body - JSON):
```json
{
  "name": "Física II",
  "description": "Electromagnetismo y óptica",
  "specialty_id": 1,
  "year_level": 2
}
```
- **Respuesta** (200):
```json
{
  "id": 2,
  "name": "Física II",
  "description": "Electromagnetismo y óptica",
  "specialty_id": 1,
  "year_level": 2
}
```
- **Errores**:
  - `404`: Curso o especialidad no encontrados

### `DELETE /admin/courses/{course_id}`
- **Descripción**: Elimina un curso
- **Autenticación**: Requiere permiso `manage_courses`
- **Parámetros**: `course_id` (Path)
- **Respuesta** (200):
```json
{
  "detail": "Curso 'Física II' eliminado"
}
```
- **Errores**:
  - `404`: Curso no encontrado
  - `400`: Curso tiene secciones asociadas

---

## Gestión de Secciones (`/admin/sections`)

### `GET /admin/sections`
- **Descripción**: Lista todas las secciones
- **Autenticación**: Requiere permiso `manage_sections`
- **Parámetros** (Query):
  - `course_id` (opcional): Filtrar por curso
- **Respuesta** (200):
```json
[
  {
    "id": 1,
    "course_id": 1,
    "professor_id": 5,
    "academic_year": "2026",
    "shift": "matutino"
  }
]
```

### `GET /admin/sections/{section_id}`
- **Descripción**: Obtiene una sección específica
- **Autenticación**: Requiere permiso `manage_sections`
- **Parámetros**: `section_id` (Path)
- **Respuesta** (200):
```json
{
  "id": 1,
  "course_id": 1,
  "professor_id": 5,
  "academic_year": "2026",
  "shift": "matutino"
}
```
- **Errores**:
  - `404`: Sección no encontrada

### `POST /admin/sections`
- **Descripción**: Crea una nueva sección
- **Autenticación**: Requiere permiso `manage_sections`
- **Parámetros** (Body - JSON):
```json
{
  "course_id": 1,
  "professor_id": 5,
  "academic_year": "2026",
  "shift": "matutino"
}
```
- **Respuesta** (201):
```json
{
  "id": 1,
  "course_id": 1,
  "professor_id": 5
}
```
- **Errores**:
  - `404`: Curso no encontrado
  - `400`: Profesor no válido

### `PUT /admin/sections/{section_id}`
- **Descripción**: Actualiza una sección
- **Autenticación**: Requiere permiso `manage_sections`
- **Parámetros** (Body - JSON):
```json
{
  "professor_id": 6,
  "academic_year": "2026",
  "shift": "vespertino"
}
```
- **Respuesta** (200):
```json
{
  "id": 1,
  "course_id": 1,
  "professor_id": 6,
  "academic_year": "2026",
  "shift": "vespertino"
}
```
- **Errores**:
  - `404`: Sección no encontrada
  - `400`: Profesor no válido

### `DELETE /admin/sections/{section_id}`
- **Descripción**: Elimina una sección
- **Autenticación**: Requiere permiso `manage_sections`
- **Parámetros**: `section_id` (Path)
- **Respuesta** (200):
```json
{
  "detail": "Sección 1 eliminada"
}
```
- **Errores**:
  - `404`: Sección no encontrada

---

## Gestión de Inscripciones (`/admin/enrollments`)

### `GET /admin/enrollments`
- **Descripción**: Lista todas las inscripciones
- **Autenticación**: Requiere permiso `manage_enrollments`
- **Parámetros** (Query):
  - `section_id` (opcional): Filtrar por sección
  - `user_id` (opcional): Filtrar por usuario
- **Respuesta** (200):
```json
[
  {
    "user_id": 10,
    "section_id": 1,
    "enrolled_at": "2026-03-15T10:30:00",
    "status": "activo"
  }
]
```

### `GET /admin/enrollments/{user_id}/{section_id}`
- **Descripción**: Obtiene una inscripción específica
- **Autenticación**: Requiere permiso `manage_enrollments`
- **Parámetros**: 
  - `user_id` (Path)
  - `section_id` (Path)
- **Respuesta** (200):
```json
{
  "user_id": 10,
  "section_id": 1,
  "enrolled_at": "2026-03-15T10:30:00",
  "status": "activo"
}
```
- **Errores**:
  - `404`: Inscripción no encontrada

### `POST /admin/enrollments`
- **Descripción**: Inscribe un estudiante en una sección
- **Autenticación**: Requiere permiso `manage_enrollments`
- **Parámetros** (Body - JSON):
```json
{
  "user_id": 10,
  "section_id": 1
}
```
- **Respuesta** (201):
```json
{
  "user_id": 10,
  "section_id": 1,
  "enrolled_at": "2026-03-15T10:30:00",
  "status": "activo"
}
```
- **Errores**:
  - `400`: Usuario no es estudiante o ya está inscrito
  - `404`: Sección no encontrada

### `PUT /admin/enrollments/{user_id}/{section_id}`
- **Descripción**: Actualiza el estado de una inscripción
- **Autenticación**: Requiere permiso `manage_enrollments`
- **Parámetros** (Body - JSON):
```json
{
  "status": "aprobado"  // "activo" | "retirado" | "aprobado" | "reprobado"
}
```
- **Respuesta** (200):
```json
{
  "user_id": 10,
  "section_id": 1,
  "enrolled_at": "2026-03-15T10:30:00",
  "status": "aprobado"
}
```
- **Errores**:
  - `400`: Estado inválido
  - `404`: Inscripción no encontrada

### `DELETE /admin/enrollments/{user_id}/{section_id}`
- **Descripción**: Elimina una inscripción (da de baja al estudiante)
- **Autenticación**: Requiere permiso `manage_enrollments`
- **Parámetros**: 
  - `user_id` (Path)
  - `section_id` (Path)
- **Respuesta** (200):
```json
{
  "detail": "Estudiante 10 dado de baja de la sección 1"
}
```
- **Errores**:
  - `404`: Inscripción no encontrada

---

## Asignación de Profesores (`/admin/sections`)

### `PUT /admin/sections/{section_id}/assign_professor`
- **Descripción**: Asigna un profesor a una sección
- **Autenticación**: Requiere permiso `assign_professors`
- **Parámetros** (Body - JSON):
```json
{
  "professor_id": 5
}
```
- **Respuesta** (200):
```json
{
  "section_id": 1,
  "professor_id": 5
}
```
- **Errores**:
  - `404`: Sección no encontrada
  - `400`: Profesor no válido

### `PUT /admin/sections/{section_id}/replace_professor`
- **Descripción**: Reemplaza el profesor de una sección por otro
- **Autenticación**: Requiere permiso `assign_professors`
- **Parámetros** (Body - JSON):
```json
{
  "current_professor_id": 5,
  "replacement_professor_id": 6
}
```
- **Respuesta** (200):
```json
{
  "section_id": 1,
  "previous_professor_id": 5,
  "new_professor_id": 6
}
```
- **Errores**:
  - `404`: Sección no encontrada
  - `400`: Profesor actual no coincide o profesor de reemplazo no válido

---

## Notas Importantes

- **Autenticación**: Los endpoints de admin requieren un token JWT válido en el header `Authorization: Bearer <token>`
- **Permisos**: Cada endpoint valida permisos específicos usando la función `check_permission()`
- **Roles**: Los roles válidos son `profesor`, `estudiante` y `admin`
- **Estados de Inscripción**: `activo`, `retirado`, `aprobado`, `reprobado`
- **Turnos**: `matutino`, `vespertino` (y posiblemente otros)
