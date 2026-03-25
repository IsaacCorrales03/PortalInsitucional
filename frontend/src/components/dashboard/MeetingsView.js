"use client";

import { useState } from "react";
import { useEntity } from "@/lib/useEntity";
import { createMeeting, deleteMeeting } from "@/lib/api";
import {
  SectionHeader,
  Table,
  Modal,
  ConfirmDialog,
  InlineAlert,
  Field,
  Input,
  Textarea,
  Spinner,
  EmptyState,
  Badge,
} from "@/components/dashboard/ui";

const STATUS_VARIANT = {
  programada: "warning",
  realizada: "success",
  cancelada: "error",
};

function formatDateTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("es-CR", { dateStyle: "medium", timeStyle: "short" });
}

export default function MeetingsView() {
  const { data, loading, error, reload } = useEntity("meetings");

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduled_at: "",
    location: "",
  });

  function resetForm() {
    setForm({ title: "", description: "", scheduled_at: "", location: "" });
    setFormError("");
  }

  async function handleCreate() {
    if (!form.title.trim()) { setFormError("El título es obligatorio."); return; }
    if (!form.scheduled_at) { setFormError("La fecha y hora son obligatorias."); return; }
    setSaving(true);
    setFormError("");
    try {
      await createMeeting({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        scheduled_at: form.scheduled_at,
        location: form.location.trim() || undefined,
      });
      reload("meetings");
      setShowCreate(false);
      resetForm();
    } catch {
      setFormError("No se pudo crear la reunión.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(meeting) {
    try {
      await deleteMeeting(meeting.id);
      reload("meetings");
    } catch {
      // silencioso
    } finally {
      setDeleteTarget(null);
    }
  }

  const columns = [
    { key: "title", label: "Título" },
    {
      key: "status",
      label: "Estado",
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] ?? "neutral"}>{row.status ?? "—"}</Badge>
      ),
    },
    {
      key: "scheduled_at",
      label: "Programada para",
      render: (row) => formatDateTime(row.scheduled_at),
    },
  ];

  return (
    <div className="db-view">
      <SectionHeader
        title="Reuniones"
        description="Programa y gestiona reuniones del centro educativo."
        action={
          <button className="db-btn db-btn--primary" onClick={() => { resetForm(); setShowCreate(true); }}>
            Nueva reunión
          </button>
        }
      />

      {error && <InlineAlert type="error" message={error} />}

      {loading && !data ? (
        <Spinner />
      ) : data && data.length === 0 ? (
        <EmptyState message="No hay reuniones registradas." />
      ) : (
        <Table columns={columns} rows={data ?? []} onDelete={(row) => setDeleteTarget(row)} />
      )}

      {showCreate && (
        <Modal title="Nueva reunión" onClose={() => { setShowCreate(false); resetForm(); }}>
          {formError && <InlineAlert type="error" message={formError} />}
          <Field label="Título">
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Nombre de la reunión"
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
          <Field label="Fecha y hora">
            <Input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
            />
          </Field>
          <Field label="Lugar">
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Sala de reuniones, virtual, etc."
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
          message={`¿Eliminar la reunión "${deleteTarget.title}"? Esta acción no se puede deshacer.`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}