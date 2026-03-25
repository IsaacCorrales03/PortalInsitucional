"use client";

import { useState, useEffect } from "react";
import { getTokenPayload } from "@/lib/auth";
import { changePassword, getMyDashboard } from "@/lib/api";
import {
  SectionHeader,
  InlineAlert,
  Field,
  Input,
  Spinner,
} from "@/components/dashboard/ui";

const ROLE_LABELS = {
  superadmin: "Super Administrador",
  admin:      "Administrador",
  professor:  "Profesor",
  estudiante: "Estudiante",
};

function getRoleLabel(roles = []) {
  for (const key of ["superadmin", "admin", "professor", "estudiante"]) {
    if (roles.includes(key)) return ROLE_LABELS[key];
  }
  return "Usuario";
}

const SHIFT_LABELS  = { diurna: "Diurna", nocturna: "Nocturna" };
const STATUS_LABELS = {
  activo:   "Activo",
  inactivo: "Inactivo",
  egresado: "Egresado",
  retirado: "Retirado",
};

const EMPTY_FORM = { current_password: "", new_password: "", confirm_password: "" };

export default function MiPerfilView() {
  // ── Token (solo cliente) ──────────────────────────────
  const [roles,  setRoles]  = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const payload = getTokenPayload();
    setRoles(payload?.roles ?? []);
    setUserId(payload?.sub ? Number(payload.sub) : null);
  }, []);

  const roleLabel  = getRoleLabel(roles);
  const hasProfile = roles.includes("estudiante");

  // ── Fetch perfil ──────────────────────────────────────
  const [profile,  setProfile]  = useState(null);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState(null);

  useEffect(() => {
    if (!hasProfile) return;
    setFetching(true);
    getMyDashboard()
      .then(setProfile)
      .catch((err) => setFetchErr(err.message))
      .finally(() => setFetching(false));
  }, [hasProfile]);

  // ── Cambio de contraseña ──────────────────────────────
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(false);
  const [showForm, setShowForm] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit() {
    if (!form.current_password || !form.new_password || !form.confirm_password) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (form.new_password !== form.confirm_password) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await changePassword({
        user_id:          profile?.user_id ?? userId,
        current_password: form.current_password,
        new_password:     form.new_password,
        confirm_password: form.confirm_password,
      });
      setSuccess(true);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(false);
  }

  // ── Render ────────────────────────────────────────────
  return (
    <div className="db-view">
      <SectionHeader title="Mi perfil" />

      {/* Tarjeta principal */}
      {fetching ? (
        <div className="db-loading"><Spinner /></div>
      ) : fetchErr ? (
        <InlineAlert type="error">{fetchErr}</InlineAlert>
      ) : (
        <div className="db-profile-card">
          <div className="db-profile-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="db-profile-info">
            {profile ? (
              <>
                <div className="db-profile-name">{profile.full_name}</div>
                <div className="db-profile-role">{roleLabel}</div>
                <div className="db-profile-meta">{profile.email}</div>
                {profile.phone && (
                  <div className="db-profile-meta">{profile.phone}</div>
                )}
                <div className="db-profile-id">ID #{profile.user_id}</div>
              </>
            ) : (
              <>
                <div className="db-profile-role">{roleLabel}</div>
                {userId && <div className="db-profile-id">ID #{userId}</div>}
              </>
            )}
          </div>
        </div>
      )}

      {/* Datos académicos — solo estudiante */}
      {profile?.profile && (
        <div className="db-profile-section">
          <div className="db-profile-section-header">
            <h2 className="db-profile-section-title">Datos académicos</h2>
          </div>
          <div className="db-profile-fields">
            <div className="db-profile-field">
              <span className="db-profile-field-label">Código</span>
              <span className="db-profile-field-value">{profile.profile.student_code}</span>
            </div>
            <div className="db-profile-field">
              <span className="db-profile-field-label">Especialidad</span>
              <span className="db-profile-field-value">{profile.profile.specialty_name}</span>
            </div>
            <div className="db-profile-field">
              <span className="db-profile-field-label">Año</span>
              <span className="db-profile-field-value">{profile.profile.year_level}°</span>
            </div>
            <div className="db-profile-field">
              <span className="db-profile-field-label">Turno</span>
              <span className="db-profile-field-value">
                {SHIFT_LABELS[profile.profile.section_shift] ?? profile.profile.section_shift}
              </span>
            </div>
            <div className="db-profile-field">
              <span className="db-profile-field-label">Estado</span>
              <span className="db-profile-field-value">
                {STATUS_LABELS[profile.profile.status] ?? profile.profile.status}
              </span>
            </div>
            {profile.profile.enrolled_since && (
              <div className="db-profile-field">
                <span className="db-profile-field-label">Matriculado desde</span>
                <span className="db-profile-field-value">{profile.profile.enrolled_since}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seguridad */}
      <div className="db-profile-section">
        <div className="db-profile-section-header">
          <h2 className="db-profile-section-title">Seguridad</h2>
          {!showForm && (
            <button className="db-btn db-btn--secondary" onClick={() => setShowForm(true)}>
              Cambiar contraseña
            </button>
          )}
        </div>

        {success && (
          <InlineAlert type="success">Contraseña actualizada correctamente.</InlineAlert>
        )}

        {showForm && (
          <div className="db-profile-form">
            {error && <InlineAlert type="error">{error}</InlineAlert>}
            <Field label="Contraseña actual">
              <Input type="password" name="current_password"
                value={form.current_password} onChange={handleChange} placeholder="••••••••" />
            </Field>
            <Field label="Nueva contraseña">
              <Input type="password" name="new_password"
                value={form.new_password} onChange={handleChange} placeholder="••••••••" />
            </Field>
            <Field label="Confirmar nueva contraseña">
              <Input type="password" name="confirm_password"
                value={form.confirm_password} onChange={handleChange} placeholder="••••••••" />
            </Field>
            <div className="db-profile-form-actions">
              <button className="db-btn db-btn--ghost" onClick={handleCancel} disabled={loading}>
                Cancelar
              </button>
              <button className="db-btn db-btn--primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Guardando..." : "Guardar contraseña"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
