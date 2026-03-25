"use client";

import { useState, useEffect, useCallback } from "react";
import { getMyGrades } from "@/lib/api";
import {
  SectionHeader,
  InlineAlert,
  Spinner,
  Badge,
  Field,
  Select,
} from "@/components/dashboard/ui";

function gradeVariant(score) {
  if (score === null || score === undefined) return "default";
  if (score >= 70) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

function CourseGradeTable({ course }) {
  return (
    <div className="db-profile-section">
      <div className="db-profile-section-header">
        <h2 className="db-profile-section-title">{course.course_name}</h2>
        {course.final_grade !== null && course.final_grade !== undefined && (
          <Badge variant={gradeVariant(course.final_grade)}>
            Final: {course.final_grade}
          </Badge>
        )}
      </div>
      {course.grades?.length > 0 ? (
        <table className="db-table">
          <thead>
            <tr>
              <th>Evaluación</th>
              <th>Tipo</th>
              <th>Nota</th>
              <th>Peso</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {course.grades.map((g, i) => (
              <tr key={g.grade_id ?? i}>
                <td>{g.name ?? g.description ?? "—"}</td>
                <td>{g.type ?? "—"}</td>
                <td>
                  <Badge variant={gradeVariant(g.score)}>
                    {g.score ?? "—"}
                  </Badge>
                </td>
                <td>{g.weight != null ? `${g.weight}%` : "—"}</td>
                <td>{g.date ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", padding: "0.5rem 0" }}>
          Sin calificaciones registradas.
        </p>
      )}
    </div>
  );
}

export default function MisNotasView() {
  const [grades,     setGrades]     = useState(null);
  const [periods,    setPeriods]    = useState([]);
  const [periodId,   setPeriodId]   = useState("");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetchGrades = useCallback((pid) => {
    setLoading(true);
    setError(null);
    getMyGrades(pid || undefined)
      .then((data) => {
        setGrades(data?.courses ?? data ?? []);
        // Build period list from response meta if available
        if (data?.periods?.length) setPeriods(data.periods);
        if (data?.current_period_id && !pid) setPeriodId(String(data.current_period_id));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchGrades("");
  }, [fetchGrades]);

  function handlePeriodChange(e) {
    const val = e.target.value;
    setPeriodId(val);
    fetchGrades(val);
  }

  const courseList = Array.isArray(grades) ? grades : [];

  return (
    <div className="db-view">
      <SectionHeader title="Mis notas" />

      {periods.length > 1 && (
        <div style={{ maxWidth: "22rem", marginBottom: "1.5rem" }}>
          <Field label="Período">
            <Select value={periodId} onChange={handlePeriodChange}>
              <option value="">Todos los períodos</option>
              {periods.map((p) => (
                <option key={p.period_id} value={p.period_id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}

      {loading ? (
        <div className="db-loading"><Spinner /></div>
      ) : error ? (
        <InlineAlert type="error">{error}</InlineAlert>
      ) : !courseList.length ? (
        <InlineAlert type="info">No hay calificaciones registradas.</InlineAlert>
      ) : (
        courseList.map((c, i) => (
          <CourseGradeTable key={c.course_id ?? i} course={c} />
        ))
      )}
    </div>
  );
}