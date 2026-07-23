import React, { useEffect, useState } from "react";
import "./Header.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 40);

      // 1. Safe Guard: Directly active "home" if near top of page
      if (scrollPosition < 100) {
        setActiveSection("home");
        return;
      }

      // 2. Loop sections to detect active section dynamically
      const sections = document.querySelectorAll("section[id]");
      sections.forEach((section) => {
        const top = section.offsetTop - 150; // offset adjustment for fixed navbar height
        const height = section.offsetHeight;
        const id = section.getAttribute("id");

        if (
          scrollPosition >= top &&
          scrollPosition < top + height
        ) {
          setActiveSection(id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header className={`pf-header ${scrolled ? "pf-header--scrolled" : ""}`}>
      <div className="pf-header__container">
        {/* Brand/Logo */}
        <h2 className="pf-header__brand">Tarun Sahu</h2>

        {/* Navigation Menu */}
        <nav className={`pf-header__nav ${menuOpen ? "active" : ""}`}>
          <a
            href="#"
            className={activeSection === "home" ? "active-link" : ""}
            onClick={closeMenu}
          >
            Home
          </a>
          <a
            href="#about"
            className={activeSection === "about" ? "active-link" : ""}
            onClick={closeMenu}
          >
            About
          </a>
          <a
            href="#education"
            className={activeSection === "education" ? "active-link" : ""}
            onClick={closeMenu}
          >
            Education
          </a>
          <a
            href="#skills"
            className={activeSection === "skills" ? "active-link" : ""}
            onClick={closeMenu}
          >
            Skills
          </a>
          <a
            href="#experience"
            className={activeSection === "experience" ? "active-link" : ""}
            onClick={closeMenu}
          >
            Experience
          </a>
          <a
            href="#projects"
            className={activeSection === "projects" ? "active-link" : ""}
            onClick={closeMenu}
          >
            Projects
          </a>
          <a
            href="#contact"
            className={activeSection === "contact" ? "active-link" : ""}
            onClick={closeMenu}
          >
            Contact
          </a>
        </nav>

        {/* Mobile Toggle Icon */}
        <div
          className={`pf-toggle ${menuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle Navigation"
          role="button"
          tabIndex={0}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Overlay Backdrop for Mobile */}
        {menuOpen && (
          <div className="pf-header__overlay" onClick={closeMenu}></div>
        )}
      </div>
    </header>
  );
}

export default Header;