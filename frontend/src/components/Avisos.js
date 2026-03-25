const avisos = [
  {
    title: "Matrícula Extraordinaria — Primer Semestre 2025",
    tag: "Importante",
    tagClass: "tag-red",
    date: "Publicado: 10 de marzo, 2025",
    body: "El proceso de matrícula extraordinaria estará habilitado del 18 al 25 de marzo. Los estudiantes interesados deben presentarse a la secretaría con documentos originales y completar el formulario de solicitud correspondiente.",
  },
  {
    title: "Calendario de Exámenes de Ampliación — Marzo 2025",
    tag: "Académico",
    tagClass: "tag-orange",
    date: "Publicado: 7 de marzo, 2025",
    body: "Se publica el calendario de exámenes de ampliación para el período de marzo. Los estudiantes con materias pendientes deben coordinar con sus profesores guías para confirmar horarios y requisitos de cada asignatura.",
  },
  {
    title: "Nuevas Becas MEP para Estudiantes de Bajos Recursos",
    tag: "Becas",
    tagClass: "tag-green",
    date: "Publicado: 3 de marzo, 2025",
    body: "El Ministerio de Educación Pública ha abierto el proceso de solicitud de becas FONABE para el ciclo 2025. Los estudiantes interesados pueden retirar los formularios en orientación a partir del 15 de marzo.",
  },
];

export default function Avisos() {
  return (
    <section id="avisos" className="section section--white">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-label">Comunicados</span>
          <h2 className="section-title">Avisos institucionales</h2>
          <p className="section-desc">
            Información importante para estudiantes, familias y personal docente del CTP Pavas.
          </p>
        </div>

        <div className="cards-grid">
          {avisos.map(({ title, tag, tagClass, date, body }) => (
            <div key={title} className="aviso-card">
              <div className="aviso-header">
                <div className="aviso-title">{title}</div>
                <span className={`card-tag ${tagClass}`}>{tag}</span>
              </div>
              <div className="aviso-date">{date}</div>
              <div className="aviso-body">{body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}