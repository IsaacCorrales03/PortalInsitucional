"use client";

import { useState, useEffect } from "react";
import { getMySection } from "@/lib/api";
import { SectionHeader, InlineAlert, Spinner } from "@/components/dashboard/ui";

const SHIFT_LABELS = { diurna: "Diurna", nocturna: "Nocturna" };

export default function MiSeccionView() {
  const [section,  setSection]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    getMySection()
      .then(setSection)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="db-view">
      <SectionHeader title="Mi sección" />

      {loading ? (
        <div className="db-loading"><Spinner /></div>
      ) : error ? (
        <InlineAlert type="error">{error}</InlineAlert>
      ) : !section ? (
        <InlineAlert type="info">No hay información de sección disponible.</InlineAlert>
      ) : (
        <>
          {/* Encabezado de sección */}
          <div className="db-profile-card">
            <div className="db-profile-info">
              <div className="db-profile-name">{section.section_name}</div>
              <div className="db-profile-role">
                {SHIFT_LABELS[section.shift] ?? section.shift} — {section.year_level}° año
              </div>
              {section.specialty_name && (
                <div className="db-profile-meta">{section.specialty_name}</div>
              )}
            </div>
          </div>

          {/* Profesor(es) */}
          {section.professors?.length > 0 && (
            <div className="db-profile-section">
              <div className="db-profile-section-header">
                <h2 className="db-profile-section-title">Profesores</h2>
              </div>
              <div className="db-profile-fields">
                {section.professors.map((p) => (
                  <div key={p.user_id} className="db-profile-field">
                    <span className="db-profile-field-label">{p.subject ?? "Materia"}</span>
                    <span className="db-profile-field-value">{p.full_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compañeros */}
          {section.students?.length > 0 && (
            <div className="db-profile-section">
              <div className="db-profile-section-header">
                <h2 className="db-profile-section-title">
                  Compañeros ({section.students.length})
                </h2>
              </div>
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Código</th>
                  </tr>
                </thead>
                <tbody>
                  {section.students.map((s) => (
                    <tr key={s.user_id}>
                      <td>{s.full_name}</td>
                      <td>{s.student_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}