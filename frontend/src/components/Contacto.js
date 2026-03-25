"use client";

import { useState } from "react";

const contactItems = [
  {
    label: "Correo electrónico",
    value: "info@ctppavas.ed.cr",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    label: "Teléfono",
    value: "(506) 2232-4400",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 10a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    label: "Dirección",
    value: "Pavas, San José, Costa Rica\nFrente al Centro Comercial Pavas",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: "Horario de atención",
    value: "Lun – Vie: 7:00 am – 4:00 pm",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

export default function Contacto() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      e.target.reset();
    }, 1000);
  };

  return (
    <section id="contacto" className="section section--white">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-label">Contáctenos</span>
          <h2 className="section-title">Estamos para atenderle</h2>
          <p className="section-desc">
            Tiene preguntas sobre admisiones, especialidades o servicios institucionales? Contáctenos y le responderemos a la brevedad.
          </p>
        </div>

        <div className="contacto-grid">
          <div className="contact-info">
            <h3>Información de contacto</h3>
            {contactItems.map(({ label, value, icon }) => (
              <div key={label} className="contact-item">
                <div className="contact-icon">{icon}</div>
                <div>
                  <div className="contact-label">{label}</div>
                  <div className="contact-value" style={{ whiteSpace: "pre-line" }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo</label>
                <input type="text" id="nombre" placeholder="Su nombre" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input type="email" id="email" placeholder="correo@ejemplo.com" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="asunto">Asunto</label>
              <input type="text" id="asunto" placeholder="En qué podemos ayudarle?" required />
            </div>
            <div className="form-group">
              <label htmlFor="mensaje">Mensaje</label>
              <textarea id="mensaje" placeholder="Escriba su mensaje aquí..." required />
            </div>

            {!submitted ? (
              <button type="submit" className="btn-submit" disabled={loading}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {loading ? "Enviando..." : "Enviar mensaje"}
              </button>
            ) : (
              <div className="form-success">
                Mensaje enviado exitosamente. Le contactaremos pronto.
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}