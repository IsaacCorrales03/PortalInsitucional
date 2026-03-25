"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { createSection, updateSection, deleteSection, assignProfessor } from "@/lib/api";
import {
  Table, Modal, ConfirmDialog, Spinner, EmptyState,
  InlineAlert, SectionHeader, Field, Input, Select,
} from "./ui";

// ─────────────────────────────────────────────
// Formulario
// ─────────────────────────────────────────────
function SectionForm({ initial = {}, specialties = [], professors = [], onSubmit, loading, error }) {
  const [form, setForm] = useState({
    name: initial.name ?? "",
    academic_year: initial.academic_year ?? new Date().getFullYear().toString(),
    specialty_id_a: initial.specialty_id_a ?? "",
    specialty_id_b: initial.specialty_id_b ?? "",
    guide_professor_id: initial.guide_professor_id ?? "",
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <form
      className="db-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...form,
          specialty_id_a: Number(form.specialty_id_a),
          specialty_id_b: Number(form.specialty_id_b),
          guide_professor_id: form.guide_professor_id
            ? Number(form.guide_professor_id)
            : null,
        });
      }}
    >
      <InlineAlert message={error} />

      <Field label="Nombre sección">
        <Input value={form.name} onChange={set("name")} required placeholder="10-4" />
      </Field>

      <Field label="Año académico">
        <Input value={form.academic_year} onChange={set("academic_year")} required />
      </Field>

      <Field label="Especialidad A">
        <Select value={form.specialty_id_a} onChange={set("specialty_id_a")} required>
          <option value="">Seleccionar</option>
          {specialties.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
      </Field>

      <Field label="Especialidad B">
        <Select value={form.specialty_id_b} onChange={set("specialty_id_b")} required>
          <option value="">Seleccionar</option>
          {specialties.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
      </Field>

      <Field label="Profesor guía">
        <Select value={form.guide_professor_id} onChange={set("guide_professor_id")}>
          <option value="">Sin asignar</option>
          {professors.map(p => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </Select>
      </Field>

      <button className="db-btn db-btn--primary" disabled={loading}>
        {loading ? <Spinner size={16} /> : initial.id ? "Guardar cambios" : "Crear sección"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────
// Asignar profesor guía
// ─────────────────────────────────────────────
function AssignProfessorForm({ section, professors = [], onSubmit, loading, error }) {
  const [profId, setProfId] = useState(section.guide_professor_id ?? "");

  return (
    <form className="db-form" onSubmit={(e) => { e.preventDefault(); onSubmit(Number(profId)); }}>
      <InlineAlert message={error} />

      <Field label="Profesor guía">
        <Select value={profId} onChange={(e) => setProfId(e.target.value)}>
          <option value="">Sin asignar</option>
          {professors.map(p => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </Select>
      </Field>

      <button className="db-btn db-btn--primary" disabled={loading}>
        {loading ? <Spinner size={16} /> : "Guardar"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────
// View principal
// ─────────────────────────────────────────────
export default function SectionsView() {
  const { sections, users, specialties, ensure, reload } = useStore();

  useEffect(() => {
    ensure("sections");
    ensure("users");
    ensure("specialties");
  }, []);

  const sectionsData    = sections.data ?? [];
  const usersData       = users.data ?? [];
  const specialtiesData = specialties.data ?? [];

  const professors = usersData.filter(u => u.role === "profesor");

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSub] = useState(false);
  const [formError, setFErr] = useState("");
  const [confirmLoad, setConf] = useState(false);

  const isLoading = sections.loading || users.loading || specialties.loading;
  const error     = sections.error || users.error || specialties.error;

  // ── columnas correctas ──────────────────────
  const COLUMNS = [
    { key: "id", label: "ID" },
    { key: "name", label: "Sección" },
    { key: "academic_year", label: "Año" },
    { key: "specialty_a_name", label: "Especialidad A" },
    { key: "specialty_b_name", label: "Especialidad B" },
    { key: "guide_professor_name", label: "Profesor guía" },
  ];

  // ── handlers ───────────────────────────────
  const handleCreate = async (form) => {
    setSub(true); setFErr("");
    try {
      await createSection(form);
      setModal(null);
      reload("sections");
    } catch (e) {
      setFErr(e.message);
    } finally {
      setSub(false);
    }
  };

  const handleEdit = async (form) => {
    setSub(true); setFErr("");
    try {
      await updateSection(selected.id, form);
      setModal(null);
      reload("sections");
    } catch (e) {
      setFErr(e.message);
    } finally {
      setSub(false);
    }
  };

  const handleDelete = async () => {
    setConf(true);
    try {
      await deleteSection(selected.id);
      setModal(null);
      reload("sections");
    } catch (e) {
      alert(e.message);
    } finally {
      setConf(false);
    }
  };

  const handleAssign = async (profId) => {
    setSub(true); setFErr("");
    try {
      await assignProfessor(selected.id, profId);
      setModal(null);
      reload("sections");
    } catch (e) {
      setFErr(e.message);
    } finally {
      setSub(false);
    }
  };

  // ───────────────────────────────────────────
  return (
    <div className="db-view">
      <SectionHeader
        title="Secciones"
        subtitle={`${sectionsData.length} secciones registradas`}
        action={
          <button
            className="db-btn db-btn--primary"
            onClick={() => { setSelected(null); setFErr(""); setModal("create"); }}
          >
            Nueva sección
          </button>
        }
      />

      {isLoading && <Spinner size={28} />}
      {error && <InlineAlert message={error} />}

      {!isLoading && !error && sectionsData.length === 0 && (
        <EmptyState message="No hay secciones registradas." />
      )}

      {!isLoading && !error && sectionsData.length > 0 && (
        <Table
          columns={COLUMNS}
          rows={sectionsData}
          onEdit={(row) => { setSelected(row); setFErr(""); setModal("edit"); }}
          onDelete={(row) => { setSelected(row); setModal("delete"); }}
          extraActions={(row) => (
            <button
              className="db-action-btn"
              title="Asignar profesor guía"
              onClick={() => { setSelected(row); setFErr(""); setModal("assign"); }}
            >
              Asignar guía
            </button>
          )}
        />
      )}

      {modal === "create" && (
        <Modal title="Nueva sección" onClose={() => setModal(null)}>
          <SectionForm
            specialties={specialtiesData}
            professors={professors}
            onSubmit={handleCreate}
            loading={submitting}
            error={formError}
          />
        </Modal>
      )}

      {modal === "edit" && selected && (
        <Modal title={`Editar sección #${selected.id}`} onClose={() => setModal(null)}>
          <SectionForm
            initial={selected}
            specialties={specialtiesData}
            professors={professors}
            onSubmit={handleEdit}
            loading={submitting}
            error={formError}
          />
        </Modal>
      )}

      {modal === "assign" && selected && (
        <Modal title="Asignar profesor guía" onClose={() => setModal(null)} size="sm">
          <AssignProfessorForm
            section={selected}
            professors={professors}
            onSubmit={handleAssign}
            loading={submitting}
            error={formError}
          />
        </Modal>
      )}

      {modal === "delete" && selected && (
        <ConfirmDialog
          message={`¿Eliminar la sección "${selected.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={confirmLoad}
        />
      )}
    </div>
  );
}