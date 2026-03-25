"use client";

import { useState } from "react";
import { useEntity } from "@/lib/useEntity";
import { createEvent, deleteEvent } from "@/lib/api";
import {
  SectionHeader,
  Table,
  Modal,
  ConfirmDialog,
  InlineAlert,
  Field,
  Input,
  Select,
  Textarea,
  Spinner,
  EmptyState,
  Badge,
} from "@/components/dashboard/ui";

const EVENT_TYPES = [
  { value: "academico", label: "Académico" },
  { value: "cultural", label: "Cultural" },
  { value: "deportivo", label: "Deportivo" },
  { value: "administrativo", label: "Administrativo" },
  { value: "otro", label: "Otro" },
];

const STATUS_VARIANT = {
  activo: "success",
  cancelado: "error",
  finalizado: "neutral",
};

function formatDateTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function EventsView() {
  const { data, loading, error, reload } = useEntity("events");

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "academico",
    start_datetime: "",
    end_datetime: "",
    location: "",
    target_role: "",
    target_section_id: "",
  });

  function resetForm() {
    setForm({
      title: "",
      description: "",
      type: "academico",
      start_datetime: "",
      end_datetime: "",
      location: "",
      target_role: "",
      target_section_id: "",
    });
    setFormError("");
  }

  async function handleCreate() {
    if (!form.title.trim()) { setFormError("El título es obligatorio."); return; }
    if (!form.start_datetime) { setFormError("La fecha de inicio es obligatoria."); return; }
    setSaving(true);
    setFormError("");
    try {
      await createEvent({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        type: form.type,
        start_datetime: form.start_datetime,
        end_datetime: form.end_datetime || undefined,
        location: form.location.trim() || undefined,
        target_role: form.target_role.trim() || undefined,
        target_section_id: form.target_section_id ? Number(form.target_section_id) : undefined,
      });
      reload("events");
      setShowCreate(false);
      resetForm();
    } catch {
      setFormError("No se pudo crear el evento.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event) {
    try {
      await deleteEvent(event.id);
      reload("events");
    } catch {
      // silencioso
    } finally {
      setDeleteTarget(null);
    }
  }

  const columns = [
    { key: "title", label: "Título" },
    { key: "type", label: "Tipo" },
    {
      key: "status",
      label: "Estado",
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] ?? "neutral"}>{row.status ?? "—"}</Badge>
      ),
    },
    {
      key: "start_datetime",
      label: "Inicio",
      render: (row) => formatDateTime(row.start_datetime),
    },
    {
      key: "end_datetime",
      label: "Fin",
      render: (row) => formatDateTime(row.end_datetime),
    },
  ];

  return (
    <div className="db-view">
      <SectionHeader
        title="Eventos"
        description="Gestiona los eventos del centro educativo."
        action={
          <button className="db-btn db-btn--primary" onClick={() => { resetForm(); setShowCreate(true); }}>
            Nuevo evento
          </button>
        }
      />

      {error && <InlineAlert type="error" message={error} />}

      {loading && !data ? (
        <Spinner />
      ) : data && data.length === 0 ? (
        <EmptyState message="No hay eventos registrados." />
      ) : (
        <Table columns={columns} rows={data ?? []} onDelete={(row) => setDeleteTarget(row)} />
      )}

      {showCreate && (
        <Modal title="Nuevo evento" onClose={() => { setShowCreate(false); resetForm(); }}>
          {formError && <InlineAlert type="error" message={formError} />}
          <Field label="Título">
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Nombre del evento"
            />
          </Field>
          <Field label="Tipo">
            <Select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              options={EVENT_TYPES}
            />
          </Field>
          <Field label="Descripción">
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Descripción opcional"
              rows={3}
            />
          </Field>
          <Field label="Fecha y hora de inicio">
            <Input
              type="datetime-local"
              value={form.start_datetime}
              onChange={(e) => setForm((f) => ({ ...f, start_datetime: e.target.value }))}
            />
          </Field>
          <Field label="Fecha y hora de fin">
            <Input
              type="datetime-local"
              value={form.end_datetime}
              onChange={(e) => setForm((f) => ({ ...f, end_datetime: e.target.value }))}
            />
          </Field>
          <Field label="Lugar">
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Salón, auditorio, etc."
            />
          </Field>
          <div className="db-modal-actions">
            <button className="db-btn db-btn--ghost" onClick={() => { setShowCreate(false); resetForm(); }}>
              Cancelar
            </button>
            <button className="db-btn db-btn--primary" onClick={handleCreate} disabled={saving}>
              {saving ? <Spinner size={16} /> : "Crear"}
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`¿Eliminar el evento "${deleteTarget.title}"? Esta acción no se puede deshacer.`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}