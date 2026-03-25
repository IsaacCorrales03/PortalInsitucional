"use client";

import { useState } from "react";
import { useEntity } from "@/lib/useEntity";
import { createSpecialty, updateSpecialty, deleteSpecialty } from "@/lib/api";
import {
  Table, Modal, ConfirmDialog, Spinner, EmptyState,
  InlineAlert, SectionHeader, Field, Input, Textarea,
} from "./ui";

function SpecialtyForm({ initial = {}, onSubmit, loading, error }) {
  const [form, setForm] = useState({ name: initial.name ?? "", description: initial.description ?? "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form className="db-form" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <InlineAlert message={error} />
      <Field label="Nombre de la especialidad">
        <Input value={form.name} onChange={set("name")} required placeholder="ej. Informática Empresarial" />
      </Field>
      <Field label="Descripción">
        <Textarea value={form.description} onChange={set("description")} placeholder="Breve descripción de la especialidad..." rows={3} />
      </Field>
      <button type="submit" className="db-btn db-btn--primary" disabled={loading}>
        {loading ? <Spinner size={16} /> : initial.id ? "Guardar cambios" : "Crear especialidad"}
      </button>
    </form>
  );
}

const COLUMNS = [
  { key: "id",          label: "ID" },
  { key: "name",        label: "Nombre" },
  { key: "description", label: "Descripción" },
];

export default function SpecialtiesView() {
  const { data: specialties, loading, error, reload } = useEntity("specialties");
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSub]    = useState(false);
  const [formError, setFErr]    = useState("");
  const [confirmLoad, setConf]  = useState(false);

  const handleCreate = async (form) => {
    setSub(true); setFErr("");
    try { await createSpecialty(form); setModal(null); reload(); }
    catch (e) { setFErr(e.message); }
    finally { setSub(false); }
  };

  const handleEdit = async (form) => {
    setSub(true); setFErr("");
    try { await updateSpecialty(selected.id, form); setModal(null); reload(); }
    catch (e) { setFErr(e.message); }
    finally { setSub(false); }
  };

  const handleDelete = async () => {
    setConf(true);
    try { await deleteSpecialty(selected.id); setModal(null); reload(); }
    catch (e) { alert(e.message); }
    finally { setConf(false); }
  };

  return (
    <div className="db-view">
      <SectionHeader
        title="Especialidades técnicas"
        subtitle={`${(specialties ?? []).length} especialidades registradas`}
        action={
          <button className="db-btn db-btn--primary" onClick={() => { setSelected(null); setFErr(""); setModal("create"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nueva especialidad
          </button>
        }
      />

      {loading && <div className="db-loading"><Spinner size={28} /></div>}
      {error   && <InlineAlert message={error} />}
      {!loading && !error && (specialties ?? []).length === 0 && <EmptyState message="No hay especialidades registradas." />}
      {!loading && !error && (specialties ?? []).length > 0 && (
        <Table
          columns={COLUMNS}
          rows={specialties}
          onEdit={(row) => { setSelected(row); setFErr(""); setModal("edit"); }}
          onDelete={(row) => { setSelected(row); setModal("delete"); }}
        />
      )}

      {modal === "create" && (
        <Modal title="Nueva especialidad" onClose={() => setModal(null)}>
          <SpecialtyForm onSubmit={handleCreate} loading={submitting} error={formError} />
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title={`Editar — ${selected.name}`} onClose={() => setModal(null)}>
          <SpecialtyForm initial={selected} onSubmit={handleEdit} loading={submitting} error={formError} />
        </Modal>
      )}
      {modal === "delete" && selected && (
        <ConfirmDialog
          message={`¿Eliminar la especialidad "${selected.name}"? Solo es posible si no tiene cursos, secciones ni estudiantes asociados.`}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={confirmLoad}
        />
      )}
    </div>
  );
}