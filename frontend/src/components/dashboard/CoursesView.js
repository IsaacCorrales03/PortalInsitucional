"use client";

import { useState } from "react";
import { useEntity } from "@/lib/useEntity";
import { createCourse, updateCourse, deleteCourse } from "@/lib/api";
import {
  Table, Modal, ConfirmDialog, Spinner, EmptyState,
  InlineAlert, SectionHeader, Field, Input, Select, Textarea,
} from "./ui";

function CourseForm({ initial = {}, specialties = [], onSubmit, loading, error }) {
  const [form, setForm] = useState({
    name:         initial.name ?? "",
    description:  initial.description ?? "",
    specialty_id: initial.specialty_id ?? "",
    year_level:   initial.year_level ?? 1,
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form className="db-form" onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, specialty_id: Number(form.specialty_id), year_level: Number(form.year_level) }); }}>
      <InlineAlert message={error} />
      <Field label="Nombre del curso">
        <Input value={form.name} onChange={set("name")} required placeholder="ej. Matemática I" />
      </Field>
      <Field label="Descripción">
        <Textarea value={form.description} onChange={set("description")} placeholder="Descripción breve..." rows={2} />
      </Field>
      <Field label="Especialidad">
        <Select value={form.specialty_id} onChange={set("specialty_id")} required>
          <option value="">Seleccionar especialidad</option>
          {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </Field>
      <Field label="Año">
        <Select value={form.year_level} onChange={set("year_level")}>
          {[1, 2, 3].map((y) => <option key={y} value={y}>Año {y}</option>)}
        </Select>
      </Field>
      <button type="submit" className="db-btn db-btn--primary" disabled={loading}>
        {loading ? <Spinner size={16} /> : initial.id ? "Guardar cambios" : "Crear curso"}
      </button>
    </form>
  );
}

export default function CoursesView() {
  const { data: courses,     loading: lc, error: ec, reload } = useEntity("courses");
  const { data: specialties, loading: ls }                    = useEntity("specialties");
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSub]    = useState(false);
  const [formError, setFErr]    = useState("");
  const [confirmLoad, setConf]  = useState(false);

  const specName = (id) => (specialties ?? []).find((s) => s.id === id)?.name ?? id;

  const COLUMNS = [
    { key: "id",           label: "ID" },
    { key: "name",         label: "Nombre" },
    { key: "specialty_id", label: "Especialidad", render: (v) => specName(v) },
    { key: "year_level",   label: "Año",          render: (v) => `Año ${v}` },
    { key: "description",  label: "Descripción" },
  ];

  const filtered = (courses ?? []).filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q);
  });

  const handleCreate = async (form) => {
    setSub(true); setFErr("");
    try { await createCourse(form); setModal(null); reload(); }
    catch (e) { setFErr(e.message); }
    finally { setSub(false); }
  };

  const handleEdit = async (form) => {
    setSub(true); setFErr("");
    try { await updateCourse(selected.id, form); setModal(null); reload(); }
    catch (e) { setFErr(e.message); }
    finally { setSub(false); }
  };

  const handleDelete = async () => {
    setConf(true);
    try { await deleteCourse(selected.id); setModal(null); reload(); }
    catch (e) { alert(e.message); }
    finally { setConf(false); }
  };

  return (
    <div className="db-view">
      <SectionHeader
        title="Cursos"
        subtitle={`${(courses ?? []).length} cursos registrados`}
        action={
          <button className="db-btn db-btn--primary" onClick={() => { setSelected(null); setFErr(""); setModal("create"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo curso
          </button>
        }
      />

      <div className="db-search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input className="db-search" placeholder="Buscar por nombre..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {(lc || ls) && <div className="db-loading"><Spinner size={28} /></div>}
      {ec         && <InlineAlert message={ec} />}
      {!lc && !ls && !ec && filtered.length === 0 && <EmptyState message="No hay cursos registrados." />}
      {!lc && !ls && !ec && filtered.length > 0 && (
        <Table
          columns={COLUMNS}
          rows={filtered}
          onEdit={(row) => { setSelected(row); setFErr(""); setModal("edit"); }}
          onDelete={(row) => { setSelected(row); setModal("delete"); }}
        />
      )}

      {modal === "create" && (
        <Modal title="Nuevo curso" onClose={() => setModal(null)}>
          <CourseForm specialties={specialties ?? []} onSubmit={handleCreate} loading={submitting} error={formError} />
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title={`Editar — ${selected.name}`} onClose={() => setModal(null)}>
          <CourseForm initial={selected} specialties={specialties ?? []} onSubmit={handleEdit} loading={submitting} error={formError} />
        </Modal>
      )}
      {modal === "delete" && selected && (
        <ConfirmDialog
          message={`¿Eliminar el curso "${selected.name}"? Solo es posible si no tiene secciones asociadas.`}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={confirmLoad}
        />
      )}
    </div>
  );
}