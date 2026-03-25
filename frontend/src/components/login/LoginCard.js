import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginCard() {
  return (
    <div className="login-card">
      {/* Brand */}
      <div className="login-brand">
        <div className="login-brand-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <div>
          <div className="login-brand-name">CTP Pavas</div>
          <div className="login-brand-sub">Sistema de Gestión Institucional</div>
        </div>
      </div>

      {/* Heading */}
      <div className="login-heading">
        <h1 className="login-title">Bienvenido</h1>
        <p className="login-subtitle">
          Ingrese sus credenciales institucionales para acceder al sistema.
        </p>
      </div>

      {/* Form */}
      <LoginForm />

      {/* Footer */}
      <div className="login-card-footer">
        <Link href="/" className="login-back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver al sitio principal
        </Link>
        <span className="login-help-text">
          Problemas para ingresar?{" "}
          <a href="mailto:info@ctppavas.ed.cr" className="login-help-link">
            Contacte al administrador
          </a>
        </span>
      </div>
    </div>
  );
}