export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-shape hero-shape-1" />
      <div className="hero-shape hero-shape-2" />
      <div className="hero-shape hero-shape-3" />

      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-badge">Institución pública acreditada</div>
          <h1 className="hero-title">
            Formando líderes<br />
            técnicos para<br />
            <em>el futuro</em>
          </h1>
          <p className="hero-subtitle">
            El CTP Pavas ofrece educación técnica de calidad, preparando estudiantes con habilidades
            prácticas y profesionales para enfrentar los retos del mundo laboral.
          </p>
          <a href="/login" className="hero-cta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Ingresar al sistema
          </a>
        </div>

        <div className="hero-visual">
          <div className="stat-card">
            <div className="stat-number">1,200+</div>
            <div className="stat-label">Estudiantes activos</div>
          </div>
          <div className="stat-card-row">
            <div className="stat-card">
              <div className="stat-number">4</div>
              <div className="stat-label">Especialidades técnicas</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">30+</div>
              <div className="stat-label">Años de trayectoria</div>
            </div>
          </div>
          <div className="stat-card stat-card--inline">
            <div>
              <div className="stat-number stat-number--sm">98%</div>
              <div className="stat-label">Tasa de graduación</div>
            </div>
            <div className="stat-badge">Excelencia</div>
          </div>
        </div>
      </div>
    </section>
  );
}