"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isSuperAdmin, getTokenPayload } from "@/lib/auth";
import { getUserPermissions } from "@/lib/api";

// Solo superadmin ve estas secciones base
const SUPERADMIN_NAV = {
  label: "Navegacion",
  items: [
    {
      label: "Resumen",
      href: "/dashboard",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    },
    {
      label: "Usuarios",
      href: "/dashboard/users",
      perm: "manage_users",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    },
    {
      label: "Especialidades",
      href: "/dashboard/specialties",
      perm: "manage_specialties",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    },
    {
      label: "Cursos",
      href: "/dashboard/courses",
      perm: "manage_courses",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
    },
    {
      label: "Secciones",
      href: "/dashboard/sections",
      perm: "manage_sections",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    },
    {
      label: "Inscripciones",
      href: "/dashboard/enrollments",
      perm: "manage_enrollments",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>,
    },
  ],
};

const GESTION_NAV = {
  label: "Gestion",
  items: [
    {
      label: "Postulantes",
      href: "/dashboard/admissions",
      perm: "manage_admissions",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>,
    },
    {
      label: "Becas",
      href: "/dashboard/scholarships",
      perm: "manage_scholarships",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>,
    },
    {
      label: "Boletines",
      href: "/dashboard/grade-reports",
      perm: "view_grade_reports",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    },
    {
      label: "Estado docentes",
      href: "/dashboard/professor-status",
      perm: "set_professor_status",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>,
    },
    {
      label: "Eventos",
      href: "/dashboard/events",
      perm: "manage_events",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    },
    {
      label: "Anuncios",
      href: "/dashboard/announcements",
      perm: "send_announcements",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    },
    {
      label: "Reuniones",
      href: "/dashboard/meetings",
      perm: "schedule_meetings",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>,
    },
    {
      label: "Permisos",
      href: "/dashboard/permissions",
      perm: "manage_permissions",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    },
  ],
};

// Visible solo para rol estudiante — sin perm, controlado por rol
const ESTUDIANTE_NAV = {
  label: "Mi portal",
  items: [
    {
      label: "Mi seccion",
      href: "/dashboard/mi-seccion",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    },
    {
      label: "Mis cursos",
      href: "/dashboard/mis-cursos",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
    },
    {
      label: "Mi asistencia",
      href: "/dashboard/mi-asistencia",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
    },
    {
      label: "Mis notas",
      href: "/dashboard/mis-notas",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    },
  ],
};

const PERFIL_ITEM = {
  label: "Mi perfil",
  href: "/dashboard/perfil",
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
};

function filterByPerms(items, codes) {
  return items.filter((item) => !item.perm || codes.has(item.perm));
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [navGroups, setNavGroups] = useState(null); // null = cargando

  useEffect(() => {
    if (isSuperAdmin()) {
      setNavGroups([
        { label: "Navegacion", items: SUPERADMIN_NAV.items },
        { label: "Gestion",    items: GESTION_NAV.items },
        { label: "Cuenta",     items: [PERFIL_ITEM] },
      ]);
      return;
    }

    const payload = getTokenPayload();
    const uid     = payload?.sub;
    const roles   = payload?.roles ?? [];

    // Estudiante: solo ve su portal + perfil
    if (roles.includes("estudiante")) {
      setNavGroups([
        ESTUDIANTE_NAV,
        { label: "Cuenta", items: [PERFIL_ITEM] },
      ]);
      return;
    }

    // Admin: fetch permisos y filtra
    if (!uid) {
      setNavGroups([{ label: "Cuenta", items: [PERFIL_ITEM] }]);
      return;
    }

    getUserPermissions(uid)
      .then((perms) => {
        const codes = new Set(perms.map((p) => p.code));
        const nav   = filterByPerms(SUPERADMIN_NAV.items.filter((i) => i.perm), codes);
        const gest  = filterByPerms(GESTION_NAV.items, codes);

        const groups = [];
        if (nav.length)  groups.push({ label: "Navegacion", items: nav });
        if (gest.length) groups.push({ label: "Gestion",    items: gest });
        groups.push({ label: "Cuenta", items: [PERFIL_ITEM] });

        setNavGroups(groups);
      })
      .catch(() => {
        setNavGroups([{ label: "Cuenta", items: [PERFIL_ITEM] }]);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside className="db-sidebar">
      {/* Brand */}
      <div className="db-sidebar-brand">
        <div className="db-sidebar-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <div>
          <div className="db-sidebar-brand-name">CTP Pavas</div>
          <div className="db-sidebar-brand-role">Panel de administracion</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="db-sidebar-nav">
        {navGroups === null ? (
          <div className="db-sidebar-loading">Cargando...</div>
        ) : (
          navGroups.map((group) => (
            <div key={group.label}>
              <div className="db-sidebar-nav-label">{group.label}</div>
              {group.items.map(({ label, href, icon }) => {
                const isActive = href === "/dashboard"
                  ? pathname === href
                  : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`db-sidebar-link${isActive ? " db-sidebar-link--active" : ""}`}
                  >
                    <span className="db-sidebar-link-icon">{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </div>
          ))
        )}
      </nav>

      {/* Footer */}
      <div className="db-sidebar-footer">
        <Link href="/" className="db-sidebar-footer-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Ver sitio principal
        </Link>
        <button className="db-sidebar-logout" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}