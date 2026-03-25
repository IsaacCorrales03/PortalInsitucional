"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navItems = [
  { label: "Sobre Nosotros", href: "#sobre" },
  { label: "Especialidades", href: "#especialidades" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const onScroll = () => {
      let current = "";
      sections.forEach((s) => {
        if (window.scrollY >= s.offsetTop - 100) current = s.id;
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link href="#" className="nav-brand">
          <div className="nav-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div className="nav-name">
            CTP Pavas
            <span>Colegio Técnico Profesional</span>
          </div>
        </Link>

        <ul className="nav-links">
          {navItems.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className={activeSection === href.slice(1) ? "nav-link active" : "nav-link"}
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href="/login" className="nav-link btn-ingresar">Ingresar</a>
          </li>
        </ul>

        <button
          className="hamburger"
          aria-label="Menú"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {navItems.map(({ label, href }) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <a href="/login" className="btn-ingresar">Ingresar al sistema</a>
        </div>
      )}
    </nav>
  );
}