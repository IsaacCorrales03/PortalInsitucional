"use client";

import { useState } from "react";
import { useEntity } from "@/lib/useEntity";
import { createEnrollment, updateEnrollment, deleteEnrollment } from "@/lib/api";
import {
  Table, Modal, ConfirmDialog, Badge, Spinner, EmptyState,
  InlineAlert, SectionHeader, Field, Select,
} from "./ui";

const STATUSES = ["activo", "retirado", "aprobado", "reprobado"];

function EnrollForm({ students = [], sections = [], onSubmit, loading, error }) {
  const [form, setForm] = useState({ user_id: "", section_id: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form className="db-form" onSubmit={(e) => { e.preventDefault(); onSubmit({ user_id: Number(form.user_id), section_id: Number(form.section_id) }); }}>
      <InlineAlert message={error} />
      <Field label="Estudiante">
        <Select value={form.user_id} onChange={set("user_id")} required>
          <option value="">Seleccionar estudiante</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </Select>
      </Field>
      <Field label="Sección">
        <Select value={form.section_id} onChange={set("section_id")} required>
          <option value="">Seleccionar sección</option>
          {sections.map((s) => <option key={s.id} value={s.id}>Sección #{s.id} — {s.academic_year} ({s.shift})</option>)}
        </Select>
      </Field>
      <button type="submit" className="db-btn db-btn--primary" disabled={loading}>
        {loading ? <Spinner size={16} /> : "Inscribir estudiante"}
      </button>
    </form>
  );
}

function StatusForm({ initial, onSubmit, loading, error }) {
  const [status, setStatus] = useState(initial?.status ?? "activo");
  return (
    <form className="db-form" onSubmit={(e) => { e.preventDefault(); onSubmit({ status }); }}>
      <InlineAlert message={error} />
      <Field label="Estado de la inscripción">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </Select>
      </Field>
      <button type="submit" className="db-btn db-btn--primary" disabled={loading}>
        {loading ? <Spinner size={16} /> : "Actualizar estado"}
      </button>
    </form>
  );
}

export default function EnrollmentsView() {
  const { data: enrollments, loading: le, error: ee, reload } = useEntity("enrollments");
  const { data: allUsers,    loading: lu }                    = useEntity("users");
  const { data: sections,    loading: ls }                    = useEntity("sections");

  const students = (allUsers ?? []).filter((u) => u.role === "estudiante");
  const userName = (id) => (allUsers  ?? []).find((u) => u.id === id)?.full_name ?? `#${id}`;
  const secLabel = (id) => { const s = (sections ?? []).find((s) => s.id === id); return s ? `#${s.id} ${s.academic_year}` : `#${id}`; };

  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSub]    = useState(false);
  const [formError, setFErr]    = useState("");
  const [confirmLoad, setConf]  = useState(false);

  const COLUMNS = [
    { key: "user_id",     label: "Estudiante",  render: (v) => userName(v) },
    { key: "section_id",  label: "Sección",     render: (v) => secLabel(v) },
    { key: "enrolled_at", label: "Fecha" },
    { key: "status",      label: "Estado",      render: (v) => <Badge label={v} /> },
  ];

  const handleCreate = async (form) => {
    setSub(true); setFErr("");
    try { await createEnrollment(form); setModal(null); reload(); }
    catch (e) { setFErr(e.message); }
    finally { setSub(false); }
  };

  const handleStatusUpdate = async (form) => {
    setSub(true); setFErr("");
    try { await updateEnrollment(selected.user_id, selected.section_id, form); setModal(null); reload(); }
    catch (e) { setFErr(e.message); }
    finally { setSub(false); }
  };

  const handleDelete = async () => {
    setConf(true);
    try { await deleteEnrollment(selected.user_id, selected.section_id); setModal(null); reload(); }
    catch (e) { alert(e.message); }
    finally { setConf(false); }
  };

  const isLoading = le || lu || ls;

  return (
    <div className="db-view">
      <SectionHeader
        title="Inscripciones"
        subtitle={`${(enrollments ?? []).length} inscripciones activas`}
        action={
          <button className="db-btn db-btn--primary" onClick={() => { setSelected(null); setFErr(""); setModal("create"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nueva inscripción
          </button>
        }
      />

      {isLoading && <div className="db-loading"><Spinner size={28} /></div>}
      {ee        && <InlineAlert message={ee} />}
      {!isLoading && !ee && (enrollments ?? []).length === 0 && <EmptyState message="No hay inscripciones." />}
      {!isLoading && !ee && (enrollments ?? []).length > 0 && (
        <Table
          columns={COLUMNS}
          rows={(enrollments ?? []).map((e, i) => ({ ...e, id: i }))}
          onEdit={(row) => { setSelected(row); setFErr(""); setModal("status"); }}
          onDelete={(row) => { setSelected(row); setModal("delete"); }}
        />
      )}

      {modal === "create" && (
        <Modal title="Inscribir estudiante" onClose={() => setModal(null)}>
          <EnrollForm students={students} sections={sections ?? []} onSubmit={handleCreate} loading={submitting} error={formError} />
        </Modal>
      )}
      {modal === "status" && selected && (
        <Modal title="Actualizar estado" onClose={() => setModal(null)} size="sm">
          <StatusForm initial={selected} onSubmit={handleStatusUpdate} loading={submitting} error={formError} />
        </Modal>
      )}
      {modal === "delete" && selected && (
        <ConfirmDialog
          message={`¿Dar de baja a ${userName(selected.user_id)} de la sección ${secLabel(selected.section_id)}?`}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={confirmLoad}
        />
      )}
    </div>
  );
}