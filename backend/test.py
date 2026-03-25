"""
test_admin.py — Suite de tests para /admin
==========================================
Cubre: diagnóstico inicial, seguridad, CRUD completo de
usuarios / cursos / secciones / inscripciones / asignación de profesor.

Características:
  • Pre-limpieza idempotente: borra datos de prueba ANTES de empezar,
    por si quedaron de una ejecución anterior.
  • check() acepta int o tuple de ints como status esperado.
  • skip() marca un test como omitido (no cuenta como fallo).
  • --verbose muestra el body completo de cada llamada.
  • --no-cleanup omite la limpieza final (útil para inspeccionar).
  • --diag-only ejecuta solo el bloque de diagnóstico y sale.

Requisitos:
    pip install requests python-dotenv colorama

Uso:
    python test_admin.py
    python test_admin.py --base-url http://staging:8000
    python test_admin.py --verbose
    python test_admin.py --diag-only        # solo diagnóstico
    python test_admin.py --no-cleanup       # no borrar datos al final
"""

import requests, os, sys, argparse
from dotenv import load_dotenv
from colorama import Fore, Style, init as colorama_init

load_dotenv()
colorama_init(autoreset=True)

# ─── Configuración ────────────────────────────────────────────────────────────
BASE_URL       = "http://localhost:8000"
ADMIN_EMAIL    = "superadmin@portal.com"
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "cherryPSSW_2026")
VERBOSE        = False

# Datos de prueba — emails/cédulas únicos para no colisionar con prod
_TEST_EMAILS = {
    "profesor":    "ztest_profesor@__test__.com",
    "profesor2":   "ztest_profesor2@__test__.com",
    "estudiante":  "ztest_estudiante@__test__.com",
    "estudiante2": "ztest_estudiante2@__test__.com",
}
_TEST_CEDULAS = {
    "profesor":    "ZT-111-TEST",
    "profesor2":   "ZT-444-TEST",
    "estudiante":  "ZT-222-TEST",
    "estudiante2": "ZT-333-TEST",
}

# ─── Helpers de reporte ───────────────────────────────────────────────────────
_results: list[dict] = []

def _record(name: str, passed: bool, detail: str = ""):
    _results.append({"name": name, "passed": passed, "detail": detail})
    icon = f"{Fore.GREEN}✓" if passed else f"{Fore.RED}✗"
    suf  = f"  {Fore.YELLOW}{detail}" if detail else ""
    print(f"  {icon}  {Fore.CYAN}{name}{suf}")

def skip(name: str, reason: str = "prerequisito faltante"):
    _results.append({"name": name, "passed": True, "detail": f"SKIP — {reason}"})
    print(f"  {Fore.YELLOW}⊘  {Fore.CYAN}{name}  {Fore.YELLOW}(skip: {reason})")

def section(title: str):
    print(f"\n{Style.BRIGHT}{Fore.WHITE}{'─'*62}\n  {title}\n{'─'*62}{Style.RESET_ALL}")

def summary() -> bool:
    total  = len(_results)
    passed = sum(1 for r in _results if r["passed"])
    failed = total - passed
    print(f"\n{Style.BRIGHT}{'═'*62}")
    print(f"  RESULTADO: {Fore.GREEN}{passed} OK{Style.RESET_ALL}  "
          f"{Fore.RED}{failed} FAIL{Style.RESET_ALL}  (total {total})")
    if failed:
        print(f"\n{Fore.RED}  Fallos:{Style.RESET_ALL}")
        for r in _results:
            if not r["passed"]:
                print(f"    • {r['name']}: {r['detail']}")
    print(f"{Style.BRIGHT}{'═'*62}{Style.RESET_ALL}\n")
    return failed == 0

def check(name: str, r: requests.Response, expected, note: str = "") -> bool:
    if VERBOSE:
        print(f"    {Fore.WHITE}→ {r.request.method} {r.url} [{r.status_code}]"
              f"\n      {r.text[:500]}{Style.RESET_ALL}")
    valid  = (expected,) if isinstance(expected, int) else tuple(expected)
    passed = r.status_code in valid
    detail = note or (
        f"esperado {expected}, recibido {r.status_code} → {r.text[:250]}"
        if not passed else ""
    )
    _record(name, passed, detail)
    return passed

def check_field(name: str, data: dict, field: str, expected=None) -> bool:
    present  = field in data
    value_ok = True if expected is None else (data.get(field) == expected)
    passed   = present and value_ok
    detail   = ("" if passed else
                f"campo '{field}' ausente" if not present else
                f"'{field}'={data.get(field)!r}, esperado {expected!r}")
    _record(name, passed, detail)
    return passed

# ─── HTTP helpers ─────────────────────────────────────────────────────────────
def no_auth()   -> dict: return {}
def bad_token() -> dict: return {"Authorization": "Bearer INVALID_TOKEN_XYZ"}

def GET   (p, h, **kw): return requests.get   (f"{BASE_URL}{p}", headers=h, **kw)
def POST  (p, h, **kw): return requests.post  (f"{BASE_URL}{p}", headers=h, **kw)
def PUT   (p, h, **kw): return requests.put   (f"{BASE_URL}{p}", headers=h, **kw)
def DELETE(p, h, **kw): return requests.delete(f"{BASE_URL}{p}", headers=h, **kw)

def login_and_get_headers(email: str, password: str) -> dict | None:
    r = requests.post(f"{BASE_URL}/auth/login",
                      json={"email": email, "password": password})
    if r.status_code == 200:
        return {"Authorization": f"Bearer {r.json()['access_token']}"}
    return None

# ─── Estado compartido entre bloques ─────────────────────────────────────────
ctx: dict = {}


# ══════════════════════════════════════════════════════════════════════════════
# DIAGNÓSTICO — se ejecuta primero, muestra el estado real del servidor
# ══════════════════════════════════════════════════════════════════════════════
def run_diagnostics():
    section("DIAGNÓSTICO DEL SERVIDOR")

    # 1. Salud básica
    try:
        r = requests.get(f"{BASE_URL}/", timeout=5)
        _record("Servidor responde", True, f"status {r.status_code}")
    except Exception as e:
        _record("Servidor responde", False, str(e))
        print(f"\n{Fore.RED}  FATAL: servidor no disponible en {BASE_URL}{Style.RESET_ALL}")
        sys.exit(1)

    # 2. Login admin
    r = requests.post(f"{BASE_URL}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if not check("Login admin → 200", r, 200):
        print(f"\n{Fore.RED}  FATAL: login admin falló — "
              f"verifica ADMIN_EMAIL y ADMIN_PASSWORD{Style.RESET_ALL}")
        print(f"  Respuesta: {r.status_code} {r.text}")
        sys.exit(1)

    token = r.json()["access_token"]
    h = {"Authorization": f"Bearer {token}"}
    ctx["admin_headers"] = h

    # 3. Probar un endpoint protegido para confirmar que el token funciona
    r = GET("/admin/users", h)
    if check("GET /admin/users con token válido → 200", r, 200):
        users = r.json()
        _record(f"Lista de usuarios obtenida ({len(users)} usuarios)", True)
    else:
        print(f"\n{Fore.YELLOW}  ADVERTENCIA: el admin no tiene permiso 'manage_users'")
        print(f"  Respuesta: {r.status_code} {r.text}{Style.RESET_ALL}")

    # 4. Verificar que los roles existen
    print(f"\n  {Fore.WHITE}Verificando roles disponibles...{Style.RESET_ALL}")
    for role_name in ("admin", "profesor", "estudiante"):
        r = POST("/admin/users/create", h, json={
            "email": f"__probe_{role_name}@test.com",
            "full_name": f"Probe {role_name}",
            "national_id": f"PROBE-{role_name[:3].upper()}",
            "role": role_name
        })
        if r.status_code in (200, 201):
            uid = r.json().get("id")
            if uid:
                DELETE(f"/admin/users/{uid}", h)   # limpiar inmediatamente
            _record(f"Rol '{role_name}' existe en BD", True)
        elif r.status_code == 404 and "Rol" in r.text:
            _record(f"Rol '{role_name}' existe en BD", False,
                    f"rol '{role_name}' no encontrado en la tabla roles")
        elif r.status_code == 400:
            # email/cedula ya existe de prueba anterior — el rol sí existe
            _record(f"Rol '{role_name}' existe en BD", True, "(ya existía, rol OK)")
        else:
            _record(f"Rol '{role_name}' existe en BD", False,
                    f"respuesta inesperada: {r.status_code} {r.text[:100]}")

    print(f"\n  {Fore.GREEN}Diagnóstico completado.{Style.RESET_ALL}")


# ══════════════════════════════════════════════════════════════════════════════
# PRE-LIMPIEZA — borra restos de ejecuciones anteriores
# ══════════════════════════════════════════════════════════════════════════════
def pre_cleanup():
    section("PRE-LIMPIEZA (restos de ejecuciones anteriores)")
    h = ctx["admin_headers"]

    # Buscar usuarios de prueba por email y borrarlos
    r = GET("/admin/users", h)
    if r.status_code != 200:
        print(f"  {Fore.YELLOW}No se pudo listar usuarios para pre-limpiar{Style.RESET_ALL}")
        return

    all_users = r.json()
    test_emails = set(_TEST_EMAILS.values())

    deleted = 0
    for u in all_users:
        if u.get("email") in test_emails:
            rd = DELETE(f"/admin/users/{u['id']}", h)
            if rd.status_code in (200, 204):
                deleted += 1
                print(f"  {Fore.YELLOW}↩  Eliminado usuario previo: {u['email']}{Style.RESET_ALL}")

    # Cursos de prueba (buscamos por nombre)
    rc = GET("/admin/courses", h)
    if rc.status_code == 200:
        test_course_names = {"[TEST] Programación I", "[TEST] Redes I"}
        for c in rc.json():
            if c.get("name") in test_course_names:
                # primero borrar secciones del curso
                rs = GET("/admin/sections", h, params={"course_id": c["id"]})
                if rs.status_code == 200:
                    for s in rs.json():
                        # borrar inscripciones de la sección
                        ri = GET("/admin/enrollments", h, params={"section_id": s["id"]})
                        if ri.status_code == 200:
                            for e in ri.json():
                                DELETE(f"/admin/enrollments/{e['user_id']}/{e['section_id']}", h)
                        DELETE(f"/admin/sections/{s['id']}", h)
                DELETE(f"/admin/courses/{c['id']}", h)
                print(f"  {Fore.YELLOW}↩  Eliminado curso previo: {c['name']}{Style.RESET_ALL}")

    if deleted == 0:
        print(f"  {Fore.GREEN}Sin restos de ejecuciones anteriores.{Style.RESET_ALL}")


# ══════════════════════════════════════════════════════════════════════════════
# 1. SEGURIDAD
# ══════════════════════════════════════════════════════════════════════════════
def test_security():
    section("1. Seguridad — sin token y token inválido")

    endpoints = [
        ("GET",  "/admin/users"),
        ("POST", "/admin/users/create"),
        ("GET",  "/admin/courses"),
        ("POST", "/admin/courses"),
        ("GET",  "/admin/sections"),
        ("POST", "/admin/sections"),
        ("GET",  "/admin/enrollments"),
        ("POST", "/admin/enrollments"),
    ]
    for method, path in endpoints:
        r = requests.request(method, f"{BASE_URL}{path}",
                             json={"x": 1}, headers=no_auth())
        passed = r.status_code in (401, 403)
        _record(f"Sin token — {method} {path} → 401/403", passed,
                f"recibido {r.status_code}" if not passed else "")

        if method == "GET":
            r = requests.request(method, f"{BASE_URL}{path}", headers=bad_token())
            passed = r.status_code in (401, 403)
            _record(f"Token inválido — {method} {path} → 401/403", passed,
                    f"recibido {r.status_code}" if not passed else "")


# ══════════════════════════════════════════════════════════════════════════════
# 2. USUARIOS
# ══════════════════════════════════════════════════════════════════════════════
def test_users():
    section("2. Usuarios — CRUD + validaciones")
    h = ctx["admin_headers"]

    # ── Crear profesor ────────────────────────────────────────────────────────
    r = POST("/admin/users/create", h, json={
        "email":       _TEST_EMAILS["profesor"],
        "full_name":   "Profesor Test",
        "national_id": _TEST_CEDULAS["profesor"],
        "role":        "teacher"
    })
    if check("Crear profesor → 200", r, (200, 201)):
        d = r.json()
        ctx["profesor_id"]       = d["id"]
        ctx["profesor_password"] = d.get("password")
        check_field("Devuelve password temporal", d, "password")
        check_field("Devuelve role = 'profesor'", d, "role", "profesor")
    else:
        print(f"  {Fore.RED}  ↳ Detalle: {r.text}{Style.RESET_ALL}")

    # ── Crear estudiante 1 ────────────────────────────────────────────────────
    r = POST("/admin/users/create", h, json={
        "email":       _TEST_EMAILS["estudiante"],
        "full_name":   "Estudiante Test",
        "national_id": _TEST_CEDULAS["estudiante"],
        "role":        "estudiante"
    })
    if check("Crear estudiante → 200", r, (200, 201)):
        ctx["estudiante_id"] = r.json()["id"]
    else:
        print(f"  {Fore.RED}  ↳ Detalle: {r.text}{Style.RESET_ALL}")

    # ── Crear estudiante 2 ────────────────────────────────────────────────────
    r = POST("/admin/users/create", h, json={
        "email":       _TEST_EMAILS["estudiante2"],
        "full_name":   "Estudiante Dos",
        "national_id": _TEST_CEDULAS["estudiante2"],
        "role":        "student"
    })
    if r.status_code in (200, 201):
        ctx["estudiante2_id"] = r.json()["id"]

    # ── Validaciones de unicidad ──────────────────────────────────────────────
    r = POST("/admin/users/create", h, json={
        "email":       _TEST_EMAILS["profesor"],   # email duplicado
        "full_name":   "Clon Email",
        "national_id": "ZT-DUP-001",
        "role":        "teacher"
    })
    check("Email duplicado → 400", r, 400)

    r = POST("/admin/users/create", h, json={
        "email":       "dup_cedula@__test__.com",
        "full_name":   "Clon Cédula",
        "national_id": _TEST_CEDULAS["profesor"],  # cédula duplicada
        "role":        "student"
    })
    check("Cédula duplicada → 400", r, 400)

    r = POST("/admin/users/create", h, json={
        "email":       "rolbad@__test__.com",
        "full_name":   "Sin Rol",
        "national_id": "ZT-DUP-002",
        "role":        "rol_que_no_existe"
    })
    check("Rol inexistente → 404", r, 404)

    # ── Listar ────────────────────────────────────────────────────────────────
    r = GET("/admin/users", h)
    if check("Listar usuarios → 200", r, 200):
        _record("Listar usuarios — es lista", isinstance(r.json(), list))

    # ── Editar ────────────────────────────────────────────────────────────────
    if uid := ctx.get("profesor_id"):
        r = PUT(f"/admin/users/{uid}", h, params={"full_name": "Profesor Editado"})
        if check("Editar nombre → 200", r, 200):
            check_field("Nombre actualizado", r.json(), "full_name", "Profesor Editado")

        r = PUT(f"/admin/users/{uid}", h, params={"is_active": "false"})
        if check("Desactivar usuario → 200", r, 200):
            check_field("is_active = False", r.json(), "is_active", False)

        # Restaurar
        PUT(f"/admin/users/{uid}", h, params={"is_active": "true"})

    r = PUT("/admin/users/999999", h, params={"full_name": "Fantasma"})
    check("Editar usuario inexistente → 404", r, 404)

    r = DELETE("/admin/users/999999", h)
    check("Eliminar usuario inexistente → 404", r, 404)

    # ── Login con password temporal ───────────────────────────────────────────
    if pw := ctx.get("profesor_password"):
        ph = login_and_get_headers(_TEST_EMAILS["profesor"], pw)
        if ph:
            ctx["profesor_headers"] = ph
            _record("Login con password temporal → OK", True)
        else:
            _record("Login con password temporal → OK", False, "login falló")


# ══════════════════════════════════════════════════════════════════════════════
# 3. CURSOS
# ══════════════════════════════════════════════════════════════════════════════
def test_courses():
    section("3. Cursos — CRUD + validaciones")
    h = ctx["admin_headers"]

    # ── Crear cursos ──────────────────────────────────────────────────────────
    r = POST("/admin/courses", h, json={
        "name": "[TEST] Programación I", "description": "Intro", "year_level": 1
    })
    if check("Crear curso → 200", r, (200, 201)):
        ctx["course_id"] = r.json()["id"]
    else:
        print(f"  {Fore.RED}  ↳ Detalle: {r.text}{Style.RESET_ALL}")

    r = POST("/admin/courses", h, json={
        "name": "[TEST] Redes I", "year_level": 2
    })
    if r.status_code in (200, 201):
        ctx["course2_id"] = r.json()["id"]

    # ── specialty_id inexistente ──────────────────────────────────────────────
    r = POST("/admin/courses", h, json={"name": "Huérfano", "specialty_id": 999999})
    check("specialty_id inexistente → 404", r, 404)

    # ── Listar ────────────────────────────────────────────────────────────────
    r = GET("/admin/courses", h)
    if check("Listar cursos → 200", r, 200):
        _record("Listar cursos — es lista", isinstance(r.json(), list))

    if cid := ctx.get("course_id"):
        # ── Obtener por id ────────────────────────────────────────────────────
        r = GET(f"/admin/courses/{cid}", h)
        if check("Obtener curso por id → 200", r, 200):
            check_field("Curso tiene 'name'", r.json(), "name")
            check_field("Curso tiene 'id'",   r.json(), "id", cid)

        r = GET("/admin/courses/999999", h)
        check("Obtener curso inexistente → 404", r, 404)

        # ── Editar ────────────────────────────────────────────────────────────
        r = PUT(f"/admin/courses/{cid}", h, json={
            "name": "[TEST] Programación I (v2)", "year_level": 1
        })
        if check("Editar curso → 200", r, 200):
            check_field("Nombre actualizado",
                        r.json(), "name", "[TEST] Programación I (v2)")

        r = PUT("/admin/courses/999999", h, json={"name": "Nada"})
        check("Editar curso inexistente → 404", r, 404)

    # ── Permisos: profesor no puede gestionar cursos ──────────────────────────
    if ph := ctx.get("profesor_headers"):
        r = POST("/admin/courses", ph, json={"name": "No permitido"})
        check("Profesor sin manage_courses → 403", r, 403)
    else:
        skip("Profesor sin manage_courses → 403", "profesor_headers no disponible")


# ══════════════════════════════════════════════════════════════════════════════
# 4. SECCIONES
# ══════════════════════════════════════════════════════════════════════════════
def test_sections():
    section("4. Secciones — CRUD + validaciones")
    h = ctx["admin_headers"]

    if not ctx.get("course_id"):
        skip("Secciones — bloque completo", "course_id no disponible")
        return
    if not ctx.get("profesor_id"):
        skip("Secciones — bloque completo", "profesor_id no disponible")
        return

    cid = ctx["course_id"]
    pid = ctx["profesor_id"]

    # ── Crear secciones ───────────────────────────────────────────────────────
    r = POST("/admin/sections", h, json={
        "course_id": cid, "professor_id": pid,
        "academic_year": "2025", "shift": "diurna"
    })
    if check("Crear sección → 200", r, (200, 201)):
        ctx["section_id"] = r.json()["id"]
    else:
        print(f"  {Fore.RED}  ↳ Detalle: {r.text}{Style.RESET_ALL}")

    r = POST("/admin/sections", h, json={
        "course_id":    ctx.get("course2_id", cid),
        "professor_id": pid,
        "academic_year": "2025", "shift": "nocturna"
    })
    if r.status_code in (200, 201):
        ctx["section2_id"] = r.json()["id"]

    # ── Validaciones ──────────────────────────────────────────────────────────
    r = POST("/admin/sections", h, json={
        "course_id": 999999, "professor_id": pid,
        "academic_year": "2025", "shift": "diurna"
    })
    check("course_id inexistente → 404", r, 404)

    if eid := ctx.get("estudiante_id"):
        r = POST("/admin/sections", h, json={
            "course_id": cid, "professor_id": eid,
            "academic_year": "2025", "shift": "diurna"
        })
        check("professor_id es estudiante → 400", r, 400)

    r = POST("/admin/sections", h, json={
        "course_id": cid, "professor_id": 999999,
        "academic_year": "2025", "shift": "diurna"
    })
    check("professor_id inexistente → 400", r, 400)

    # ── Listar ────────────────────────────────────────────────────────────────
    r = GET("/admin/sections", h)
    check("Listar secciones → 200", r, 200)

    r = GET("/admin/sections", h, params={"course_id": cid})
    check("Listar secciones filtradas por course_id → 200", r, 200)

    if sid := ctx.get("section_id"):
        r = GET(f"/admin/sections/{sid}", h)
        if check("Obtener sección por id → 200", r, 200):
            check_field("Sección tiene 'id'",          r.json(), "id",          sid)
            check_field("Sección tiene 'course_id'",   r.json(), "course_id",   cid)
            check_field("Sección tiene 'professor_id'",r.json(), "professor_id",pid)

        r = GET("/admin/sections/999999", h)
        check("Obtener sección inexistente → 404", r, 404)

        r = PUT(f"/admin/sections/{sid}", h, json={"shift": "nocturna"})
        if check("Editar sección (shift) → 200", r, 200):
            check_field("Shift actualizado", r.json(), "shift", "nocturna")

        r = PUT("/admin/sections/999999", h, json={"shift": "diurna"})
        check("Editar sección inexistente → 404", r, 404)


# ══════════════════════════════════════════════════════════════════════════════
# 5. INSCRIPCIONES
# ══════════════════════════════════════════════════════════════════════════════
def test_enrollments():
    section("5. Inscripciones — CRUD + validaciones (clave compuesta)")
    h = ctx["admin_headers"]

    if not ctx.get("section_id"):
        skip("Inscripciones — bloque completo", "section_id no disponible")
        return
    if not ctx.get("estudiante_id"):
        skip("Inscripciones — bloque completo", "estudiante_id no disponible")
        return

    sid  = ctx["section_id"]
    uid  = ctx["estudiante_id"]
    uid2 = ctx.get("estudiante2_id")

    # ── Inscribir ─────────────────────────────────────────────────────────────
    r = POST("/admin/enrollments", h, json={"user_id": uid, "section_id": sid})
    if check("Inscribir estudiante → 200", r, (200, 201)):
        d = r.json()
        check_field("user_id correcto",        d, "user_id",    uid)
        check_field("section_id correcto",     d, "section_id", sid)
        check_field("status inicial = activo", d, "status",     "activo")

    # ── Duplicado ─────────────────────────────────────────────────────────────
    r = POST("/admin/enrollments", h, json={"user_id": uid, "section_id": sid})
    check("Inscripción duplicada → 400", r, 400)

    # ── No-estudiante ─────────────────────────────────────────────────────────
    if pid := ctx.get("profesor_id"):
        r = POST("/admin/enrollments", h, json={"user_id": pid, "section_id": sid})
        check("Inscribir profesor como estudiante → 400", r, 400)

    # ── Sección inexistente ───────────────────────────────────────────────────
    r = POST("/admin/enrollments", h, json={"user_id": uid, "section_id": 999999})
    check("Sección inexistente → 404", r, 404)

    # ── Estudiante 2 en sección 2 ─────────────────────────────────────────────
    if uid2 and ctx.get("section2_id"):
        r = POST("/admin/enrollments", h,
                 json={"user_id": uid2, "section_id": ctx["section2_id"]})
        check("Inscribir estudiante2 en sección2 → 200", r, (200, 201))

    # ── Listar ────────────────────────────────────────────────────────────────
    r = GET("/admin/enrollments", h)
    if check("Listar inscripciones → 200", r, 200):
        _record("Listar — es lista", isinstance(r.json(), list))

    r = GET("/admin/enrollments", h, params={"section_id": sid})
    if check("Listar — filtro section_id → 200", r, 200):
        ids = [e["user_id"] for e in r.json()]
        _record("Filtro section_id — contiene al estudiante", uid in ids)

    r = GET("/admin/enrollments", h, params={"user_id": uid})
    if check("Listar — filtro user_id → 200", r, 200):
        sids = [e["section_id"] for e in r.json()]
        _record("Filtro user_id — contiene la sección", sid in sids)

    # ── Obtener por clave compuesta ───────────────────────────────────────────
    r = GET(f"/admin/enrollments/{uid}/{sid}", h)
    if check("Obtener inscripción (user_id/section_id) → 200", r, 200):
        check_field("enrolled_at presente", r.json(), "enrolled_at")

    r = GET("/admin/enrollments/999999/999999", h)
    check("Inscripción inexistente → 404", r, 404)

    # ── Actualizar estado ─────────────────────────────────────────────────────
    for nuevo_status in ("retirado", "aprobado", "reprobado", "activo"):
        r = PUT(f"/admin/enrollments/{uid}/{sid}", h, json={"status": nuevo_status})
        if check(f"Cambiar status → '{nuevo_status}' → 200", r, 200):
            check_field(f"Status = '{nuevo_status}'", r.json(), "status", nuevo_status)

    r = PUT(f"/admin/enrollments/{uid}/{sid}", h, json={"status": "status_inventado"})
    check("Estado inválido → 400", r, 400)

    r = PUT("/admin/enrollments/999999/999999", h, json={"status": "activo"})
    check("Actualizar inscripción inexistente → 404", r, 404)


# ══════════════════════════════════════════════════════════════════════════════
# 6. ASIGNACIÓN DE PROFESOR
# ══════════════════════════════════════════════════════════════════════════════
def test_assign_professor():
    section("6. Asignación de profesor")
    h = ctx["admin_headers"]

    if not ctx.get("section_id") or not ctx.get("profesor_id"):
        skip("Asignación profesor — bloque completo",
             "section_id o profesor_id no disponibles")
        return

    sid = ctx["section_id"]
    pid = ctx["profesor_id"]

    # ── Crear segundo profesor ────────────────────────────────────────────────
    r = POST("/admin/users/create", h, json={
        "email":       _TEST_EMAILS["profesor2"],
        "full_name":   "Profesor Dos",
        "national_id": _TEST_CEDULAS["profesor2"],
        "role":        "profesor"
    })
    if r.status_code in (200, 201):
        ctx["profesor2_id"] = r.json()["id"]

    # ── assign_professor ──────────────────────────────────────────────────────
    r = PUT(f"/admin/sections/{sid}/assign_professor", h, json={"professor_id": pid})
    check("Asignar profesor → 200", r, 200)

    r = PUT(f"/admin/sections/{sid}/assign_professor", h, json={"professor_id": 999999})
    check("Asignar profesor inexistente → 400", r, 400)

    if eid := ctx.get("estudiante_id"):
        r = PUT(f"/admin/sections/{sid}/assign_professor", h,
                json={"professor_id": eid})
        check("Asignar estudiante como profesor → 400", r, 400)

    r = PUT("/admin/sections/999999/assign_professor", h, json={"professor_id": pid})
    check("Asignar a sección inexistente → 404", r, 404)

    # ── replace_professor ─────────────────────────────────────────────────────
    if pid2 := ctx.get("profesor2_id"):
        r = PUT(f"/admin/sections/{sid}/replace_professor", h, json={
            "current_professor_id":     pid,
            "replacement_professor_id": pid2
        })
        if check("Reemplazar profesor → 200", r, 200):
            check_field("new_professor_id correcto",
                        r.json(), "new_professor_id", pid2)
            check_field("previous_professor_id correcto",
                        r.json(), "previous_professor_id", pid)

        # current_professor_id ya no es pid (fue reemplazado por pid2)
        r = PUT(f"/admin/sections/{sid}/replace_professor", h, json={
            "current_professor_id":     pid,    # incorrecto
            "replacement_professor_id": pid
        })
        check("Reemplazar con current incorrecto → 400", r, 400)

        # Restaurar profesor original
        PUT(f"/admin/sections/{sid}/assign_professor", h,
            json={"professor_id": pid})
    else:
        skip("Reemplazar profesor", "profesor2 no se pudo crear")


# ══════════════════════════════════════════════════════════════════════════════
# 7. INTEGRIDAD REFERENCIAL
# ══════════════════════════════════════════════════════════════════════════════
def test_integrity():
    section("7. Integridad referencial")
    h = ctx["admin_headers"]

    # ── Curso con secciones NO se puede borrar ────────────────────────────────
    # DEBE ir antes de borrar secciones
    if cid := ctx.get("course_id"):
        if ctx.get("section_id"):
            r = DELETE(f"/admin/courses/{cid}", h)
            check("Eliminar curso con secciones → 400", r, 400)
        else:
            skip("Eliminar curso con secciones → 400", "section_id no existe")
    else:
        skip("Eliminar curso con secciones → 400", "course_id no existe")

    # ── Eliminar inscripción por clave compuesta ──────────────────────────────
    uid = ctx.get("estudiante_id")
    sid = ctx.get("section_id")
    if uid and sid:
        r = DELETE(f"/admin/enrollments/{uid}/{sid}", h)
        check("Eliminar inscripción → 200", r, 200)

        r = GET(f"/admin/enrollments/{uid}/{sid}", h)
        check("Inscripción eliminada confirmada → 404", r, 404)

    # ── Eliminar sección (cascada sobre inscripciones) ────────────────────────
    if sid2 := ctx.get("section2_id"):
        r = DELETE(f"/admin/sections/{sid2}", h)
        check("Eliminar sección 2 → 200", r, 200)

    # ── Ahora sí se puede borrar course2 ─────────────────────────────────────
    if cid2 := ctx.get("course2_id"):
        r = DELETE(f"/admin/courses/{cid2}", h)
        check("Eliminar curso 2 sin secciones → 200", r, 200)

    # ── Recursos inexistentes ─────────────────────────────────────────────────
    r = DELETE("/admin/users/999999",    h); check("DELETE usuario inexistente → 404",  r, 404)
    r = DELETE("/admin/courses/999999",  h); check("DELETE curso inexistente → 404",    r, 404)
    r = DELETE("/admin/sections/999999", h); check("DELETE sección inexistente → 404",  r, 404)
    r = DELETE("/admin/enrollments/999999/999999", h)
    check("DELETE inscripción inexistente → 404", r, 404)


# ══════════════════════════════════════════════════════════════════════════════
# 8. LIMPIEZA FINAL
# ══════════════════════════════════════════════════════════════════════════════
def post_cleanup():
    section("8. Limpieza final")
    h = ctx["admin_headers"]

    def _del(label: str, path: str):
        r = DELETE(path, h)
        ok = r.status_code in (200, 204, 404)
        _record(f"Limpiar {label}", ok,
                f"status {r.status_code}" if not ok else "")

    # Orden: inscripciones → secciones → cursos → usuarios
    uid  = ctx.get("estudiante_id")
    uid2 = ctx.get("estudiante2_id")
    sid  = ctx.get("section_id")
    sid2 = ctx.get("section2_id")

    if uid  and sid:  DELETE(f"/admin/enrollments/{uid}/{sid}",   h)
    if uid2 and sid2: DELETE(f"/admin/enrollments/{uid2}/{sid2}", h)

    if sid:  _del("sección 1",  f"/admin/sections/{sid}")
    if sid2: _del("sección 2",  f"/admin/sections/{sid2}")

    if cid  := ctx.get("course_id"):  _del("curso 1",  f"/admin/courses/{cid}")
    if cid2 := ctx.get("course2_id"): _del("curso 2",  f"/admin/courses/{cid2}")

    for key, label in [
        ("profesor_id",    "profesor 1"),
        ("profesor2_id",   "profesor 2"),
        ("estudiante_id",  "estudiante 1"),
        ("estudiante2_id", "estudiante 2"),
    ]:
        if v := ctx.get(key):
            _del(label, f"/admin/users/{v}")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
def main():
    global BASE_URL, VERBOSE

    parser = argparse.ArgumentParser(description="Suite de tests /admin")
    parser.add_argument("--base-url",   default=BASE_URL)
    parser.add_argument("--verbose",    action="store_true")
    parser.add_argument("--diag-only",  action="store_true",
                        help="Solo ejecutar diagnóstico y salir")
    parser.add_argument("--no-cleanup", action="store_true",
                        help="No borrar datos de prueba al finalizar")
    args = parser.parse_args()

    BASE_URL = args.base_url.rstrip("/")
    VERBOSE  = args.verbose

    print(f"\n{Style.BRIGHT}{Fore.MAGENTA}{'═'*62}")
    print(f"  Suite de tests — Portal Académico /admin")
    print(f"  Base URL : {BASE_URL}")
    print(f"  Verbose  : {'sí' if VERBOSE else 'no'}")
    print(f"{'═'*62}{Style.RESET_ALL}")

    run_diagnostics()

    if args.diag_only:
        summary()
        sys.exit(0)

    pre_cleanup()
    test_security()
    test_users()
    test_courses()
    test_sections()
    test_enrollments()
    test_assign_professor()
    test_integrity()

    if args.no_cleanup:
        section("8. Limpieza omitida (--no-cleanup)")
    else:
        post_cleanup()

    ok = summary()
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()