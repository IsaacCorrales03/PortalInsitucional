"use client";

import { useState, useEffect, useCallback } from "react";
import { getMyCourses, getMyAttendance } from "@/lib/api";
import {
  SectionHeader,
  InlineAlert,
  Spinner,
  Badge,
  Field,
  Select,
} from "@/components/dashboard/ui";

const STATUS_LABELS   = { presente: "Presente", ausente: "Ausente", tardanza: "Tardanza", justificado: "Justificado" };
const STATUS_VARIANTS = { presente: "success", ausente: "danger", tardanza: "warning", justificado: "default" };

function AttendanceSummary({ records }) {
  const total     = records.length;
  const counts    = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  const presentes = (counts.presente ?? 0) + (counts.justificado ?? 0);
  const pct       = total > 0 ? Math.round((presentes / total) * 100) : null;

  return (
    <div className="db-profile-fields" style={{ marginBottom: "1.5rem" }}>
      <div className="db-profile-field">
        <span className="db-profile-field-label">Total clases</span>
        <span className="db-profile-field-value">{total}</span>
      </div>
      <div className="db-profile-field">
        <span className="db-profile-field-label">Presentes</span>
        <span className="db-profile-field-value">{counts.presente ?? 0}</span>
      </div>
      <div className="db-profile-field">
        <span className="db-profile-field-label">Ausentes</span>
        <span className="db-profile-field-value">{counts.ausente ?? 0}</span>
      </div>
      <div className="db-profile-field">
        <span className="db-profile-field-label">Tardanzas</span>
        <span className="db-profile-field-value">{counts.tardanza ?? 0}</span>
      </div>
      {pct !== null && (
        <div className="db-profile-field">
          <span className="db-profile-field-label">Asistencia</span>
          <span className="db-profile-field-value">
            <Badge variant={pct >= 80 ? "success" : pct >= 60 ? "warning" : "danger"}>
              {pct}%
            </Badge>
          </span>
        </div>
      )}
    </div>
  );
}

export default function MiAsistenciaView() {
  const [courses,    setCourses]    = useState([]);
  const [sectionId,  setSectionId]  = useState("");
  const [records,    setRecords]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [attLoading, setAttLoading] = useState(false);
  const [error,      setError]      = useState(null);
  const [attError,   setAttError]   = useState(null);

  // Load courses for the section selector
  useEffect(() => {
    getMyCourses()
      .then((data) => {
        setCourses(data ?? []);
        // Auto-select first section if available
        if (data?.length) setSectionId(String(data[0].section_id ?? ""));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const fetchAttendance = useCallback((sid) => {
    setAttLoading(true);
    setAttError(null);
    getMyAttendance(sid || undefined)
      .then(setRecords)
      .catch((err) => setAttError(err.message))
      .finally(() => setAttLoading(false));
  }, []);

  // Fetch when section changes
  useEffect(() => {
    fetchAttendance(sectionId);
  }, [sectionId, fetchAttendance]);

  return (
    <div className="db-view">
      <SectionHeader title="Mi asistencia" />

      {loading ? (
        <div className="db-loading"><Spinner /></div>
      ) : error ? (
        <InlineAlert type="error">{error}</InlineAlert>
      ) : (
        <>
          {courses.length > 1 && (
            <div style={{ maxWidth: "22rem", marginBottom: "1.5rem" }}>
              <Field label="Sección / Curso">
                <Select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                >
                  <option value="">Todos</option>
                  {courses.map((c) => (
                    <option key={c.section_id} value={c.section_id}>
                      {c.course_name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          )}

          {attLoading ? (
            <div className="db-loading"><Spinner /></div>
          ) : attError ? (
            <InlineAlert type="error">{attError}</InlineAlert>
          ) : !records?.length ? (
            <InlineAlert type="info">No hay registros de asistencia.</InlineAlert>
          ) : (
            <>
              <AttendanceSummary records={records} />
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Curso</th>
                    <th>Estado</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r.attendance_id ?? i}>
                      <td>{r.date}</td>
                      <td>{r.course_name ?? "—"}</td>
                      <td>
                        <Badge variant={STATUS_VARIANTS[r.status] ?? "default"}>
                          {STATUS_LABELS[r.status] ?? r.status}
                        </Badge>
                      </td>
                      <td>{r.observation ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}