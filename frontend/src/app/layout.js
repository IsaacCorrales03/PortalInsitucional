import "./globals.css";

export const metadata = {
  title: "CTP Pavas — Colegio Técnico Profesional",
  description:
    "El CTP Pavas ofrece educación técnica de calidad, preparando estudiantes con habilidades prácticas y profesionales para enfrentar los retos del mundo laboral.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}