const valores = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    name: "Integridad",
    desc: "Actuamos con honestidad y transparencia en todos nuestros procesos.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
    name: "Responsabilidad",
    desc: "Formamos personas comprometidas con sus deberes y su entorno.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    name: "Comunidad",
    desc: "Trabajamos juntos como familia institucional hacia objetivos comunes.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    name: "Innovación",
    desc: "Adoptamos nuevas tecnologías y métodos pedagógicos de vanguardia.",
  },
];

const infoBlocks = [
  {
    title: "Misión",
    text: "Ofrecer a los estudiantes una formación técnica y humanística integral, que les permita insertarse exitosamente en el mercado laboral o continuar estudios superiores, contribuyendo al desarrollo nacional con ética y responsabilidad.",
  },
  {
    title: "Visión",
    text: "Ser un centro educativo técnico de excelencia, reconocido a nivel nacional por la calidad de su oferta académica, la innovación pedagógica y la formación en valores de sus egresados.",
  },
  {
    title: "Enfoque técnico",
    text: "Combinamos teoría y práctica mediante laboratorios equipados, talleres especializados y alianzas con empresas del sector productivo, asegurando que nuestros estudiantes desarrollen competencias reales y transferibles al mundo laboral.",
  },
];

export default function SobreNosotros() {
  return (
    <section id="sobre" className="section section--white">
      <div className="section-inner">
        <div className="sobre-grid">
          <div className="sobre-text">
            <span className="section-label">Sobre nosotros</span>
            <h2 className="section-title">Una institución comprometida con la excelencia técnica</h2>
            <p>
              El Colegio Técnico Profesional de Pavas es una institución pública de educación media técnica
              con más de tres décadas formando profesionales íntegros. Nuestro enfoque combina una sólida
              base académica con capacitación práctica y orientación vocacional.
            </p>
            <p>
              Nuestra <strong>misión</strong> es brindar educación técnica de calidad, promoviendo el
              pensamiento crítico, la innovación y los valores ciudadanos para que nuestros egresados
              contribuyan al desarrollo del país.
            </p>
            <p>
              Nuestra <strong>visión</strong> es ser reconocidos como el colegio técnico de referencia en
              la región, con egresados competitivos y comprometidos con la sociedad y el ambiente.
            </p>

            <div className="valores-grid">
              {valores.map(({ icon, name, desc }) => (
                <div key={name} className="valor-item">
                  <div className="valor-icon">{icon}</div>
                  <div className="valor-name">{name}</div>
                  <div className="valor-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sobre-aside">
            {infoBlocks.map(({ title, text }) => (
              <div key={title} className="info-block">
                <div className="info-block-title">{title}</div>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}