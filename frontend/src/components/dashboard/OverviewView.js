"use client";

import { useEntity } from "@/lib/useEntity";
import { Spinner } from "./ui";

function StatCard({ label, value, icon, color }) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-icon" style={{ background: color }}>{icon}</div>
      <div className="db-stat-value">{value ?? <Spinner size={20} />}</div>
      <div className="db-stat-label">{label}</div>
    </div>
  );
}

export default function OverviewView() {
  const { data: users }         = useEntity("users");
  const { data: courses }       = useEntity("courses");
  const { data: specialties }   = useEntity("specialties");
  const { data: sections }      = useEntity("sections");
  const { data: enrollments }   = useEntity("enrollments");
  const { data: permissions }   = useEntity("permissions");
  const { data: events }        = useEntity("events");
  const { data: announcements } = useEntity("announcements");
  const { data: meetings }      = useEntity("meetings");

  const students     = (users ?? []).filter((u) => u.role === "estudiante").length;
  const professors   = (users ?? []).filter((u) => u.role === "profesor").length;
  const active       = (users ?? []).filter((u) => u.is_active).length;
  const published    = (announcements ?? []).filter((a) => a.is_published).length;

  return (
    <div className="db-view">
      <div className="db-overview-grid">
        {/* Usuarios */}
        <StatCard
          label="Estudiantes"
          value={users ? students : null}
          color="rgba(37,99,235,0.12)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard
          label="Profesores"
          value={users ? professors : null}
          color="rgba(22,163,74,0.12)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
        />
        <StatCard
          label="Usuarios activos"
          value={users ? active : null}
          color="rgba(217,119,6,0.12)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>}
        />

        {/* Académico */}
        <StatCard
          label="Especialidades"
          value={specialties ? specialties.length : null}
          color="rgba(124,58,237,0.12)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
        />
        <StatCard
          label="Cursos"
          value={courses ? courses.length : null}
          color="rgba(6,182,212,0.12)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
        />
        <StatCard
          label="Secciones"
          value={sections ? sections.length : null}
          color="rgba(239,68,68,0.12)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
        />
        <StatCard
          label="Inscripciones"
          value={enrollments ? enrollments.length : null}
          color="rgba(16,185,129,0.12)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>}
        />

        {/* Gestión */}
        <StatCard
          label="Eventos"
          value={events ? events.length : null}
          color="rgba(251,146,60,0.12)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
        <StatCard
          label="Anuncios publicados"
          value={announcements ? published : null}
          color="rgba(236,72,153,0.12)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
        />
        <StatCard
          label="Reuniones"
          value={meetings ? meetings.length : null}
          color="rgba(99,102,241,0.12)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>}
        />
        <StatCard
          label="Permisos"
          value={permissions ? permissions.length : null}
          color="rgba(15,118,110,0.12)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
        />
      </div>
    </div>
  );
}