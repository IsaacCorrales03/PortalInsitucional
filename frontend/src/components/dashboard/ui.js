"use client";

import { useEffect } from "react";

// ── SPINNER ────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <span
      className="db-spinner"
      style={{ width: size, height: size }}
      aria-label="Cargando"
    />
  );
}

// ── BADGE ──────────────────────────────────────────────
const badgeVariants = {
  activo:     "badge--green",
  aprobado:   "badge--green",
  inactivo:   "badge--red",
  reprobado:  "badge--red",
  retirado:   "badge--orange",
  pendiente:  "badge--gray",
  profesor:   "badge--blue",
  estudiante: "badge--teal",
  admin:      "badge--purple",
  superadmin: "badge--purple",
};

export function Badge({ label }) {
  const cls = badgeVariants[label?.toLowerCase()] ?? "badge--gray";
  return <span className={`db-badge ${cls}`}>{label}</span>;
}

// ── EMPTY STATE ────────────────────────────────────────
export function EmptyState({ message = "Sin resultados", action }) {
  return (
    <div className="db-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p>{message}</p>
      {action}
    </div>
  );
}

// ── ALERT INLINE ──────────────────────────────────────
export function InlineAlert({ message, variant = "error" }) {
  if (!message) return null;
  return (
    <div className={`db-inline-alert db-inline-alert--${variant}`} role="alert">
      {message}
    </div>
  );
}

// ── TABLE ──────────────────────────────────────────────
export function Table({ columns, rows, onEdit, onDelete, extraActions }) {
  return (
    <div className="db-table-wrap">
      <table className="db-table">
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key}>{c.label}</th>)}
            <th className="db-table-actions-th">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map((c) => (
                <td key={c.key}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}
                </td>
              ))}
              <td className="db-table-actions">
                {extraActions?.(row)}
                {onEdit && (
                  <button className="db-action-btn db-action-btn--edit" onClick={() => onEdit(row)} title="Editar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}
                {onDelete && (
                  <button className="db-action-btn db-action-btn--delete" onClick={() => onDelete(row)} title="Eliminar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── MODAL ──────────────────────────────────────────────
// Agrega disableBackdropClose a los props
export function Modal({ title, onClose, children, size = "md", disableBackdropClose = false }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !disableBackdropClose) onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, disableBackdropClose]);

  return (
    <div
      className="db-modal-backdrop"
      onClick={(e) => { if (!disableBackdropClose && e.target === e.currentTarget) onClose(); }}
    >
      <div className={`db-modal db-modal--${size}`} role="dialog" aria-modal="true">
        <div className="db-modal-header">
          <h3 className="db-modal-title">{title}</h3>
          <button className="db-modal-close" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="db-modal-body">{children}</div>
      </div>
    </div>
  );
}
// ── CONFIRM DIALOG ─────────────────────────────────────
export function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <Modal title="Confirmar acción" onClose={onCancel} size="sm">
      <p className="db-confirm-msg">{message}</p>
      <div className="db-confirm-actions">
        <button className="db-btn db-btn--ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button className="db-btn db-btn--danger" onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size={16} /> : "Confirmar"}
        </button>
      </div>
    </Modal>
  );
}

// ── FORM FIELD ─────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div className="db-field">
      <label className="db-field-label">{label}</label>
      {children}
    </div>
  );
}

export function Input({ ...props }) {
  return <input className="db-input" {...props} />;
}

export function Select({ children, ...props }) {
  return <select className="db-input" {...props}>{children}</select>;
}

export function Textarea({ ...props }) {
  return <textarea className="db-input db-textarea" {...props} />;
}

// ── SECTION HEADER ─────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="db-section-header">
      <div>
        <h2 className="db-section-title">{title}</h2>
        {subtitle && <p className="db-section-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}