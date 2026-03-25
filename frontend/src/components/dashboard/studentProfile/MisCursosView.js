"use client";

import { useState, useEffect } from "react";
import { getMyCourses } from "@/lib/api";
import { SectionHeader, InlineAlert, Spinner, Badge } from "@/components/dashboard/ui";

const STATUS_LABELS = {
  activo:      "Activo",
  inactivo:    "Inactivo",
  completado:  "Completado",
  en_progreso: "En progreso",
};

const STATUS_VARIANTS = {
  activo:      "success",
  en_progreso: "success",
  completado:  "default",
  inactivo:    "warning",
};

export default function MisCursosView() {
  const [courses, setCourses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getMyCourses()
      .then(setCourses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="db-view">
      <SectionHeader title="Mis cursos" />

      {loading ? (
        <div className="db-loading"><Spinner /></div>
      ) : error ? (
        <InlineAlert type="error">{error}</InlineAlert>
      ) : !courses?.length ? (
        <InlineAlert type="info">No tienes cursos matriculados.</InlineAlert>
      ) : (
        <table className="db-table">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Código</th>
              <th>Créditos</th>
              <th>Profesor</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.course_id ?? c.section_id}>
                <td>{c.course_name}</td>
                <td>{c.course_code ?? "—"}</td>
                <td>{c.credits ?? "—"}</td>
                <td>{c.professor_name ?? "—"}</td>
                <td>
                  {c.status ? (
                    <Badge variant={STATUS_VARIANTS[c.status] ?? "default"}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </Badge>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}