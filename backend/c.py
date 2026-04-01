from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import (
    ProfessorAvailabilitySlot, ProfessorCourse, ProfessorProfile,
    User, Role, Permission, UserRole, RolePermission, Specialty,
    Course, StudyPlan, StudyPlanCourse, Classroom, LessonSlot,
)
from app.core.security import hash_password
import secrets, string
from datetime import time

# =========================
# CONSTANTES
# =========================
TECHNICAL_COURSES = {
    "Tecnologías de Información, Comunicación y Servicios",
    "Administración y Soporte a Computadoras",
    "Programación",
    "Inglés Técnico",
    "Emprendimiento",
    "Configuración y Soporte a Redes",
    "Tecnologías de la Información",
    "Gestión Contable",
    "Gestión de Tecnologías Digitales Contables",
    "Educación Física",
}

# year_level por materia (None = aparece en múltiples años, se hereda del StudyPlan)
COURSE_YEAR_LEVEL = {
    "Tecnologías de Información, Comunicación y Servicios": 1,
    "Programación":                                         1,
    "Emprendimiento":                                       2,
    "Configuración y Soporte a Redes":                      None,  # años 2 y 3
    "Tecnologías de la Información":                        3,
    "Gestión Contable":                                     1,
    "Gestión de Tecnologías Digitales Contables":           1,
    # Las siguientes cruzan múltiples años → None
    "Administración y Soporte a Computadoras":              None,
    "Inglés Técnico":                                       None,
    "Educación Física":                                     None,
}

# =========================
# PLANES TÉCNICOS
# =========================
config_plans = [
    {
        "name": "Config y Soporte 1",
        "year": 1,
        "courses": [
            ("Tecnologías de Información, Comunicación y Servicios", 6),
            ("Administración y Soporte a Computadoras",              12),
            ("Programación",                                          12),
            ("Inglés Técnico",                                        6),
            ("Educación Física",                                      2),
        ],
    },
    {
        "name": "Config y Soporte 2",
        "year": 2,
        "courses": [
            ("Emprendimiento",                         3),
            ("Administración y Soporte a Computadoras", 4),
            ("Configuración y Soporte a Redes",        5),
            ("Inglés Técnico",                         3),
            ("Educación Física",                       2),
        ],
    },
    {
        "name": "Config y Soporte 3",
        "year": 3,
        "courses": [
            ("Inglés Técnico",                          3),
            ("Tecnologías de la Información",            4),
            ("Configuración y Soporte a Redes",         5),
            ("Administración y Soporte a Computadoras", 4),
        ],
    },
]

accounting_plans = [
    {
        "name": "Contabilidad 1",
        "year": 1,
        "courses": [
            ("Gestión Contable",                           18),
            ("Inglés Técnico",                             6),
            ("Educación Física",                           2),
            ("Gestión de Tecnologías Digitales Contables", 12),
        ],
    }
]

# =========================
# LESSON SLOTS
# =========================
def create_lesson_slots(db: Session):
    """
    Inserta los 12 slots de lección con su horario real.
    Idempotente.
    """
    schedule = [
        (1,  time(7, 0),   time(7, 40)),
        (2,  time(7, 40),  time(8, 20)),
        (3,  time(8, 20),  time(9, 0)),
        (4,  time(9, 0),   time(9, 40)),
        (5,  time(9, 40),  time(10, 20)),
        (6,  time(10, 20), time(11, 0)),
        (7,  time(11, 0),  time(11, 40)),
        (8,  time(11, 40), time(12, 20)),
        (9,  time(12, 20), time(13, 0)),
        (10, time(13, 0),  time(13, 40)),
        (11, time(13, 40), time(14, 20)),
        (12, time(14, 20), time(15, 0)),
    ]

    for number, start, end in schedule:
        exists = db.query(LessonSlot).filter(LessonSlot.number == number).first()
        if not exists:
            db.add(LessonSlot(number=number, start_time=start, end_time=end))
            print(f"  Slot L{number}: {start}–{end}")
        else:
            print(f"  Slot L{number}: ya existe")

    db.commit()


# =========================
# CLASSROOMS
# =========================
def create_classrooms(db: Session):
    bases = [
        {"prefix": "Aula Naranja",        "type": "regular",     "capacity": 30},
        {"prefix": "Aula Verde",          "type": "regular",     "capacity": 30},
        {"prefix": "Laboratorio Naranja", "type": "laboratorio", "capacity": 25, "has_computers": True},
        {"prefix": "Laboratorio Verde",   "type": "laboratorio", "capacity": 25, "has_computers": True},
    ]

    for base in bases:
        for i in range(1, 7):
            name = f"{base['prefix']} {i}"
            if not db.query(Classroom).filter(Classroom.name == name).first():
                db.add(Classroom(
                    name=name,
                    type=base["type"],
                    capacity=base["capacity"],
                    has_computers=base.get("has_computers", False),
                    has_projector=True,
                    is_active=True,
                ))
                print(f"  Aula creada: {name}")
            else:
                print(f"  Aula ya existe: {name}")

    especiales = [
        {"name": "Gimnasio",      "type": "gimnasio", "capacity": 50},
        {"name": "Aula especial", "type": "especial", "capacity": 20},
    ]
    for data in especiales:
        if not db.query(Classroom).filter(Classroom.name == data["name"]).first():
            db.add(Classroom(
                name=data["name"],
                type=data["type"],
                capacity=data["capacity"],
                has_projector=True,
                is_active=True,
            ))
            print(f"  Aula creada: {data['name']}")
        else:
            print(f"  Aula ya existe: {data['name']}")

    db.commit()


# =========================
# ROLES
# =========================
def create_roles(db: Session) -> dict:
    role_names = ["superadmin", "admin", "profesor", "estudiante"]
    created = {}

    for name in role_names:
        role = db.query(Role).filter(Role.name == name).first()
        if not role:
            role = Role(name=name, description=f"Rol {name}")
            db.add(role)
            db.commit()
            db.refresh(role)
            print(f"  Rol creado: {name}")
        else:
            print(f"  Rol ya existe: {name}")
        created[name] = role

    return created


# =========================
# SPECIALTIES
# =========================
def create_specialties(db: Session):
    specialties = [
        {
            "name": "Configuración y Soporte",
            "description": (
                "La especialidad Configuración y Soporte a Redes de Comunicación y Sistemas Operativos "
                "forma técnicos capaces de instalar, configurar y mantener redes de comunicación y "
                "sistemas operativos, brindar soporte técnico, garantizar seguridad informática y "
                "resolver problemas en infraestructuras tecnológicas."
            ),
        },
        {
            "name": "Contabilidad",
            "description": (
                "La especialidad Contabilidad forma técnicos capaces de registrar, analizar e interpretar "
                "información financiera, elaborar estados contables, gestionar libros y documentos contables, "
                "y aplicar normas tributarias y de auditoría."
            ),
        },
        {
            "name": "Ejecutivo Comercial y servicio al cliente",
            "description": (
                "La especialidad Ejecutivo Comercial forma profesionales capaces de planificar, gestionar "
                "y ejecutar estrategias de ventas, captar y mantener clientes, negociar contratos y "
                "promocionar productos o servicios."
            ),
        },
        {
            "name": "Electrónica Industrial",
            "description": (
                "Forma técnicos capaces de diseñar, instalar, mantener y reparar sistemas electrónicos "
                "industriales, incluyendo control de maquinaria, automatización y dispositivos electrónicos."
            ),
        },
        {
            "name": "Administración Logística y Distribución",
            "description": (
                "Forma profesionales capaces de planificar, organizar y supervisar procesos administrativos "
                "y logísticos, optimizar recursos, coordinar inventarios y gestionar cadenas de suministro."
            ),
        },
        {
            "name": "Secretariado Ejecutivo",
            "description": (
                "Forma profesionales capaces de gestionar la comunicación y organización administrativa "
                "de empresas, manejar documentación, coordinar agendas y apoyar en la toma de decisiones."
            ),
        },
        {
            "name": "Desarrollo Web",
            "description": (
                "Forma técnicos capaces de diseñar, programar y mantener sitios y aplicaciones web, "
                "integrando front-end, back-end y bases de datos, con enfoque en usabilidad, rendimiento "
                "y experiencia de usuario."
            ),
        },
    ]

    for spec in specialties:
        exists = db.query(Specialty).filter(Specialty.name == spec["name"]).first()
        if not exists:
            db.add(Specialty(name=spec["name"], description=spec["description"]))
            db.commit()
            print(f"  Especialidad creada: {spec['name']}")
        else:
            if exists.description != spec["description"]:
                exists.description = spec["description"]
                db.commit()
                print(f"  Especialidad actualizada: {spec['name']}")
            else:
                print(f"  Especialidad ya existe: {spec['name']}")


# =========================
# COURSES
# =========================
def create_courses(db: Session) -> dict:
    course_list = [
        "Español", "Matemáticas", "Física Matemática", "Estudios Sociales",
        "Educación Cívica", "Inglés Académico", "Educación Musical",
        "Educación Física", "Guía", "Ética", "Biología", "Química", "Psicología",
        "Tecnologías de Información, Comunicación y Servicios",
        "Administración y Soporte a Computadoras",
        "Programación", "Inglés Técnico", "Emprendimiento",
        "Configuración y Soporte a Redes", "Tecnologías de la Información",
        "Gestión Contable", "Gestión de Tecnologías Digitales Contables",
    ]

    descriptions = {
        "Español":                                               "Comprensión lectora, redacción, ortografía y literatura.",
        "Matemáticas":                                           "Álgebra, geometría, funciones y resolución de problemas.",
        "Física Matemática":                                     "Aplicación de matemáticas en fenómenos físicos.",
        "Estudios Sociales":                                     "Historia, geografía y sociedad.",
        "Educación Cívica":                                      "Ciudadanía, derechos y deberes.",
        "Inglés Académico":                                      "Comprensión y producción en inglés formal.",
        "Educación Musical":                                     "Teoría musical y expresión artística.",
        "Educación Física":                                      "Actividad física, salud y deporte.",
        "Guía":                                                  "Acompañamiento académico y orientación estudiantil.",
        "Ética":                                                 "Valores, moral y toma de decisiones.",
        "Biología":                                              "Seres vivos y procesos biológicos.",
        "Química":                                               "Materia, reacciones y laboratorio.",
        "Psicología":                                            "Conducta humana y procesos mentales.",
        "Tecnologías de Información, Comunicación y Servicios":  "Fundamentos TIC y servicios digitales.",
        "Administración y Soporte a Computadoras":               "Mantenimiento y soporte técnico de equipos.",
        "Programación":                                          "Lógica, algoritmos y desarrollo de software.",
        "Inglés Técnico":                                        "Terminología técnica en inglés.",
        "Emprendimiento":                                        "Creación y gestión de proyectos.",
        "Configuración y Soporte a Redes":                       "Instalación y mantenimiento de redes.",
        "Tecnologías de la Información":                         "Sistemas informáticos y gestión tecnológica.",
        "Gestión Contable":                                      "Procesos contables y financieros.",
        "Gestión de Tecnologías Digitales Contables":            "Herramientas digitales aplicadas a contabilidad.",
    }

    specialty_map = {
        "TEC":  "Configuración y Soporte",
        "CONT": "Contabilidad",
    }
    course_specialty_key = {
        "Programación":                                         "TEC",
        "Administración y Soporte a Computadoras":              "TEC",
        "Configuración y Soporte a Redes":                      "TEC",
        "Tecnologías de la Información":                        "TEC",
        "Tecnologías de Información, Comunicación y Servicios": "TEC",
        "Gestión Contable":                                     "CONT",
        "Gestión de Tecnologías Digitales Contables":           "CONT",
    }

    specialties = {s.name: s.id for s in db.query(Specialty).all()}
    created = {}

    for name in course_list:
        course = db.query(Course).filter(Course.name == name).first()
        desc = descriptions.get(name)
        key = course_specialty_key.get(name)
        specialty_name = specialty_map.get(key) if key else None
        specialty_id = specialties.get(specialty_name) if specialty_name else None
        year_level = COURSE_YEAR_LEVEL.get(name)  # None para académicas y las que cruzan años

        if specialty_name and not specialty_id:
            raise Exception(f"Specialty no existe en DB: {specialty_name}")

        if not course:
            course = Course(
                name=name,
                is_guide=(name == "Guía"),
                is_technical=(name in TECHNICAL_COURSES),
                description=desc,
                specialty_id=specialty_id,
                year_level=year_level,
            )
            db.add(course)
            db.commit()
            db.refresh(course)
            print(f"  Materia creada: {name}")
        else:
            updated = False
            if desc and course.description != desc:
                course.description = desc
                updated = True
            if course.specialty_id != specialty_id:
                course.specialty_id = specialty_id
                updated = True
            if name == "Guía" and not course.is_guide:
                course.is_guide = True
                updated = True
            if course.year_level != year_level:
                course.year_level = year_level
                updated = True
            if updated:
                db.commit()
                db.refresh(course)
                print(f"  Materia actualizada: {name}")
            else:
                print(f"  Materia ya existe: {name}")

        created[name] = course

    return created


# =========================
# STUDY PLANS (ACADÉMICOS)
# =========================
def create_academic_study_plans(db: Session, courses: dict):
    plans = [
        {
            "name": "Plan Académico 1",
            "year": 1,
            "courses": [
                ("Español",           3),
                ("Matemáticas",       3),
                ("Física Matemática", 6),
                ("Estudios Sociales", 2),
                ("Educación Cívica",  1),
                ("Inglés Académico",  4),
                ("Educación Musical", 1),
                ("Guía",              1),
                ("Ética",             1),
            ],
        },
        {
            "name": "Plan Académico 2",
            "year": 2,
            "courses": [
                ("Español",           4),
                ("Matemáticas",       5),
                ("Biología",          3),
                ("Química",           3),
                ("Psicología",        2),
                ("Estudios Sociales", 3),
                ("Educación Cívica",  2),
                ("Inglés Académico",  3),
                ("Educación Musical", 2),
                ("Guía",              1),
                ("Ética",             1),
            ],
        },
        {
            "name": "Plan Académico 3",
            "year": 3,
            "courses": [
                ("Biología",          3),
                ("Psicología",        2),
                ("Estudios Sociales", 3),
                ("Español",           4),
                ("Química",           3),
                ("Matemáticas",       5),
                ("Inglés Académico",  3),
                ("Educación Cívica",  2),
            ],
        },
    ]

    for plan_data in plans:
        plan = db.query(StudyPlan).filter(StudyPlan.name == plan_data["name"]).first()
        if not plan:
            plan = StudyPlan(
                name=plan_data["name"],
                year_level=plan_data["year"],
                specialty_id=None,
            )
            db.add(plan)
            db.commit()
            db.refresh(plan)
            print(f"  Plan creado: {plan.name}")
        else:
            print(f"  Plan ya existe: {plan.name}")

        for course_name, weekly_lessons in plan_data["courses"]:
            course = courses[course_name]

            # Académicas: part=None (ambas partes juntas)
            exists = db.query(StudyPlanCourse).filter(
                StudyPlanCourse.study_plan_id == plan.id,
                StudyPlanCourse.course_id == course.id,
                StudyPlanCourse.part.is_(None),
            ).first()

            if not exists:
                db.add(StudyPlanCourse(
                    study_plan_id=plan.id,
                    course_id=course.id,
                    part=None,
                    weekly_lessons=weekly_lessons,
                ))
                db.commit()
                print(f"    + {course_name} ({weekly_lessons} lec/sem)")
            elif exists.weekly_lessons != weekly_lessons:
                exists.weekly_lessons = weekly_lessons
                db.commit()
                print(f"    ~ {course_name} actualizado a {weekly_lessons} lec/sem")
            else:
                print(f"    · {course_name} ya existe")


# =========================
# STUDY PLANS (TÉCNICOS)
# =========================
def create_specialty_plans(db: Session, courses: dict, specialty_name: str, plans: list):
    specialty = db.query(Specialty).filter(Specialty.name == specialty_name).first()
    if not specialty:
        raise Exception(f"Especialidad no encontrada: {specialty_name}")

    for plan_data in plans:
        plan = db.query(StudyPlan).filter(StudyPlan.name == plan_data["name"]).first()
        if not plan:
            plan = StudyPlan(
                name=plan_data["name"],
                year_level=plan_data["year"],
                specialty_id=specialty.id,
            )
            db.add(plan)
            db.commit()
            db.refresh(plan)
            print(f"  Plan creado: {plan.name}")
        else:
            print(f"  Plan ya existe: {plan.name}")

        for cname, weekly_lessons in plan_data["courses"]:
            course = courses.get(cname)
            if not course:
                print(f"    ⚠ Curso no encontrado: {cname}")
                continue

            # Técnicas: se crean dos filas, una por parte (A y B)
            # Cada parte tendrá su propio profesor asignado en SectionCourse
            for part in ("A", "B"):
                exists = db.query(StudyPlanCourse).filter(
                    StudyPlanCourse.study_plan_id == plan.id,
                    StudyPlanCourse.course_id == course.id,
                    StudyPlanCourse.part == part,
                ).first()

                if not exists:
                    db.add(StudyPlanCourse(
                        study_plan_id=plan.id,
                        course_id=course.id,
                        part=part,
                        weekly_lessons=weekly_lessons,
                    ))
                    print(f"    + {cname} parte {part} ({weekly_lessons} lec/sem)")
                elif exists.weekly_lessons != weekly_lessons:
                    exists.weekly_lessons = weekly_lessons
                    print(f"    ~ {cname} parte {part} actualizado a {weekly_lessons} lec/sem")
                else:
                    print(f"    · {cname} parte {part} ya existe")

        db.commit()


# =========================
# PROFESSORS
# =========================
def generate_password(length: int = 16) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def create_professors(db: Session):
    role = db.query(Role).filter(Role.name == "profesor").first()
    if not role:
        raise Exception("Rol 'profesor' no existe. Ejecuta create_roles() primero.")

    base_data = {
        "Martha":     ["Español"],
        "Marvin":     ["Español"],
        "Josefa":     ["Ética"],
        "Zugey":      ["Química"],
        "Elke":       ["Biología"],
        "Gaby":       ["Física Matemática"],
        "Diego":      ["Matemáticas"],
        "Raul":       ["Matemáticas"],
        "Natalia":    ["Inglés Académico"],
        "Thelma":     ["Inglés Académico"],
        "Alberto":    ["Educación Musical"],
        "Magaly":     ["Educación Física"],
        "Elizabet":   ["Educación Física"],
        "Yendry":     ["Educación Cívica", "Estudios Sociales"],
        "Alejandro":  ["Educación Cívica", "Estudios Sociales"],
        "Heidy":      ["Psicología"],
        "Carlos M.":  [
            "Tecnologías de Información, Comunicación y Servicios",
            "Administración y Soporte a Computadoras",
            "Programación", "Emprendimiento",
            "Configuración y Soporte a Redes",
            "Tecnologías de la Información",
        ],
        "Keneth C.":  [
            "Tecnologías de Información, Comunicación y Servicios",
            "Administración y Soporte a Computadoras",
            "Programación", "Emprendimiento",
            "Configuración y Soporte a Redes",
            "Tecnologías de la Información",
        ],
        "William M.": [
            "Tecnologías de Información, Comunicación y Servicios",
            "Administración y Soporte a Computadoras",
            "Programación", "Emprendimiento",
            "Configuración y Soporte a Redes",
            "Tecnologías de la Información",
        ],
        "Rebecca T.": [
            "Tecnologías de Información, Comunicación y Servicios",
            "Administración y Soporte a Computadoras",
            "Programación", "Emprendimiento",
            "Configuración y Soporte a Redes",
            "Tecnologías de la Información",
        ],
        "Lizeth O.":  ["Inglés Técnico"],
        "Henry F.":   ["Inglés Técnico"],
        "Gerardo S.": ["Gestión Contable", "Gestión de Tecnologías Digitales Contables"],
    }

    all_courses = db.query(Course).all()
    course_map = {c.name: c for c in all_courses}
    missing_courses: set[str] = set()
    created_users: list[tuple[str, str]] = []

    for name, course_names in base_data.items():
        email = f"{name.lower()}@portal.com"

        if db.query(User).filter(User.email == email).first():
            print(f"  Profesor ya existe: {name}")
            continue

        password = generate_password()

        user = User(
            email=email,
            full_name=name,
            national_id=str(secrets.randbelow(10**10)).zfill(10),
            password_hash=hash_password(password),
            is_active=True,
        )
        db.add(user)
        db.flush()

        # Rol
        db.add(UserRole(user_id=user.id, role_id=role.id))

        # Perfil de profesor
        db.add(ProfessorProfile(
            user_id=user.id,
            specialty_area=None,
            current_status="disponible",
        ))

        # Disponibilidad: todos los slots de la semana (días 1–5, lecciones 1–12)
        # La presencia de una fila = disponible en ese slot
        for day in range(1, 6):       # 1=lunes … 5=viernes
            for lesson in range(1, 13):  # 1–12
                db.add(ProfessorAvailabilitySlot(
                    professor_id=user.id,
                    day_of_week=day,
                    lesson_number=lesson,
                ))

        # Materias que puede impartir
        for cname in course_names:
            course = course_map.get(cname)
            if not course:
                missing_courses.add(cname)
                continue
            db.add(ProfessorCourse(professor_id=user.id, course_id=course.id))

        created_users.append((email, password))

    db.commit()

    if created_users:
        print("\n  === PROFESORES CREADOS ===")
        for email, password in created_users:
            print(f"  {email:<35} | {password}")

    if missing_courses:
        print("\n  ⚠ Cursos no encontrados en DB:")
        for m in sorted(missing_courses):
            print(f"  - {m}")


# =========================
# PERMISSIONS
# =========================
def create_permissions(db: Session, super_role: Role):
    all_permissions = {
        "manage_users":         "Gestionar usuarios del sistema",
        "manage_courses":       "Gestionar cursos",
        "manage_sections":      "Gestionar secciones",
        "manage_enrollments":   "Gestionar inscripciones",
        "assign_professors":    "Asignar profesores a secciones",
        "manage_specialties":   "Gestionar especialidades",
        "manage_permissions":   "Gestionar permisos del sistema",
        "manage_events":        "Gestionar eventos institucionales",
        "schedule_meetings":    "Programar reuniones",
        "manage_scholarships":  "Gestionar becas",
        "set_professor_status": "Actualizar estado de docentes",
        "manage_admissions":    "Gestionar admisiones",
        "view_grade_reports":   "Ver boletines de calificaciones",
        "send_announcements":   "Enviar anuncios institucionales",
    }

    for code, description in all_permissions.items():
        perm = db.query(Permission).filter(Permission.code == code).first()
        if not perm:
            perm = Permission(code=code, description=description)
            db.add(perm)
            db.commit()
            db.refresh(perm)
            print(f"  Permiso creado: {code}")
        elif not perm.description:
            perm.description = description
            db.commit()
            print(f"  Descripción actualizada: {code}")
        else:
            print(f"  Permiso ya existe: {code}")

        exists = db.query(RolePermission).filter(
            RolePermission.role_id == super_role.id,
            RolePermission.permission_id == perm.id,
        ).first()
        if not exists:
            db.add(RolePermission(role_id=super_role.id, permission_id=perm.id))
            db.commit()
            print(f"    → asignado a superadmin")


# =========================
# SUPERADMIN USER
# =========================
def create_superadmin_user(db: Session, super_role: Role):
    super_email = "superadmin@portal.com"
    user = db.query(User).filter(User.email == super_email).first()

    if not user:
        password = generate_password()
        user = User(
            email=super_email,
            full_name="Super Admin",
            national_id="0000000000",
            password_hash=hash_password(password),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        db.add(UserRole(user_id=user.id, role_id=super_role.id))
        db.commit()
        print(f"\n  Superadmin creado: {super_email}")
        print(f"  Contraseña:        {password}")
    else:
        print(f"\n  Superadmin ya existe: {super_email}")


# =========================
# ENTRY POINT PRINCIPAL
# =========================
def create_superadmin(db: Session):
    print("\n── Roles ───────────────────────────────────────")
    roles = create_roles(db)

    print("\n── Especialidades ──────────────────────────────")
    create_specialties(db)

    print("\n── Materias ────────────────────────────────────")
    courses = create_courses(db)

    print("\n── Lesson Slots ────────────────────────────────")
    create_lesson_slots(db)

    print("\n── Aulas ───────────────────────────────────────")
    create_classrooms(db)

    print("\n── Planes académicos ───────────────────────────")
    create_academic_study_plans(db, courses)

    print("\n── Planes técnicos: Configuración y Soporte ────")
    create_specialty_plans(db, courses, "Configuración y Soporte", config_plans)

    print("\n── Planes técnicos: Contabilidad ───────────────")
    create_specialty_plans(db, courses, "Contabilidad", accounting_plans)

    print("\n── Profesores ──────────────────────────────────")
    create_professors(db)

    print("\n── Permisos ────────────────────────────────────")
    create_permissions(db, roles["superadmin"])

    print("\n── Usuario superadmin ──────────────────────────")
    create_superadmin_user(db, roles["superadmin"])

    print("\n✅ Inicialización completa.\n")


# =========================
# MAIN
# =========================
if __name__ == "__main__":
    db = next(get_db())
    try:
        create_superadmin(db)
    finally:
        db.close()