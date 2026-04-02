"""
run_scheduler.py
================
Script principal del generador de horarios CTP Pavas.

Aquí se definen todos los datos del centro educativo:
  - Catálogo de cursos
  - Planes de estudio
  - Profesores y su disponibilidad semanal
  - Aulas y su disponibilidad semanal
  - Configuración de secciones

Luego se invocan las funciones del módulo scheduler_generator
para producir y guardar los horarios.
"""

import sys
import time

from app.utils.scheduler_generator import (
    disponibilidad_total,
    disponibilidad_dias,
    disponibilidad_bloques,
    resolver_seccion,
)


# ══════════════════════════════════════════════════════════════════════════════
# CATÁLOGO DE CURSOS
# ══════════════════════════════════════════════════════════════════════════════
# es_tecnica=True  → bloque técnico (tamaño 3 o 6, inicio alineado)
# es_tecnica=False → bloque académico (tamaño 1-3, inicio libre)
# id=8 (Ed. Física) es técnica con reglas especiales (tamaño 2, cualquier inicio)

cursos: dict[int, dict] = {
    1:  {"Nombre": "Español",               "es_tecnica": False},
    2:  {"Nombre": "Matemáticas",           "es_tecnica": False},
    3:  {"Nombre": "Física Matemática",     "es_tecnica": False},
    4:  {"Nombre": "Estudios Sociales",     "es_tecnica": False},
    5:  {"Nombre": "Educación Cívica",      "es_tecnica": False},
    6:  {"Nombre": "Inglés Académico",      "es_tecnica": False},
    7:  {"Nombre": "Educación Musical",     "es_tecnica": False},
    8:  {"Nombre": "Educación Física",      "es_tecnica": True},   # especial: tam=2, gimnasio
    9:  {"Nombre": "Guía",                  "es_tecnica": False},
    10: {"Nombre": "Ética",                 "es_tecnica": False},
    11: {"Nombre": "Biología",              "es_tecnica": False},
    12: {"Nombre": "Química",               "es_tecnica": False},
    13: {"Nombre": "Psicología",            "es_tecnica": False},
    14: {"Nombre": "Tecnologías de Información, Comunicación y Servicios", "es_tecnica": True},
    15: {"Nombre": "Administración y Soporte a Computadoras",              "es_tecnica": True},
    16: {"Nombre": "Programación",          "es_tecnica": True},
    17: {"Nombre": "Inglés Técnico",        "es_tecnica": True},
    18: {"Nombre": "Emprendimiento",        "es_tecnica": True},
    19: {"Nombre": "Configuración y Soporte a Redes", "es_tecnica": True},
    20: {"Nombre": "Tecnologías de la Información",   "es_tecnica": False},
    21: {"Nombre": "Gestión Contable",      "es_tecnica": True},
    22: {"Nombre": "Gestión de Tecnologías Digitales Contables", "es_tecnica": True},
}


# ══════════════════════════════════════════════════════════════════════════════
# PLANES DE ESTUDIO
# ══════════════════════════════════════════════════════════════════════════════
# courses: lista de (id_curso, lecciones_semana)

plan_estudio: dict[int, dict] = {
    1: {
        "name": "Plan Académico 1",
        "courses": [
            (1, 3),   # Español
            (2, 3),   # Matemáticas
            (3, 6),   # Física Matemática
            (4, 2),   # Estudios Sociales
            (5, 1),   # Educación Cívica
            (6, 4),   # Inglés Académico
            (7, 1),   # Educación Musical
            (9, 1),   # Guía
            (10, 1),  # Ética
        ],
    },
    2: {
        "name": "Config y Soporte 1",
        "courses": [
            (14, 6),  # TIC y Servicios
            (15, 12), # Adm. y Soporte a Computadoras
            (16, 12), # Programación
            (17, 6),  # Inglés Técnico
            (8, 2),   # Educación Física
        ],
    },
    3: {
        "name": "Contabilidad 1",
        "courses": [
            (21, 18), # Gestión Contable
            (17, 6),  # Inglés Técnico
            (8, 2),   # Educación Física
            (22, 12), # Gestión de Tecnologías Digitales Contables
        ],
    },
}


# ══════════════════════════════════════════════════════════════════════════════
# PROFESORES Y SU DISPONIBILIDAD
# ══════════════════════════════════════════════════════════════════════════════
# Materias: nombres tal como aparecen en `cursos`
# Disponibilidad: mapa 5×12 (días × lecciones). Usar helpers del módulo.

profesores: dict[int, dict] = {
    1:  {"Nombre": "Martha",    "Materias": ["Español"]},
    2:  {"Nombre": "Marvin",    "Materias": ["Español"]},
    3:  {"Nombre": "Josefa",    "Materias": ["Ética"]},
    4:  {"Nombre": "Zugey",     "Materias": ["Química"]},
    5:  {"Nombre": "Elke",      "Materias": ["Biología"]},
    6:  {"Nombre": "Gaby",      "Materias": ["Física Matemática"]},
    7:  {"Nombre": "Diego",     "Materias": ["Matemáticas"]},
    8:  {"Nombre": "Raul",      "Materias": ["Matemáticas"]},
    9:  {"Nombre": "Natalia",   "Materias": ["Inglés Académico"]},
    10: {"Nombre": "Thelma",    "Materias": ["Inglés Académico"]},
    11: {"Nombre": "Alberto",   "Materias": ["Educación Musical"]},
    12: {"Nombre": "Magaly",    "Materias": ["Educación Física"]},
    13: {"Nombre": "Elizabet",  "Materias": ["Educación Física"]},
    14: {"Nombre": "Yendry",    "Materias": ["Educación Cívica", "Estudios Sociales"]},
    15: {"Nombre": "Alejandro", "Materias": ["Educación Cívica", "Estudios Sociales"]},
    16: {"Nombre": "Heidy",     "Materias": ["Psicología"]},
    17: {"Nombre": "Carlos M.", "Materias": [
        "Tecnologías de Información, Comunicación y Servicios",
        "Administración y Soporte a Computadoras",
        "Programación",
        "Emprendimiento",
        "Configuración y Soporte a Redes",
        "Tecnologías de la Información",
    ]},
    18: {"Nombre": "Keneth C.", "Materias": [
        "Tecnologías de Información, Comunicación y Servicios",
        "Administración y Soporte a Computadoras",
        "Programación",
        "Emprendimiento",
        "Configuración y Soporte a Redes",
        "Tecnologías de la Información",
    ]},
    19: {"Nombre": "William M.", "Materias": [
        "Tecnologías de Información, Comunicación y Servicios",
        "Administración y Soporte a Computadoras",
        "Programación",
        "Emprendimiento",
        "Configuración y Soporte a Redes",
        "Tecnologías de la Información",
    ]},
    20: {"Nombre": "Rebecca T.", "Materias": [
        "Tecnologías de Información, Comunicación y Servicios",
        "Administración y Soporte a Computadoras",
        "Programación",
        "Emprendimiento",
        "Configuración y Soporte a Redes",
        "Tecnologías de la Información",
    ]},
    21: {"Nombre": "Lizeth O.", "Materias": ["Inglés Técnico"]},
    22: {"Nombre": "Henry F.",  "Materias": ["Inglés Técnico"]},
    23: {"Nombre": "Gerardo S.", "Materias": [
        "Gestión Contable",
        "Gestión de Tecnologías Digitales Contables",
    ]},
}

# Disponibilidad de cada profesor — mapa 5×12
# Días: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes
disponibilidad_prof: dict[int, list[list[int]]] = {
    1:  disponibilidad_dias([2, 3]),       # Martha  → solo Miércoles y Jueves
    2:  disponibilidad_dias([0, 1]),       # Marvin  → solo Lunes y Martes
    3:  disponibilidad_total(),
    4:  disponibilidad_total(),
    5:  disponibilidad_total(),
    6:  disponibilidad_total(),
    7:  disponibilidad_total(),
    8:  disponibilidad_total(),
    9:  disponibilidad_total(),
    10: disponibilidad_total(),
    11: disponibilidad_total(),
    12: disponibilidad_total(),
    13: disponibilidad_total(),
    14: disponibilidad_total(),
    15: disponibilidad_total(),
    16: disponibilidad_total(),
    17: disponibilidad_total(),
    18: disponibilidad_total(),
    19: disponibilidad_total(),
    20: disponibilidad_dias([0, 1]),       # Rebecca → solo Lunes y Martes
    21: disponibilidad_total(),
    22: disponibilidad_total(),
    23: disponibilidad_total(),
}


# ══════════════════════════════════════════════════════════════════════════════
# AULAS Y SU DISPONIBILIDAD
# ══════════════════════════════════════════════════════════════════════════════
# Tipos de aula y reglas de asignación:
#   "naranja"      → Aulas Naranja 1-6        (solo técnicas)
#   "verde"        → Aulas Verdes 1-6         (solo académicas)
#   "lab_verde"    → Laboratorios Verdes 1-6  (solo técnicas)
#   "lab_naranja"  → Laboratorios Naranja 1-6 (solo técnicas)
#   "especial"     → Aula Especial            (académicas)
#   "gimnasio"     → Gimnasio                 (solo Ed. Física)
#
# Para restringir un aula usa disponibilidad_dias() o disponibilidad_bloques().
# Ejemplo — Gimnasio cerrado el viernes:
#   "disponibilidad": disponibilidad_dias([0, 1, 2, 3])

aulas: dict[str, dict] = {}

for i in range(1, 7):
    aulas[f"naranja_{i}"]     = {"tipo": "naranja",     "Nombre": f"Aula Naranja {i}",          "disponibilidad": disponibilidad_total()}
    aulas[f"verde_{i}"]       = {"tipo": "verde",       "Nombre": f"Aula Verde {i}",             "disponibilidad": disponibilidad_total()}
    aulas[f"lab_verde_{i}"]   = {"tipo": "lab_verde",   "Nombre": f"Laboratorio Verde {i}",      "disponibilidad": disponibilidad_total()}
    aulas[f"lab_naranja_{i}"] = {"tipo": "lab_naranja", "Nombre": f"Laboratorio Naranja {i}",    "disponibilidad": disponibilidad_total()}

aulas["especial"] = {
    "tipo": "especial",
    "Nombre": "Aula Especial",
    "disponibilidad": disponibilidad_total(),
}
aulas["gimnasio"] = {
    "tipo": "gimnasio",
    "Nombre": "Gimnasio",
    "disponibilidad": disponibilidad_total(),
    # Ejemplo — cerrado el viernes:
    # "disponibilidad": disponibilidad_dias([0, 1, 2, 3]),
}


# ══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE SECCIONES
# ══════════════════════════════════════════════════════════════════════════════
# partes: {nombre_parte: [ids_plan_estudio]}
# profesor_guia: id del profesor asignado a la materia "Guía"

secciones_config: dict[str, dict] = {
    "10-1": {
        "partes": {
            "A": [1, 2],   # Plan Académico 1 + Config y Soporte 1
            "B": [1, 3],   # Plan Académico 1 + Contabilidad 1
        },
        "profesor_guia": 1,
    },
}


# ══════════════════════════════════════════════════════════════════════════════
# EJECUCIÓN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    ARCHIVO_SALIDA = "horario_10-1.txt"

    with open(ARCHIVO_SALIDA, "w", encoding="utf-8") as f_out:
        stdout_original = sys.stdout
        sys.stdout = f_out

        # Encabezado con la configuración utilizada
        print("\n" + "=" * 70)
        print("  CONFIGURACIÓN")
        print("=" * 70)
        print("  Martha  (ID 1) : disponible Miércoles y Jueves únicamente")
        print("  Marvin  (ID 2) : disponible Lunes y Martes únicamente")
        print("  Rebecca (ID 20): disponible Lunes y Martes únicamente")
        print("  → Español solo puede asignarse Miércoles, Jueves (Martha)")
        print("    o Lunes, Martes (Marvin)")
        print()
        print("  AULAS DISPONIBLES")
        print("  Naranja 1-6      → solo técnicas")
        print("  Verde 1-6        → solo académicas")
        print("  Lab. Verde 1-6   → solo técnicas")
        print("  Lab. Naranja 1-6 → solo técnicas")
        print("  Aula Especial    → solo académicas")
        print("  Gimnasio         → solo Ed. Física")
        print()

        t0 = time.time()

        hA, hB = resolver_seccion(
            seccion_id         = "10-1",
            cursos             = cursos,
            profesores         = profesores,
            plan_estudio       = plan_estudio,
            secciones_config   = secciones_config,
            aulas              = aulas,
            disponibilidad_prof= disponibilidad_prof,
            tiempo_limite      = 120.0,
            num_workers        = 8,
            verbose            = False,
        )

        elapsed = time.time() - t0
        estado  = "OK" if hA else "FALLO"
        print(f"\n  [{estado}] Total: {elapsed:.3f}s\n")

        sys.stdout = stdout_original

    if hA:
        print(f"Horario guardado en '{ARCHIVO_SALIDA}'")
    else:
        print("No se encontró solución.")

    return hA, hB


if __name__ == "__main__":
    hA, hB = main()