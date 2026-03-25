"use client";

import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000";

const ICONS = [
  { color: "#2563EB", bg: "rgba(37,99,235,0.1)", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )},
  { color: "#16A34A", bg: "rgba(22,163,74,0.1)", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )},
  { color: "#D97706", bg: "rgba(217,119,6,0.1)", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2M17.66 17.66l-1.41-1.41M6.34 17.66l1.41-1.41" />
    </svg>
  )},
  { color: "#7C3AED", bg: "rgba(139,92,246,0.1)", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
      <path d="M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
    </svg>
  )},
];

export default function Especialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/specialties/public`)
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => setEspecialidades(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <section id="especialidades" className="section section--bg">
      <div className="section-inner">
        <p>Cargando especialidades...</p>
      </div>
    </section>
  );

  if (error) return (
    <section id="especialidades" className="section section--bg">
      <div className="section-inner">
        <p>No se pudieron cargar las especialidades.</p>
      </div>
    </section>
  );

  return (
    <section id="especialidades" className="section section--bg">
      <div className="section-inner">
        <div className="especialidades-header">
          <div>
            <span className="section-label">Oferta académica</span>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Nuestras especialidades técnicas</h2>
          </div>
          <p className="section-desc" style={{ maxWidth: 400, marginBottom: 0 }}>
            Cuatro carreras técnicas de nivel medio que forman profesionales competentes y certificados.
          </p>
        </div>

        <div className="esp-grid">
          {especialidades.map((esp, i) => {
            const visual = ICONS[i % ICONS.length];
            return (
              <div key={esp.id} className="esp-card">
                <div className="esp-icon" style={{ background: visual.bg }}>{visual.icon}</div>
                <div className="esp-title">{esp.name}</div>
                <div className="esp-desc">{esp.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}