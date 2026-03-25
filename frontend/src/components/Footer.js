'use client';

const navLinks = [
  { href: '#',               label: 'Inicio' },
  { href: '#nosotros',       label: 'Sobre Nosotros' },
  { href: '#especialidades', label: 'Especialidades' },
  { href: '#valores',        label: 'Valores' },
  { href: '#anuncios',       label: 'Fechas Importantes' },
  { href: '#contacto',       label: 'Contáctanos' },
];

const contacts = [
  { label: 'Correo',              value: 'ctp.depavas@mep.go.cr',   href: 'mailto:ctp.depavas@mep.go.cr' },
  { label: 'Sitio web',           value: 'ctpdepavas.com',           href: 'https://ctpdepavas.com/' },
  { label: 'WhatsApp Diurno',     value: '8850-5144',                href: 'https://wa.me/50688505144' },
  { label: 'WhatsApp Nocturno',   value: '8463-4672',                href: 'https://wa.me/50684634672' },
  { label: 'Teléfono',            value: '+506 2296-2805',           href: 'tel:+50622962805' },
];

export default function Footer() {
  return (
    <footer id="contacto" style={{
      background: '#111e33',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>

      {/* Gold top bar */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, var(--gold) 0%, #e8b84b 50%, var(--gold) 100%)' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 32px 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 64, marginBottom: 64,
        }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
              <div style={{
                width: 44, height: 44, background: 'var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14,
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3 7v11h5v-5h4v5h5V7L10 2z" fill="white" fillOpacity="0.9"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: '#fff', lineHeight: 1.2 }}>
                  Colegio Técnico Profesional
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', marginTop: 2 }}>
                  de Pavas
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.85, maxWidth: 340, marginBottom: 28 }}>
              Institución comprometida con la formación integral y el desarrollo de habilidades
              técnicas. Educación pública de calidad para el distrito de Pavas y Costa Rica.
            </p>

            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', lineHeight: 1.7 }}>
              San José, Pavas · Ruta 104, calle 130A<br />Urbanización Llanos del Sol
            </div>

            {/* Social row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 4 }}>
                Síguenos:
              </span>
              {['Fb', 'Ig', 'Yt'].map(s => (
                <a key={s} href="#" style={{
                  width: 34, height: 34,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
                  textDecoration: 'none', transition: 'all 0.18s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,146,42,0.18)'; e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'rgba(196,146,42,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >{s}</a>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div>
            <div style={{
              fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)', marginBottom: 22,
            }}>Navegación</div>
            {navLinks.map(l => (
              <a key={l.href} href={l.href} style={{
                display: 'block', padding: '7px 0',
                fontSize: 12.5, color: 'rgba(255,255,255,0.45)',
                textDecoration: 'none', transition: 'color 0.16s',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
              >{l.label}</a>
            ))}
          </div>

          {/* Contacts */}
          <div>
            <div style={{
              fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)', marginBottom: 22,
            }}>Contacto</div>
            {contacts.map(c => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" style={{
                display: 'block', padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                textDecoration: 'none', transition: 'color 0.16s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'inherit'}
              >
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.24)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>{c.value}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 20, paddingBottom: 24,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>
            © {new Date().getFullYear()} CTP de Pavas · Ministerio de Educación Pública · Costa Rica
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.04em' }}>
            Educación pública de calidad
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
        }
      `}</style>
    </footer>
  );
}