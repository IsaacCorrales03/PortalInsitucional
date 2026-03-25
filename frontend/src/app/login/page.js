import LoginCard from "@/components/login/LoginCard";

export const metadata = {
  title: "Ingresar — CTP Pavas",
  description: "Acceso al Sistema de Gestión Institucional del Colegio Técnico Profesional de Pavas.",
};

export default function LoginPage() {
  return (
    <div className="login-page">
      {/* Decorative background panel */}
      <div className="login-panel" aria-hidden="true">
        <div className="login-panel-shapes">
          <div className="lp-shape lp-shape-1" />
          <div className="lp-shape lp-shape-2" />
          <div className="lp-shape lp-shape-3" />
        </div>
        <div className="login-panel-content">
          <blockquote className="login-quote">
            <p>
              "La educación técnica es el puente entre el conocimiento y el mundo laboral."
            </p>
            <footer>Colegio Técnico Profesional de Pavas</footer>
          </blockquote>
          <div className="login-panel-stats">
            <div className="lp-stat">
              <span className="lp-stat-num">1,200+</span>
              <span className="lp-stat-label">Estudiantes</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-num">4</span>
              <span className="lp-stat-label">Especialidades</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-num">30+</span>
              <span className="lp-stat-label">Años</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="login-form-side">
        <LoginCard />
      </div>
    </div>
  );
}