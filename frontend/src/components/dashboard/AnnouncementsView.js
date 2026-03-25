"use client";

import { useState } from "react";
import { useEntity } from "@/lib/useEntity";
import { createAnnouncement, publishAnnouncement, deleteAnnouncement } from "@/lib/api";
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

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("es-CR", { dateStyle: "medium", timeStyle: "short" });
}

export default function AnnouncementsView() {
  const { data, loading, error, reload } = useEntity("announcements");

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [publishTarget, setPublishTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    title: "",
    content: "",
    target_role: "",
    target_section_id: "",
  });

  function resetForm() {
    setForm({ title: "", content: "", target_role: "", target_section_id: "" });
    setFormError("");
  }

  async function handleCreate() {
    if (!form.title.trim()) { setFormError("El título es obligatorio."); return; }
    if (!form.content.trim()) { setFormError("El contenido es obligatorio."); return; }
    setSaving(true);
    setFormError("");
    try {
      await createAnnouncement({
        title: form.title.trim(),
        content: form.content.trim(),
        target_role: form.target_role.trim() || undefined,
        target_section_id: form.target_section_id ? Number(form.target_section_id) : undefined,
      });
      reload("announcements");
      setShowCreate(false);
      resetForm();
    } catch {
      setFormError("No se pudo crear el anuncio.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(announcement) {
    try {
      await publishAnnouncement(announcement.id);
      reload("announcements");
    } catch {
      // silencioso
    } finally {
      setPublishTarget(null);
    }
  }

  async function handleDelete(announcement) {
    try {
      await deleteAnnouncement(announcement.id);
      reload("announcements");
    } catch {
      // silencioso
    } finally {
      setDeleteTarget(null);
    }
  }

  const columns = [
    { key: "title", label: "Título" },
    {
      key: "is_published",
      label: "Estado",
      render: (row) =>
        row.is_published ? (
          <Badge variant="success">Publicado</Badge>
        ) : (
          <Badge variant="warning">Borrador</Badge>
        ),
    },
    {
      key: "published_at",
      label: "Publicado el",
      render: (row) => formatDate(row.published_at),
    },
    {
      key: "_publish",
      label: "",
      render: (row) =>
        !row.is_published ? (
          <button
            className="db-btn db-btn--ghost db-btn--sm"
            onClick={(e) => { e.stopPropagation(); setPublishTarget(row); }}
          >
            Publicar
          </button>
        ) : null,
    },
  ];

  return (
    <div className="db-view">
      <SectionHeader
        title="Anuncios"
        description="Redacta y publica anuncios para la comunidad educativa."
        action={
          <button className="db-btn db-btn--primary" onClick={() => { resetForm(); setShowCreate(true); }}>
            Nuevo anuncio
          </button>
        }
      />

      {error && <InlineAlert type="error" message={error} />}

      {loading && !data ? (
        <Spinner />
      ) : data && data.length === 0 ? (
        <EmptyState message="No hay anuncios registrados." />
      ) : (
        <Table columns={columns} rows={data ?? []} onDelete={(row) => setDeleteTarget(row)} />
      )}

      {showCreate && (
        <Modal title="Nuevo anuncio" onClose={() => { setShowCreate(false); resetForm(); }}>
          {formError && <InlineAlert type="error" message={formError} />}
          <Field label="Título">
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Título del anuncio"
            />
          </Field>
          <Field label="Contenido">
            <Textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Escribe el mensaje del anuncio..."
              rows={5}
            />
          </Field>
          <Field label="Rol destinatario (opcional)">
            <Input
              value={form.target_role}
              onChange={(e) => setForm((f) => ({ ...f, target_role: e.target.value }))}
              placeholder="ej. estudiante, profesor"
            />
          </Field>
          <div className="db-modal-actions">
            <button className="db-btn db-btn--ghost" onClick={() => { setShowCreate(false); resetForm(); }}>
              Cancelar
            </button>
            <button className="db-btn db-btn--primary" onClick={handleCreate} disabled={saving}>
              {saving ? <Spinner size={16} /> : "Guardar borrador"}
            </button>
          </div>
        </Modal>
      )}

      {publishTarget && (
        <ConfirmDialog
          message={`¿Publicar el anuncio "${publishTarget.title}"? Será visible para los destinatarios.`}
          onConfirm={() => handlePublish(publishTarget)}
          onCancel={() => setPublishTarget(null)}
          confirmLabel="Publicar"
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`¿Eliminar el anuncio "${deleteTarget.title}"? Esta acción no se puede deshacer.`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}