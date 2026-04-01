"""
Generador de horario CTP Pavas — OR-Tools CP-SAT v3
=====================================================
Modelo CONJUNTO A+B para una sección.

Reglas duras:
  1. Bloques técnicos: tamaños 3 o 6, iniciando en 0,3,6,9 (L1-3, L4-6, L7-9, L10-12)
     Excepción: Ed. Física = bloque de 2, inicio libre.
  2. Bloques académicos: tamaños 1-3, máximo 1 bloque por materia por día (garantiza contigüidad).
  3. Un slot tiene máximo una materia por parte.
  4. Un profesor no puede estar en dos slots al mismo tiempo (entre partes ni dentro).
  5. Exactamente las lecciones requeridas por materia por parte.
  6. Un profesor solo puede ser asignado en slots donde su mapa de disponibilidad lo permite.

Reglas de sincronización A↔B:
  7. Académicas (incluyendo Ed. Física): bloque IDÉNTICO en A y B
     → mismo día, mismo inicio, mismo tamaño, mismo profesor.
  8. Técnicas: los slots ocupados por técnicas deben coincidir en A y B
     → si A tiene técnica en (d, b), B también tiene técnica en (d, b), y viceversa.
     El contenido puede diferir (Programación vs Gestión Contable).

Reglas blandas:
  1. Distribuir materias académicas uniformemente en la semana.
  2. Minimizar huecos entre bloques en el día.

pendiente, un profesor exclusivo por materia, es decir, español solo me lo dará el profesor asignado, no me pueden dar
marvin y marta
"""


from ortools.sat.python import cp_model

# ─── Datos ────────────────────────────────────────────────────────────────────

cursos = {
    1:  {"Nombre": "Español",               "es_tecnica": False},
    2:  {"Nombre": "Matemáticas",           "es_tecnica": False},
    3:  {"Nombre": "Física Matemática",     "es_tecnica": False},
    4:  {"Nombre": "Estudios Sociales",     "es_tecnica": False},
    5:  {"Nombre": "Educación Cívica",      "es_tecnica": False},
    6:  {"Nombre": "Inglés Académico",      "es_tecnica": False},
    7:  {"Nombre": "Educación Musical",     "es_tecnica": False},
    8:  {"Nombre": "Educación Física",      "es_tecnica": True},   # especial: tam=2
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

plan_estudio = {
    1: {"name": "Plan Académico 1", "courses": [
        (1,3),(2,3),(3,6),(4,2),(5,1),(6,4),(7,1),(9,1),(10,1)]},
    2: {"name": "Config y Soporte 1", "courses": [
        (14,6),(15,12),(16,12),(17,6),(8,2)]},
    3: {"name": "Contabilidad 1", "courses": [
        (21,18),(17,6),(8,2),(22,12)]},
}


# ─── Mapa de disponibilidad de profesores ─────────────────────────────────────
# disponibilidad[prof_id] = lista de 5 filas (días L-V) × 12 columnas (lecciones 1-12)
# 1 = disponible, 0 = no disponible
# Por defecto, todos disponibles en todo momento.

def disponibilidad_total():
    """Retorna una matriz 5×12 con todas las celdas disponibles."""
    return [[1] * 12 for _ in range(5)]

def disponibilidad_dias(dias_disponibles: list[int]):
    """
    Retorna una matriz 5×12 donde solo los días indicados (0=Lunes…4=Viernes)
    tienen disponibilidad completa; el resto es 0.
    """
    mapa = [[0] * 12 for _ in range(5)]
    for d in dias_disponibles:
        mapa[d] = [1] * 12
    return mapa

# Construcción del mapa de disponibilidad por profesor
# Formato: disponibilidad_prof[prof_id][dia][leccion_0indexed] → 0 o 1
disponibilidad_prof: dict[int, list[list[int]]] = {
    1:  disponibilidad_dias([2, 3]),   # Martha  → solo Miércoles (2) y Jueves (3)
    2:  disponibilidad_dias([0, 1]),   # Marvin  → solo Lunes (0) y Martes (1)
    3:  disponibilidad_total(),        # Josefa
    4:  disponibilidad_total(),        # Zugey
    5:  disponibilidad_total(),        # Elke
    6:  disponibilidad_total(),        # Gaby
    7:  disponibilidad_total(),        # Diego
    8:  disponibilidad_total(),        # Raul
    9:  disponibilidad_total(),        # Natalia
    10: disponibilidad_total(),        # Thelma
    11: disponibilidad_total(),        # Alberto
    12: disponibilidad_total(),        # Magaly
    13: disponibilidad_total(),        # Elizabet
    14: disponibilidad_total(),        # Yendry
    15: disponibilidad_total(),        # Alejandro
    16: disponibilidad_total(),        # Heidy
    17: disponibilidad_total(),        # Carlos M.
    18: disponibilidad_total(),        # Keneth C.
    19: disponibilidad_total(),        # William M.
    20: disponibilidad_dias([0, 1]),        # Rebecca T.
    21: disponibilidad_total(),        # Lizeth O.
    22: disponibilidad_total(),        # Henry F.
    23: disponibilidad_total(),        # Gerardo S.
}
"""
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ███    ██  ██████      ████████  ██████   ██████   █████  ██████         ┃
┃ ████   ██ ██    ██        ██    ██    ██ ██    ██ ██   ██ ██   ██        ┃
┃ ██ ██  ██ ██    ██        ██    ██    ██ ██    ██ ███████ ██████         ┃
┃ ██  ██ ██ ██    ██        ██    ██    ██ ██    ██ ██   ██ ██   ██        ┃
┃ ██   ████  ██████         ██     ██████   ██████  ██   ██ ██   ██        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
=============================================================================
el codigo acontinuación es una de las aberraciones brutales más increiblemente espantosas de la humanidad, funcionando 
únicamente por lagrimas, sufrimiento y fé, no mover, alterar, modificar, o cambiar nada de todo lo que viene de aquí, hacia abajo
ya que podría provocar que se ponga de mal humor y no vuelva a funcionar nunca, recomiendo encarecidamente no editar absolutamnte nada de 
todo lo que está acá abajo
"""

profesores = {
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
    14: {"Nombre": "Yendry",    "Materias": ["Educación Cívica","Estudios Sociales"]},
    15: {"Nombre": "Alejandro", "Materias": ["Educación Cívica","Estudios Sociales"]},
    16: {"Nombre": "Heidy",     "Materias": ["Psicología"]},
    17: {"Nombre": "Carlos M.", "Materias": [
        "Tecnologías de Información, Comunicación y Servicios",
        "Administración y Soporte a Computadoras","Programación","Emprendimiento",
        "Configuración y Soporte a Redes","Tecnologías de la Información"]},
    18: {"Nombre": "Keneth C.", "Materias": [
        "Tecnologías de Información, Comunicación y Servicios",
        "Administración y Soporte a Computadoras","Programación","Emprendimiento",
        "Configuración y Soporte a Redes","Tecnologías de la Información"]},
    19: {"Nombre": "William M.","Materias": [
        "Tecnologías de Información, Comunicación y Servicios",
        "Administración y Soporte a Computadoras","Programación","Emprendimiento",
        "Configuración y Soporte a Redes","Tecnologías de la Información"]},
    20: {"Nombre": "Rebecca T.","Materias": [
        "Tecnologías de Información, Comunicación y Servicios",
        "Administración y Soporte a Computadoras","Programación","Emprendimiento",
        "Configuración y Soporte a Redes","Tecnologías de la Información"]},
    21: {"Nombre": "Lizeth O.", "Materias": ["Inglés Técnico"]},
    22: {"Nombre": "Henry F.",  "Materias": ["Inglés Técnico"]},
    23: {"Nombre": "Gerardo S.","Materias": [
        "Gestión Contable","Gestión de Tecnologías Digitales Contables"]},
}

secciones_config = {
    "10-1": {
        "partes": {"A": [1, 2], "B": [1, 3]},
        "profesor_guia": 1
    }
}

DIAS      = ["Lunes","Martes","Miércoles","Jueves","Viernes"]
NDAYS     = 5
NBLOCKS   = 12
INICIOS_T = [0, 3, 6, 9]   # inicios permitidos para bloques técnicos


# ─── Helpers ──────────────────────────────────────────────────────────────────

def prof_disponible_en_bloque(prof_id: int, d: int, b_ini: int, tam: int) -> bool:
    """Retorna True si el profesor está disponible en todos los slots del bloque."""
    mapa = disponibilidad_prof[prof_id]
    for offset in range(tam):
        if mapa[d][b_ini + offset] == 0:
            return False
    return True

def profs_para_materia(id_m: int) -> list[int]:
    nombre = cursos[id_m]["Nombre"]
    return [pid for pid, p in profesores.items() if nombre in p["Materias"]]

def profs_validos(id_m: int, seccion_id: str) -> list[int]:
    if cursos[id_m]["Nombre"] == "Guía":
        return [secciones_config[seccion_id]["profesor_guia"]]
    return profs_para_materia(id_m)

def materias_de_parte(seccion_id: str, parte: str) -> dict[int,int]:
    reqs: dict[int,int] = {}
    for pid in secciones_config[seccion_id]["partes"][parte]:
        for id_m, cant in plan_estudio[pid]["courses"]:
            reqs[id_m] = reqs.get(id_m, 0) + cant
    return reqs

def tamanios_validos(id_m: int, cant_total: int) -> list[int]:
    if id_m == 8:                           # Ed. Física: bloque de 2
        return [2]
    if cursos[id_m]["es_tecnica"]:          # técnicas puras: 3 o 6
        return [t for t in [3, 6] if t <= cant_total]
    else:                                   # académicas: 1, 2 o 3
        return [t for t in [1, 2, 3] if t <= cant_total]

def inicios_validos(id_m: int, tam: int) -> list[int]:
    if cursos[id_m]["es_tecnica"] and id_m != 8:
        return [b for b in INICIOS_T if b + tam <= NBLOCKS]
    else:
        return list(range(NBLOCKS - tam + 1))


# Precalcular los IDs de materias del plan base (compartidas)
plan_estudio[1]["courses_ids"] = {id_m for id_m, _ in plan_estudio[1]["courses"]}


# ─── Solver conjunto ──────────────────────────────────────────────────────────

def resolver_seccion(seccion_id: str, verbose: bool = False):
    model = cp_model.CpModel()

    partes      = list(secciones_config[seccion_id]["partes"].keys())   # ["A","B"]
    reqs: dict[str, dict[int,int]] = {
        p: materias_de_parte(seccion_id, p) for p in partes
    }

    # ── Separar materias por categoría ───────────────────────────────────────
    ids_A = set(reqs["A"].keys())
    ids_B = set(reqs["B"].keys())
    ids_comunes = ids_A & ids_B

    compartidas = {id_m for id_m in ids_comunes
                   if not cursos[id_m]["es_tecnica"] or id_m == 8}
    tec_A = {id_m for id_m in ids_A if cursos[id_m]["es_tecnica"] and id_m != 8}
    tec_B = {id_m for id_m in ids_B if cursos[id_m]["es_tecnica"] and id_m != 8}

    # ── Variables ─────────────────────────────────────────────────────────────
    bloques_comp: dict[int, list] = {id_m: [] for id_m in compartidas}
    bloques_tec:  dict[str, dict[int, list]] = {
        "A": {id_m: [] for id_m in tec_A},
        "B": {id_m: [] for id_m in tec_B},
    }

    cobertura: dict[str, dict[tuple, list]] = {
        p: {(d, b): [] for d in range(NDAYS) for b in range(NBLOCKS)}
        for p in partes
    }

    # ── Generar bloques compartidos — filtrar por disponibilidad del prof ─────
    for id_m in compartidas:
        cant = reqs["A"][id_m]
        for ip in profs_validos(id_m, seccion_id):
            for d in range(NDAYS):
                for tam in tamanios_validos(id_m, cant):
                    for b_ini in inicios_validos(id_m, tam):
                        # ← DISPONIBILIDAD: omitir si el prof no está disponible
                        if not prof_disponible_en_bloque(ip, d, b_ini, tam):
                            continue
                        var = model.new_bool_var(
                            f"comp_m{id_m}_p{ip}_d{d}_b{b_ini}_t{tam}"
                        )
                        bloques_comp[id_m].append((var, ip, d, b_ini, tam))
                        for offset in range(tam):
                            cobertura["A"][d, b_ini + offset].append((var, id_m, ip))
                            cobertura["B"][d, b_ini + offset].append((var, id_m, ip))

    # ── Generar bloques técnicos propios — filtrar por disponibilidad ─────────
    for parte in partes:
        for id_m in bloques_tec[parte]:
            cant = reqs[parte][id_m]
            for ip in profs_validos(id_m, seccion_id):
                for d in range(NDAYS):
                    for tam in tamanios_validos(id_m, cant):
                        for b_ini in inicios_validos(id_m, tam):
                            # ← DISPONIBILIDAD: omitir si el prof no está disponible
                            if not prof_disponible_en_bloque(ip, d, b_ini, tam):
                                continue
                            var = model.new_bool_var(
                                f"tec_{parte}_m{id_m}_p{ip}_d{d}_b{b_ini}_t{tam}"
                            )
                            bloques_tec[parte][id_m].append((var, ip, d, b_ini, tam))
                            for offset in range(tam):
                                cobertura[parte][d, b_ini + offset].append((var, id_m, ip))

    # ── Restricciones duras ───────────────────────────────────────────────────

    # R1. Cada slot tiene máximo 1 materia por parte
    for parte in partes:
        for d in range(NDAYS):
            for b in range(NBLOCKS):
                sv = [v for v, _, _ in cobertura[parte][d, b]]
                if sv:
                    model.add(sum(sv) <= 1)

    # R2. Lecciones exactas — compartidas
    for id_m in compartidas:
        cant = reqs["A"][id_m]
        terminos = [var * tam for var, ip, d, b_ini, tam in bloques_comp[id_m]]
        model.add(sum(terminos) == cant)

    # R2b. Lecciones exactas — técnicas propias
    for parte in partes:
        for id_m, cant in reqs[parte].items():
            if id_m in bloques_tec[parte]:
                terminos = [var * tam for var, ip, d, b_ini, tam in bloques_tec[parte][id_m]]
                model.add(sum(terminos) == cant)

    # R3. Un profesor no puede estar en dos slots al mismo tiempo
    cobertura_prof: dict[tuple, list] = {}
    for id_m in compartidas:
        for var, ip, d, b_ini, tam in bloques_comp[id_m]:
            for offset in range(tam):
                key = (ip, d, b_ini + offset)
                cobertura_prof.setdefault(key, []).append(var)
    for parte in partes:
        for id_m in bloques_tec[parte]:
            for var, ip, d, b_ini, tam in bloques_tec[parte][id_m]:
                for offset in range(tam):
                    key = (ip, d, b_ini + offset)
                    cobertura_prof.setdefault(key, []).append(var)

    for vars_slot in cobertura_prof.values():
        if len(vars_slot) > 1:
            model.add(sum(vars_slot) <= 1)

    # R4. Máximo 1 bloque por materia por día
    for id_m in compartidas:
        for d in range(NDAYS):
            vd = [var for var, ip, dd, b_ini, tam in bloques_comp[id_m] if dd == d]
            if vd:
                model.add(sum(vd) <= 1)
    for parte in partes:
        for id_m in bloques_tec[parte]:
            for d in range(NDAYS):
                vd = [var for var, ip, dd, b_ini, tam in bloques_tec[parte][id_m] if dd == d]
                if vd:
                    model.add(sum(vd) <= 1)

    # R5. SINCRONIZACIÓN TÉCNICAS A↔B
    slot_tec: dict[str, dict[tuple, object]] = {p: {} for p in partes}

    for parte in partes:
        for d in range(NDAYS):
            for b in range(NBLOCKS):
                tec_vars = [
                    var
                    for id_m in bloques_tec[parte]
                    for var, ip, dd, b_ini, tam in bloques_tec[parte][id_m]
                    if dd == d and b_ini <= b < b_ini + tam
                ]
                v = model.new_bool_var(f"slot_tec_{parte}_d{d}_b{b}")
                if tec_vars:
                    model.add(sum(tec_vars) >= v)
                    model.add_bool_or(tec_vars + [v.negated()])
                else:
                    model.add(v == 0)
                slot_tec[parte][d, b] = v

    for d in range(NDAYS):
        for b in range(NBLOCKS):
            model.add(slot_tec["A"][d, b] == slot_tec["B"][d, b])

    # ── Restricciones blandas ─────────────────────────────────────────────────
    penalties = []

    # P1. Distribuir académicas uniformemente en la semana
    for id_m in compartidas:
        cant = reqs["A"][id_m]
        if cant <= 1:
            continue
        dias_activos = []
        for d in range(NDAYS):
            vd = [var for var, ip, dd, b_ini, tam in bloques_comp[id_m] if dd == d]
            if not vd:
                continue
            da = model.new_bool_var(f"da_m{id_m}_d{d}")
            model.add(sum(vd) >= da)
            model.add_bool_or(vd + [da.negated()])
            dias_activos.append(da)
        if dias_activos:
            dias_usados = model.new_int_var(0, NDAYS, f"du_m{id_m}")
            model.add(dias_usados == sum(dias_activos))
            deficit = model.new_int_var(0, NDAYS, f"def_m{id_m}")
            model.add(deficit >= min(cant, NDAYS) - dias_usados)
            penalties.append(deficit)

    # P2. Minimizar huecos en el día
    for parte in partes:
        ocupado: dict[tuple, object] = {}
        for d in range(NDAYS):
            for b in range(NBLOCKS):
                sv = [v for v, _, _ in cobertura[parte][d, b]]
                v = model.new_bool_var(f"ocp_{parte}_d{d}_b{b}")
                if sv:
                    model.add(sum(sv) >= v)
                    model.add_bool_or(sv + [v.negated()])
                else:
                    model.add(v == 0)
                ocupado[d, b] = v
        for d in range(NDAYS):
            for b in range(1, NBLOCKS - 1):
                hueco = model.new_bool_var(f"hueco_{parte}_d{d}_b{b}")
                model.add_bool_and([
                    ocupado[d, b-1],
                    ocupado[d, b].negated(),
                    ocupado[d, b+1],
                ]).only_enforce_if(hueco)
                model.add_bool_or([
                    ocupado[d, b-1].negated(),
                    ocupado[d, b],
                    ocupado[d, b+1].negated(),
                ]).only_enforce_if(hueco.negated())
                penalties.append(hueco)

    # ── Función objetivo ──────────────────────────────────────────────────────
    if penalties:
        model.minimize(sum(penalties))

    # ── Resolver ──────────────────────────────────────────────────────────────
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 120.0
    solver.parameters.num_search_workers  = 8
    solver.parameters.log_search_progress = verbose

    status = solver.solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        print(f"\n[!] Sin solución para {seccion_id}. Status: {solver.status_name(status)}")
        return None, None

    # ── Extraer horarios ──────────────────────────────────────────────────────
    horarios = {p: {dia: {b+1: None for b in range(NBLOCKS)} for dia in DIAS} for p in partes}

    for id_m in compartidas:
        for var, ip, d, b_ini, tam in bloques_comp[id_m]:
            if solver.value(var) == 1:
                for offset in range(tam):
                    entry = {
                        "materia":    cursos[id_m]["Nombre"],
                        "profesor":   profesores[ip]["Nombre"],
                        "prof_id":    ip,
                        "es_tecnica": cursos[id_m]["es_tecnica"],
                    }
                    for p in partes:
                        horarios[p][DIAS[d]][b_ini + offset + 1] = entry

    for parte in partes:
        for id_m in bloques_tec[parte]:
            for var, ip, d, b_ini, tam in bloques_tec[parte][id_m]:
                if solver.value(var) == 1:
                    for offset in range(tam):
                        horarios[parte][DIAS[d]][b_ini + offset + 1] = {
                            "materia":    cursos[id_m]["Nombre"],
                            "profesor":   profesores[ip]["Nombre"],
                            "prof_id":    ip,
                            "es_tecnica": cursos[id_m]["es_tecnica"],
                        }

    # ── Imprimir horarios de clases ───────────────────────────────────────────
    penval = int(solver.objective_value) if penalties else 0
    print(f"\n{'='*70}")
    print(f"  Sección {seccion_id} — modelo conjunto A+B")
    print(f"  Status     : {solver.status_name(status)}")
    print(f"  Tiempo     : {solver.wall_time:.3f}s")
    print(f"  Penaliz.   : {penval}")
    print(f"{'='*70}")

    for parte in partes:
        print(f"\n--- Parte {parte} ---")
        imprimir_horario(horarios[parte])

    verificar_sincronizacion(horarios["A"], horarios["B"])

    # ── Imprimir horarios de profesores ──────────────────────────────────────
    imprimir_horarios_profesores(horarios, partes)

    # ── Verificar disponibilidad ──────────────────────────────────────────────
    verificar_disponibilidad(horarios, partes)

    return horarios["A"], horarios["B"]


# ─── Horarios de profesores ───────────────────────────────────────────────────

def imprimir_horarios_profesores(horarios: dict, partes: list[str]):
    """
    Construye y muestra el horario de cada profesor que tiene al menos
    una asignación, indicando en qué parte(s) está dando clase en cada slot.
    """
    # Recolectar asignaciones por prof: prof_id → día → bloque → lista de (parte, materia)
    asig: dict[int, dict[str, dict[int, list]]] = {}

    for parte in partes:
        for dia in DIAS:
            for b in range(1, NBLOCKS + 1):
                entry = horarios[parte][dia][b]
                if entry is None:
                    continue
                pid = entry["prof_id"]
                if pid not in asig:
                    asig[pid] = {d: {bl: [] for bl in range(1, NBLOCKS+1)} for d in DIAS}
                asig[pid][dia][b].append((parte, entry["materia"]))

    if not asig:
        print("\n[!] No hay asignaciones de profesores.")
        return

    col = 28
    print(f"\n{'='*70}")
    print("  HORARIOS POR PROFESOR")
    print(f"{'='*70}")

    for pid in sorted(asig.keys()):
        nombre = profesores[pid]["Nombre"]
        mapa   = disponibilidad_prof[pid]

        # Contar lecciones totales asignadas
        total_lec = sum(
            1
            for dia_i, dia in enumerate(DIAS)
            for b in range(1, NBLOCKS + 1)
            if asig[pid][dia][b]
        )

        print(f"\n  Profesor: {nombre} (ID {pid})  — {total_lec} lección(es) asignada(s)")

        # Mostrar mapa de disponibilidad resumido
        dias_disp = [DIAS[d][:3] for d in range(NDAYS) if any(mapa[d])]
        print(f"  Disponibilidad: {', '.join(dias_disp) if dias_disp else 'ninguna'}")
        print()

        # Encabezado
        print(f"  {'Lec':<5}", end="")
        for dia in DIAS:
            print(f"{dia:<{col}}", end="")
        print()
        print("  " + "-" * (5 + col * NDAYS))

        for b in range(1, NBLOCKS + 1):
            print(f"  {b:<5}", end="")
            for dia in DIAS:
                asigs = asig[pid][dia][b]
                if not asigs:
                    # Verificar si está disponible pero sin clase, o no disponible
                    d_idx = DIAS.index(dia)
                    if mapa[d_idx][b - 1] == 0:
                        cell = "· no disp"
                    else:
                        cell = ""
                else:
                    # Agrupar partes con la misma materia
                    partes_str = "+".join(p for p, _ in asigs)
                    mat = asigs[0][1]
                    cell = f"[{partes_str}] {mat}"
                    if len(cell) > col - 1:
                        cell = cell[:col - 2] + "…"
                print(f"{cell:<{col}}", end="")
            print()

    print()


# ─── Verificación de disponibilidad ──────────────────────────────────────────

def verificar_disponibilidad(horarios: dict, partes: list[str]):
    """Verifica que ninguna asignación viole el mapa de disponibilidad."""
    errores = []
    for parte in partes:
        for d_idx, dia in enumerate(DIAS):
            for b in range(1, NBLOCKS + 1):
                entry = horarios[parte][dia][b]
                if entry is None:
                    continue
                pid = entry["prof_id"]
                if disponibilidad_prof[pid][d_idx][b - 1] == 0:
                    errores.append(
                        f"  [!] Parte {parte} | {dia} L{b}: "
                        f"{profesores[pid]['Nombre']} asignado fuera de disponibilidad"
                    )
    if errores:
        print("\nErrores de disponibilidad:")
        for e in errores:
            print(e)
    else:
        print("  Disponibilidad OK: ningún profesor asignado fuera de su horario permitido.")


# ─── Verificación de sincronización ──────────────────────────────────────────

def verificar_sincronizacion(horA: dict, horB: dict):
    errores = []
    for dia in DIAS:
        for b in range(1, NBLOCKS + 1):
            eA = horA[dia][b]
            eB = horB[dia][b]
            tA = eA["es_tecnica"] if eA else False
            tB = eB["es_tecnica"] if eB else False

            if tA != tB:
                errores.append(
                    f"  [!] {dia} L{b}: A={'TEC' if tA else 'AC/vacío'} "
                    f"B={'TEC' if tB else 'AC/vacío'} — no sincronizado"
                )
            if eA and eB and not eA["es_tecnica"] and not eB["es_tecnica"]:
                if eA["materia"] != eB["materia"] or eA["profesor"] != eB["profesor"]:
                    errores.append(
                        f"  [!] {dia} L{b}: académica difiere — "
                        f"A={eA['materia']}/{eA['profesor']} "
                        f"B={eB['materia']}/{eB['profesor']}"
                    )
            if eA and eB and eA["es_tecnica"] and eB["es_tecnica"]:
                if eA["materia"] == "Educación Física" or eB["materia"] == "Educación Física":
                    if eA["materia"] != eB["materia"] or eA["profesor"] != eB["profesor"]:
                        errores.append(
                            f"  [!] {dia} L{b}: Ed. Física difiere entre A y B"
                        )

    print()
    if errores:
        print("Errores de sincronización A↔B:")
        for e in errores:
            print(e)
    else:
        print("  Sincronización A↔B OK:")
        print("  - Académicas y Ed. Física idénticas en ambos grupos.")
        print("  - Slots técnicos coinciden en ambos grupos.")


# ─── Impresión de horario de sección ─────────────────────────────────────────

def imprimir_horario(horario: dict):
    col = 22
    print(f"{'Lec':<5}", end="")
    for dia in DIAS:
        print(f"{dia:<{col}}", end="")
    print()
    print("-" * (5 + col * NDAYS))

    for b in range(1, NBLOCKS + 1):
        print(f"{b:<5}", end="")
        for dia in DIAS:
            entry = horario[dia][b]
            if entry is None:
                cell = "---"
            else:
                tag  = "[T]" if entry["es_tecnica"] else "[A]"
                cell = f"{tag} {entry['materia']}"[:col-1]
            print(f"{cell:<{col}}", end="")
        print()

    # verificar contigüidad
    errores = []
    for dia in DIAS:
        por_materia: dict[str, list] = {}
        for b in range(1, NBLOCKS + 1):
            e = horario[dia][b]
            if e:
                por_materia.setdefault(e["materia"], []).append(b)
        for mat, blqs in por_materia.items():
            for i in range(len(blqs)-1):
                if blqs[i+1] != blqs[i] + 1:
                    errores.append(f"  [!] {dia} '{mat}' fragmentada: {blqs}")
                    break
    if errores:
        print("Errores de contigüidad:")
        for e in errores:
            print(e)
    else:
        print("  Contigüidad OK.")


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import time

    print("\n" + "="*70)
    print("  CONFIGURACIÓN DE DISPONIBILIDAD")
    print("="*70)
    print("  Martha  (ID 1): disponible Miércoles y Jueves únicamente")
    print("  Marvin  (ID 2): disponible Lunes y Martes únicamente")
    print("  → Español NO puede asignarse los Viernes")
    print("  Resto de profesores: disponibles toda la semana")
    print()

    t0 = time.time()
    hA, hB = resolver_seccion("10-1", verbose=False)
    elapsed = time.time() - t0
    estado = "OK" if hA else "FALLO"
    print(f"\n  [{estado}] Total: {elapsed:.3f}s\n")