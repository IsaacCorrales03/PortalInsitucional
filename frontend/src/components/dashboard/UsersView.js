"use client";

import { useState, useEffect } from "react";
import { useEntity } from "@/lib/useEntity";
import { useStore } from "@/lib/store";
import { createUser, updateUser, deleteUser } from "@/lib/api";
import {
  Table, Modal, ConfirmDialog, Badge, Spinner, EmptyState,
  InlineAlert, SectionHeader, Field, Input, Select,
} from "./ui";
import { useToast } from "@/lib/Toast";

const ROLES          = ["estudiante", "profesor", "admin"];
const ROLE_STUDENT   = "estudiante";
const ROLE_PROFESSOR = "profesor";

// ── UserForm ──────────────────────────────────────────────────────────────────
function UserForm({ initial = {}, onSubmit, loading, error }) {
  const { specialties, sections, ensure } = useStore();

  useEffect(() => {
    ensure("specialties");
    ensure("sections");
  }, []);

  const [form, setForm] = useState({
    email:       initial.email       ?? "",
    full_name:   initial.full_name   ?? "",
    national_id: initial.national_id ?? "",
    role:        initial.role        ?? ROLE_STUDENT,
    is_active:   initial.is_active   ?? true,
    student_profile: {
      specialty_id:  "",
      section_id:    "",
      section_part:  "",   // se deriva automáticamente
      section_shift: "diurna",
      year_level:    "1",
    },
    professor_profile: {
      specialty_area: "",
    },
  });

  const set          = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setBool      = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value === "true" }));
  const setProfessor = (k) => (e) =>
    setForm((f) => ({
      ...f,
      professor_profile: { ...f.professor_profile, [k]: e.target.value },
    }));

  // Al cambiar especialidad: limpia sección y parte
  const handleSpecialtyChange = (e) => {
    setForm((f) => ({
      ...f,
      student_profile: {
        ...f.student_profile,
        specialty_id: e.target.value,
        section_id:   "",
        section_part: "",
      },
    }));
  };

  // Al cambiar sección: deriva section_part automáticamente
  const handleSectionChange = (e) => {
    const sectionId = e.target.value;
    const sp        = form.student_profile;

    const section   = (sections.data ?? []).find((s) => String(s.id) === String(sectionId));
    const match     = section?.specialties?.find(
      (spec) => String(spec.id) === String(sp.specialty_id)
    );
    const derivedPart = match?.part ?? "";

    setForm((f) => ({
      ...f,
      student_profile: {
        ...f.student_profile,
        section_id:   sectionId,
        section_part: derivedPart,
      },
    }));
  };

  const sp = form.student_profile;

  // Secciones que contienen la especialidad elegida
  const filteredSections = (sections.data ?? []).filter((s) =>
    !sp.specialty_id ||
    s.specialties?.some((spec) => String(spec.id) === String(sp.specialty_id))
  );

  // Parte derivada para mostrar al usuario
  const derivedPartLabel = sp.section_part
    ? `Parte ${sp.section_part}`
    : sp.section_id
      ? "No determinada"
      : "—";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.role === ROLE_STUDENT) {
      if (!sp.specialty_id || !sp.section_id || !sp.section_part) {
        return onSubmit(null, "Selecciona especialidad y sección para continuar");
      }

      return onSubmit({
        email:       form.email,
        full_name:   form.full_name,
        national_id: form.national_id,
        role:        form.role,
        is_active:   form.is_active,
        student_profile: {
          year_level:    Number(sp.year_level),
          specialty_id:  Number(sp.specialty_id),
          section_id:    Number(sp.section_id),
          section_part:  sp.section_part,
          section_shift: sp.section_shift,
          enrolled_since: sp.enrolled_since ?? null,
        },
      });
    }

    if (form.role === ROLE_PROFESSOR) {
      return onSubmit({
        email:       form.email,
        full_name:   form.full_name,
        national_id: form.national_id,
        role:        form.role,
        is_active:   form.is_active,
        professor_profile: {
          specialty_area: form.professor_profile.specialty_area || null,
        },
      });
    }

    // admin u otros — sin perfiles
    onSubmit({
      email:       form.email,
      full_name:   form.full_name,
      national_id: form.national_id,
      role:        form.role,
      is_active:   form.is_active,
    });
  };

  return (
    <form className="db-form" onSubmit={handleSubmit}>
      <InlineAlert message={error} />

      {!initial.id && (
        <Field label="Correo electronico">
          <Input type="email" value={form.email} onChange={set("email")} required />
        </Field>
      )}

      <Field label="Nombre completo">
        <Input value={form.full_name} onChange={set("full_name")} required />
      </Field>

      {!initial.id && (
        <Field label="Cedula">
          <Input value={form.national_id} onChange={set("national_id")} required />
        </Field>
      )}

      <Field label="Rol">
        <Select value={form.role} onChange={set("role")}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </Select>
      </Field>

      {form.role === ROLE_PROFESSOR && (
        <>
          <SectionHeader title="Perfil del profesor" />
          <Field label="Área de especialidad">
            <Input
              value={form.professor_profile.specialty_area}
              onChange={setProfessor("specialty_area")}
              placeholder="Ej: Matemáticas, Redes, Programación"
            />
          </Field>
        </>
      )}

      {form.role === ROLE_STUDENT && (
        <>
          <SectionHeader title="Perfil del estudiante" />

          <Field label="Año tecnico">
            <Select value={sp.year_level} onChange={(e) =>
              setForm((f) => ({
                ...f,
                student_profile: { ...f.student_profile, year_level: e.target.value },
              }))
            } required>
              <option value="1">1°</option>
              <option value="2">2°</option>
              <option value="3">3°</option>
            </Select>
          </Field>

          <Field label="Especialidad">
            <Select value={sp.specialty_id} onChange={handleSpecialtyChange} required>
              <option value="">Seleccionar</option>
              {(specialties.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Jornada">
            <Select
              value={sp.section_shift}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  student_profile: { ...f.student_profile, section_shift: e.target.value },
                }))
              }
            >
              <option value="diurna">Diurna</option>
              <option value="nocturna">Nocturna</option>
            </Select>
          </Field>

          <Field label="Sección">
            {sections.loading ? (
              <Spinner size={16} />
            ) : (
              <Select
                value={sp.section_id}
                onChange={handleSectionChange}
                required
                disabled={!sp.specialty_id}
              >
                <option value="">
                  {sp.specialty_id ? "Seleccionar sección" : "Primero elige una especialidad"}
                </option>
                {filteredSections.length === 0 && sp.specialty_id ? (
                  <option disabled value="">No hay secciones disponibles</option>
                ) : (
                  filteredSections.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))
                )}
              </Select>
            )}
            {sections.error && (
              <span style={{ fontSize: "0.75rem", color: "var(--db-error)" }}>
                {sections.error}
              </span>
            )}
          </Field>

          {/* Parte derivada automáticamente — solo informativo */}
          {sp.section_id && (
            <Field label="Parte asignada">
              <div style={{
                padding: "6px 10px",
                background: "var(--db-surface-2, #f4f4f5)",
                borderRadius: 6,
                fontSize: "0.9rem",
                color: sp.section_part ? "var(--db-text)" : "var(--db-text-muted)",
              }}>
                {derivedPartLabel}
              </div>
            </Field>
          )}
        </>
      )}

      {initial.id && (
        <Field label="Estado">
          <Select value={String(form.is_active)} onChange={setBool("is_active")}>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </Select>
        </Field>
      )}

      <button type="submit" className="db-btn db-btn--primary" disabled={loading}>
        {loading ? <Spinner size={16} /> : initial.id ? "Guardar cambios" : "Crear usuario"}
      </button>
    </form>
  );
}

// ── CreatedPasswordModal ──────────────────────────────────────────────────────
function CreatedPasswordModal({ data, onClose }) {
  const { addToast } = useToast();

  useEffect(() => {
    navigator.clipboard.writeText(data.password)
      .then(()  => addToast("Contrasena copiada al portapapeles", "success"))
      .catch(() => addToast("No se pudo copiar automaticamente",  "warning"));
  }, []);

  return (
    <Modal title="Usuario creado" onClose={onClose} size="sm" disableBackdropClose>
      <p className="db-confirm-msg">
        El usuario fue creado exitosamente. Guarde la contrasena generada:
      </p>
      <div className="db-password-box">
        <span className="db-password-label">Contrasena temporal</span>
        <code className="db-password-value">{data.password}</code>
      </div>
      <p style={{ fontSize: 12, color: "var(--db-text-muted)", marginTop: 8 }}>
        Esta contrasena solo se muestra una vez. El usuario debera cambiarla al ingresar.
      </p>
      <button
        className="db-btn db-btn--primary"
        onClick={onClose}
        style={{ marginTop: 16, width: "100%" }}
      >
        Entendido
      </button>
    </Modal>
  );
}

// ── UsersView ─────────────────────────────────────────────────────────────────
const TABS    = ["Todos", "Estudiantes", "Profesores", "Administradores"];
const tabRole = {
  Todos:           null,
  Estudiantes:     "estudiante",
  Profesores:      "profesor",
  Administradores: "admin",
};

const COLUMNS = [
  { key: "id",        label: "ID" },
  { key: "full_name", label: "Nombre" },
  { key: "email",     label: "Correo" },
  { key: "role",      label: "Rol",    render: (v) => <Badge label={v} /> },
  { key: "is_active", label: "Estado", render: (v) => <Badge label={v ? "activo" : "inactivo"} /> },
];

export default function UsersView() {
  const { data: users, loading, error, reload } = useEntity("users");

  const [tab,         setTab]       = useState("Todos");
  const [search,      setSearch]    = useState("");
  const [modal,       setModal]     = useState(null);
  const [selected,    setSelected]  = useState(null);
  const [createdUser, setCreated]   = useState(null);
  const [submitting,  setSub]       = useState(false);
  const [formError,   setFormError] = useState("");
  const [confirmLoad, setConf]      = useState(false);

  const filtered = (users ?? []).filter((u) => {
    const roleMatch = !tabRole[tab] || u.role === tabRole[tab];
    const q         = search.toLowerCase();
    const textMatch =
      !q ||
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    return roleMatch && textMatch;
  });

  const handleCreate = async (form, customError) => {
    if (customError) return setFormError(customError);
    setSub(true);
    setFormError("");
    try {
      const res = await createUser(form);
      setCreated(res);
      setModal("created");
      reload();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSub(false);
    }
  };

  const handleEdit = async (form) => {
    setSub(true);
    setFormError("");
    try {
      await updateUser(selected.id, {
        full_name: form.full_name,
        is_active: form.is_active,
        role_name: form.role,
      });
      setModal(null);
      reload();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSub(false);
    }
  };

  const handleDelete = async () => {
    setConf(true);
    try {
      await deleteUser(selected.id);
      setModal(null);
      reload();
    } catch (e) {
      alert(e.message);
    } finally {
      setConf(false);
    }
  };

  return (
    <div className="db-view">
      <SectionHeader
        title="Usuarios del sistema"
        subtitle={`${(users ?? []).length} usuarios registrados`}
        action={
          <button
            className="db-btn db-btn--primary"
            onClick={() => { setSelected(null); setFormError(""); setModal("create"); }}
          >
            Nuevo usuario
          </button>
        }
      />

      <div className="db-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`db-tab ${tab === t ? "db-tab--active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="db-search-wrap">
        <input
          className="db-search"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <Spinner size={28} />}
      {error   && <InlineAlert message={error} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState message="No hay usuarios con este filtro." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <Table
          columns={COLUMNS}
          rows={filtered}
          onEdit={(row)   => { setSelected(row); setFormError(""); setModal("edit"); }}
          onDelete={(row) => { setSelected(row); setModal("delete"); }}
        />
      )}

      {modal === "create" && (
        <Modal title="Crear nuevo usuario" onClose={() => setModal(null)}>
          <UserForm onSubmit={handleCreate} loading={submitting} error={formError} />
        </Modal>
      )}

      {modal === "edit" && selected && (
        <Modal title={`Editar — ${selected.full_name}`} onClose={() => setModal(null)}>
          <UserForm
            initial={selected}
            onSubmit={handleEdit}
            loading={submitting}
            error={formError}
          />
        </Modal>
      )}

      {modal === "delete" && selected && (
        <ConfirmDialog
          message={`Eliminar al usuario "${selected.full_name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={confirmLoad}
        />
      )}

      {modal === "created" && createdUser && (
        <CreatedPasswordModal data={createdUser} onClose={() => setModal(null)} />
      )}
    </div>
  );
}