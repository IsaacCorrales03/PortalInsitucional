"use client";

const pageTitles = {
  "/dashboard":              { title: "Resumen general", sub: "Vista general del sistema" },
  "/dashboard/users":        { title: "Usuarios", sub: "Gestión de estudiantes, profesores y administradores" },
  "/dashboard/specialties":  { title: "Especialidades", sub: "Carreras técnicas del colegio" },
  "/dashboard/courses":      { title: "Cursos", sub: "Materias y asignaturas por especialidad" },
  "/dashboard/sections":     { title: "Secciones", sub: "Grupos y asignación de profesores" },
  "/dashboard/enrollments":  { title: "Inscripciones", sub: "Matrícula de estudiantes en secciones" },
};

export default function DashboardTopbar({ pathname }) {
  const info = pageTitles[pathname] ?? { title: "Dashboard", sub: "" };

  return (
    <header className="db-topbar">
      <div>
        <h1 className="db-topbar-title">{info.title}</h1>
        {info.sub && <p className="db-topbar-sub">{info.sub}</p>}
      </div>
      <div className="db-topbar-user">
        <div className="db-topbar-avatar">SA</div>
        <div>
          <div className="db-topbar-name">Super Admin</div>
          <div className="db-topbar-role">superadmin</div>
        </div>
      </div>
    </header>
  );
}