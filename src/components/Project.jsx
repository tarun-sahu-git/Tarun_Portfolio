import React, { useRef, useState } from "react";
import "./Project.css";
import Cranoist from "./Image/Cranoist.png";
import Devdeepam from "./Image/Devdeepam.png";
import Restuarant from "./Image/Restuarant.png";
import Holiday from "./Image/Holiday.png";
import Ngo from "./Image/Ngo.png";

// Icons for buttons and navigation
import {
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
  FaGithub,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";

const projects = [
  {
    id: 1,
    title: "Holiday Planner",
    image: Holiday,
    description:
      "A complete holiday planning platform where users can discover destinations, hotels, restaurants, transportation, weather forecasts, travel packages and online booking with secure payment integration.",
    tech: ["React", "Node.js", "Express", "MongoDB", "JWT", "Razorpay"],
    live: "https://holiday-planner-rho-orcin.vercel.app/",
    github: "https://github.com/tarun-sahu-git/holiday_planner",
  },
  {
    id: 2,
    title: "NGO Management System",
    image: Ngo,
    description:
      "Modern NGO management platform including Donation, Membership, Volunteer, Sponsor, Admin Dashboard, Reports and Authentication.",
    tech: ["React", "Django", "PostgreSQL", "Razorpay", "JWT"],
    live: "https://ngo-project-eta-seven.vercel.app/",
    github: "https://github.com/tarun-sahu-git/Ngo_projectc",
  },
  {
    id: 3,
    title: "Hannaya Catering",
    image: Restuarant,
    description:
      "Hannaya Catering is a modern food service platform offering restaurant dining, tiffin services, catering, and online food delivery. The application allows customers to browse menus, place online orders, explore catering packages, and enjoy fresh, hygienic meals with a seamless ordering experience.",
    tech: ["React", "CSS", "JavaScript"],
    live: "https://restaurant-app-three-blond.vercel.app/",
    github: "https://github.com/tarun-sahu-git/restaurant-app",
  },
  {
    id: 4,
    title: "DevDeepam Solar",
    image: Devdeepam,
    description:
      "A modern solar energy company website developed for DevDeepam Solar, offering complete information about rooftop solar panel installation, maintenance, energy savings, and government-backed schemes like PM Surya Ghar Yojana. The platform enables customers to explore services and request consultations online.",
    tech: ["React", "JavaScript", "CSS"],
    live: "https://devdepam.com/",
    github: "#",
  },
  {
    id: 5,
    title: "ERP Management",
    image: Cranoist,
    description:
      "ERP Management System is a comprehensive business management platform designed to streamline daily operations. It includes modules for inventory management, accounting, ledger creation, sales and purchase tracking, employee management, reporting, and secure authentication. Users can export reports in PDF and Excel formats for efficient business analysis.",
    tech: ["React", "Django", "PostgreSQL"],
    live: "https://erp.cranoistmhe.com/",
    github: "#",
  },
];

function Project() {
  const scrollRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Horizontal Scroll Handler
  const scroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth = 340; // Card width + gap
      const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Helper component for identical GitHub button styling
  const renderGithubButton = (githubUrl, isModal = false) => {
    const isAvailable = githubUrl && githubUrl !== "#";
    const label = isModal ? "GitHub Repository" : "GitHub";

    if (isAvailable) {
      return (
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="github-btn"
        >
          <FaGithub /> {label}
        </a>
      );
    }

    return (
      <button
        type="button"
        className="github-btn private-btn"
        onClick={() => alert("This project source code is private/confidential.")}
      >
        <FaGithub /> {label}
      </button>
    );
  };

  return (
    <section className="project" id="projects">
      <div className="project-container">
        {/* SECTION HEADER */}
        <div className="project-header">
          <span className="project-subtitle">My Portfolio</span>
          <h2 className="project-title">Recent Projects</h2>
          <p className="project-desc">
            Explore my latest Full Stack Development projects built with modern technologies like React, Node.js, Django, and cloud databases.
          </p>
        </div>

        {/* HORIZONTAL SLIDER WRAPPER */}
        <div className="slider-wrapper">
          <div className="project-slider" ref={scrollRef}>
            {projects.map((item) => (
              <div className="project-card" key={item.id}>
                <div className="project-image">
                  <img src={item.image} alt={item.title} />
                  <span className="card-badge">Full Stack</span>
                </div>

                <div className="project-content">
                  <h3>{item.title}</h3>
                  <p className="truncated-desc">{item.description}</p>

                  <button
                    className="read-more-link"
                    onClick={() => setSelectedProject(item)}
                  >
                    <FaInfoCircle /> View Details
                  </button>

                  <div className="tech-list">
                    {item.tech.map((tech, index) => (
                      <span key={index}>{tech}</span>
                    ))}
                  </div>

                  <div className="project-buttons">
                    <a
                      href={item.live}
                      target="_blank"
                      rel="noreferrer"
                      className="live-btn"
                    >
                      <FaExternalLinkAlt /> Live
                    </a>

                    {renderGithubButton(item.github, false)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTERED NAV CONTROLS */}
        <div className="slider-controls">
          <button
            className="control-btn"
            onClick={() => scroll("left")}
            aria-label="Scroll Left"
          >
            <FaChevronLeft />
          </button>
          <span className="control-indicator">Scroll to Explore</span>
          <button
            className="control-btn"
            onClick={() => scroll("right")}
            aria-label="Scroll Right"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* PROJECT DETAILS MODAL */}
      {selectedProject && (
        <div className="project-modal-backdrop" onClick={() => setSelectedProject(null)}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedProject(null)}
            >
              <FaTimes />
            </button>

            <div className="modal-image">
              <img src={selectedProject.image} alt={selectedProject.title} />
            </div>

            <div className="modal-body">
              <h3>{selectedProject.title}</h3>
              <p>{selectedProject.description}</p>

              <h4>Technologies Used</h4>
              <div className="tech-list">
                {selectedProject.tech.map((tech, idx) => (
                  <span key={idx}>{tech}</span>
                ))}
              </div>

              <div className="modal-actions">
                <a
                  href={selectedProject.live}
                  target="_blank"
                  rel="noreferrer"
                  className="live-btn"
                >
                  <FaExternalLinkAlt /> Visit Live App
                </a>

                {renderGithubButton(selectedProject.github, true)}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Project;