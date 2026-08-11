import React from "react";
import "./Footer.css";

import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaArrowUp,
  FaExternalLinkAlt,
  FaHeart
} from "react-icons/fa";

function Footer() {
  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const techLinks = [
    { name: "React.js", url: "https://react.dev/" },
    { name: "Node.js", url: "https://nodejs.org/" },
    { name: "Express", url: "https://expressjs.com/" },
    { name: "MongoDB", url: "https://www.mongodb.com/" },
    { name: "Python", url: "https://www.python.org/" },
    { name: "Django", url: "https://www.djangoproject.com/" },
  ];

  const toolLinks = [
    { name: "Git", url: "https://git-scm.com/" },
    { name: "GitHub", url: "https://github.com/" },
    { name: "Vercel", url: "https://vercel.com/" },
    { name: "Postman", url: "https://www.postman.com/" },
  ];

  return (
    <footer className="footer">
      {/* MAIN SINGLE ROW LAYOUT */}
      <div className="footer-container">
        
        {/* COL 1: BRAND */}
     {/* COL 1: BRAND WITH CIRCULAR LOGO */}
<div className="footer-col brand-col">
  <div className="footer-avatar-wrapper">
    <img
      src="\documents\\Tarun.png" // Replace with your image path (e.g. "/assets/profile.jpg")
      alt="Tarun Sahu Logo"
      className="footer-avatar-img"
    />
  </div>
  <h2 className="brand-name">Tarun Sahu</h2>
  <p className="brand-tagline">Full Stack Developer</p>
</div>

        {/* COL 2: TECHNOLOGIES */}
        <div className="footer-col">
          <h3 className="col-heading">Technologies</h3>
          <div className="col-links">
            {techLinks.map((tech, idx) => (
              <a key={idx} href={tech.url} target="_blank" rel="noreferrer">
                {tech.name} <FaExternalLinkAlt className="ext-icon" />
              </a>
            ))}
          </div>
        </div>

        {/* COL 3: TOOLS */}
        <div className="footer-col">
          <h3 className="col-heading">Tools</h3>
          <div className="col-links">
            {toolLinks.map((tool, idx) => (
              <a key={idx} href={tool.url} target="_blank" rel="noreferrer">
                {tool.name} <FaExternalLinkAlt className="ext-icon" />
              </a>
            ))}
          </div>
        </div>

        {/* COL 4: QUICK LINKS */}
        <div className="footer-col">
          <h3 className="col-heading">Quick Links</h3>
          <div className="col-links">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </div>
        </div>

        {/* COL 5: CONTACT */}
        <div className="footer-col contact-col">
          <h3 className="col-heading">Contact</h3>
          <div className="col-links">
            <a href="mailto:tarunsahut754@gmail.com">
              <FaEnvelope /> Email
            </a>
            <a href="tel:+919302706772">
              <FaPhoneAlt /> +91 9302706772
            </a>
            <span className="location-text">
              <FaMapMarkerAlt /> Raipur, CG
            </span>
          </div>
        </div>

      </div>

      {/* CENTERED SOCIAL LINKS ROW */}
      <div className="footer-social-bar">
        <div className="social-links">
          <a href="https://github.com/tarun-sahu-git" target="_blank" rel="noreferrer" aria-label="GitHub">
            <FaGithub />
          </a>
          <a href="https://www.linkedin.com/in/tarunsahu" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <FaLinkedin />
          </a>
          <a href="https://www.instagram.com/tarunsahu0274" target="_blank" rel="noreferrer" aria-label="Instagram">
            <FaInstagram />
          </a>
        </div>
      </div>

      {/* BOTTOM BAR: POWERED BY */}
      <div className="footer-bottom">
        <p>
          Powered by <span>Tarun Sahu</span> <FaHeart className="heart" /> © {new Date().getFullYear()} All Rights Reserved.
        </p>
        <button className="scroll-top" onClick={scrollTop} aria-label="Scroll to top">
          <FaArrowUp />
        </button>
      </div>
    </footer>
  );
}

export default Footer;