"use client";

import { useState } from "react";
import { useEntity } from "@/lib/useEntity";
import {
  createPermission,
  deletePermission,
} from "@/lib/api";
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
} from "@/components/dashboard/ui";

export default function PermissionsView() {
  const { data, loading, error, reload } = useEntity("permissions");

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({ code: "", description: "" });

  function resetForm() {
    setForm({ code: "", description: "" });
    setFormError("");
  }

  async function handleCreate() {
    if (!form.code.trim()) {
      setFormError("El código del permiso es obligatorio.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createPermission({ code: form.code.trim(), description: form.description.trim() || undefined });
      reload("permissions");
      setShowCreate(false);
      resetForm();
    } catch {
      setFormError("No se pudo crear el permiso.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(permission) {
    try {
      await deletePermission(permission.id);
      reload("permissions");
    } catch {
      // silencioso — la tabla seguirá visible
    } finally {
      setDeleteTarget(null);
    }
  }

  const columns = [
    { key: "code", label: "Código" },
    { key: "description", label: "Descripción" },
  ];

  return (
    <div className="db-view">
      <SectionHeader
        title="Permisos"
        description="Gestiona los permisos del sistema."
        action={
          <button className="db-btn db-btn--primary" onClick={() => { resetForm(); setShowCreate(true); }}>
            Nuevo permiso
          </button>
        }
      />

      {error && <InlineAlert type="error" message={error} />}

      {loading && !data ? (
        <Spinner />
      ) : data && data.length === 0 ? (
        <EmptyState message="No hay permisos registrados." />
      ) : (
        <Table
          columns={columns}
          rows={data ?? []}
          onDelete={(row) => setDeleteTarget(row)}
        />
      )}

      {showCreate && (
        <Modal title="Nuevo permiso" onClose={() => { setShowCreate(false); resetForm(); }}>
          {formError && <InlineAlert type="error" message={formError} />}
          <Field label="Código">
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="ej. manage_events"
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
          message={`¿Eliminar el permiso "${deleteTarget.code}"? Esta acción no se puede deshacer.`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}