const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const eventos = [
  {
    date: "15 de abril, 2025",
    title: "Feria Científica y Tecnológica 2025",
    desc: "Presentación de proyectos innovadores desarrollados por estudiantes de todas las especialidades. Abierto al público en general.",
    tag: "Académico",
    tagClass: "tag-blue",
  },
  {
    date: "22 de abril, 2025",
    title: "Día del Estudiante — Actividades Deportivas",
    desc: "Torneo interclases de fútbol, básquetbol y atletismo. Convivencia institucional con reconocimientos a los mejores deportistas del año.",
    tag: "Deportivo",
    tagClass: "tag-green",
  },
  {
    date: "5 de mayo, 2025",
    title: "Graduación Técnica Generación 2025",
    desc: "Ceremonia de graduación de los estudiantes que completaron su bachillerato técnico. Acto solemne con entrega de diplomas y reconocimientos.",
    tag: "Ceremonial",
    tagClass: "tag-blue",
  },
];

export default function Eventos() {
  return (
    <section id="eventos" className="section section--bg">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-label">Próximamente</span>
          <h2 className="section-title">Eventos institucionales</h2>
          <p className="section-desc">
            Actividades académicas, culturales y deportivas que fortalecen nuestra comunidad educativa.
          </p>
        </div>

        <div className="cards-grid">
          {eventos.map(({ date, title, desc, tag, tagClass }) => (
            <div key={title} className="card">
              <div className="card-date">{date}</div>
              <div className="card-title">{title}</div>
              <div className="card-desc">{desc}</div>
              <div className="card-footer">
                <span className={`card-tag ${tagClass}`}>{tag}</span>
                <a href="#" className="card-link">
                  Ver más <ChevronRight />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}