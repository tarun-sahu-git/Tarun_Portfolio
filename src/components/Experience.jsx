import React, { useState, useEffect, useRef } from "react";
import "./Exprience.css";

import {
  FaBriefcase,
  FaCalendarAlt,
  FaBuilding,
  FaMapMarkerAlt,
  FaChevronDown,
  FaChevronUp,
  FaReact,
  FaNodeJs,
  FaPython,
  FaDatabase,
  FaCode,
  FaCheckCircle,
  FaServer,
  FaLayerGroup,
  FaProjectDiagram,
  FaLaptopCode,
  FaGitAlt,
  FaGithub,
  FaCloud,
  FaRocket
} from "react-icons/fa";

function Experience() {
  const [expanded, setExpanded] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleCard = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const statsSummary = [
    { icon: <FaBriefcase />, title: "2+ Internships", desc: "Hands-on Industry Exposure" },
    { icon: <FaLaptopCode />, title: "Full Stack Dev", desc: "MERN & Python Ecosystems" },
    { icon: <FaProjectDiagram />, title: "Live Client Projects", desc: "Real-world Product Delivery" },
    { icon: <FaLayerGroup />, title: "End-to-End Execution", desc: "Frontend, Backend & DBs" },
  ];

  const experienceData = [
    {
      id: 1,
      company: "Prolix Innovations Pvt. Ltd.",
      role: "Full Stack Developer Intern",
      duration: "4th Semester Internship",
      location: "Raipur Chhatishgadhh",
      domainBadges: ["Healthcare Project", "Full Stack Development", "MERN Stack"],

      description:
        "Architected and developed key modules for 'Medicare Clinic', a healthcare management system focused on simplifying doctor appointment bookings..",

      moreDescription:
        "During this 4th-semester internship, I spearheaded the frontend and backend integration for patient onboarding and appointment scheduling. I implemented role-based authentication, structured optimized MongoDB schemas, and developed high-performance REST APIs. Collaborated in an Agile workflow using Git, conducting code reviews and optimizing client-side performance.",

      technologies: [
        { name: "React", class: "tech-react", icon: <FaReact /> },
        { name: "Node.js", class: "tech-node", icon: <FaNodeJs /> },
        { name: "Express.js", class: "tech-express", icon: <FaServer /> },
        { name: "MongoDB", class: "tech-mongodb", icon: <FaDatabase /> },
        { name: "JavaScript", class: "tech-js", icon: <FaCode /> },
        { name: "Git", class: "tech-git", icon: <FaGitAlt /> },
      ],

      keyAchievements: [
        "Doctor Appointment Booking Engine",
        "JWT-based Authentication & Security",
        "Patient & Doctor Interactive Dashboards",
        "REST API Development & Express Routing",
        "Database Schema Design & Query Optimization",
        "Cross-Device Responsive UI Design",
      ],
    },

    {
      id: 2,
      company: "YashviTech IT Solutions Pvt. Ltd.",
      role: "Full Stack Developer Intern",
      duration: "Post M.Sc. Internship",
      location: "Ramnagar Near Disha College Raipur (C.G)",
      domainBadges: ["Client Projects", "Node & Django Full Stack", "Deployment & Tools"],

      description:
        "Engineered scalable web applications for enterprise client requirements, leveraging MERN, Python/Django, Git workflow, and Vercel cloud deployments.",

      moreDescription:
        "Post M.Sc., I tackled production-level software challenges at YashviTech. Managed source control with Git & GitHub, designed RESTful APIs tested via Postman, and deployed live client builds on Vercel. Worked across multi-database environments (MongoDB & PostgreSQL) to resolve production bugs and optimize site performance.",

      technologies: [
        { name: "React", class: "tech-react", icon: <FaReact /> },
        { name: "Node.js", class: "tech-node", icon: <FaNodeJs /> },
        { name: "Python", class: "tech-python", icon: <FaPython /> },
        { name: "Django", class: "tech-django", icon: <FaCode /> },
        { name: "PostgreSQL", class: "tech-postgres", icon: <FaDatabase /> },
        { name: "MongoDB", class: "tech-mongodb", icon: <FaDatabase /> },
        { name: "Git", class: "tech-git", icon: <FaGitAlt /> },
        { name: "GitHub", class: "tech-github", icon: <FaGithub /> },
        { name: "Vercel", class: "tech-vercel", icon: <FaCloud /> },
        { name: "Postman API", class: "tech-postman", icon: <FaRocket /> },
      ],

      keyAchievements: [
        "Production-Grade Client Web Platforms",
        "Cloud Application Deployment on Vercel",
        "Git & GitHub Version Control & Team Workflow",
        "Django REST Framework & Python Backend APIs",
        "API Testing & Optimization using Postman",
        "PostgreSQL Relational DB Design & Query Tuning",
        "JWT & Session Security Implementations",
      ],
    },
  ];

  return (
    <section className="experience" id="experience" ref={sectionRef}>
      <div className="exp-glow exp-glow-1" aria-hidden="true" />
      <div className="exp-glow exp-glow-2" aria-hidden="true" />

      <div className="experience-container">
        <div className="experience-heading">
          <span className="exp-badge">PROFESSIONAL JOURNEY</span>
          <h2>Work & Internship Experience</h2>
          <p>
            Bridging academic foundation with industry excellence by engineering full-stack healthcare platforms and production-ready client applications.
          </p>
        </div>

        <div className="experience-summary-grid">
          {statsSummary.map((item, index) => (
            <div key={index} className="summary-card">
              <div className="summary-icon">{item.icon}</div>
              <div className="summary-info">
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={`experience-dual-grid ${isVisible ? "animate-in" : ""}`}>
          {experienceData.map((item, index) => (
            <div key={item.id} className={`experience-col col-${index + 1}`}>
              <div className="experience-card">
                
                <div className="card-header-top">
                  <div className="company-badge-icon">
                    <FaBuilding />
                  </div>
                  <div>
                    <h3 className="role-title">{item.role}</h3>
                    <h4 className="company-name">{item.company}</h4>
                  </div>
                </div>

                <div className="meta-info-row">
                  <span className="meta-pill">
                    <FaCalendarAlt /> {item.duration}
                  </span>
                  <span className="meta-pill">
                    <FaMapMarkerAlt /> {item.location}
                  </span>
                </div>

                <div className="domain-badges">
                  {item.domainBadges.map((badge, bIdx) => (
                    <span key={bIdx} className="domain-pill">
                      {badge}
                    </span>
                  ))}
                </div>

                <p className="short-desc">{item.description}</p>

                {/* TECH ICONS INCLUDING GIT, GITHUB, VERCEL, POSTMAN */}
                <div className="tech-icons-row">
                  {item.technologies.map((tech, tIdx) => (
                    <div
                      key={tIdx}
                      className={`tech-icon-bubble ${tech.class}`}
                      data-tooltip={tech.name}
                    >
                      {tech.icon}
                    </div>
                  ))}
                </div>

                {expanded[item.id] && (
                  <div className="expanded-content">
                    <div className="more-description">
                      <p>{item.moreDescription}</p>
                    </div>

                    <div className="key-achievements">
                      <h4>Key Accomplishments & Responsibilities</h4>
                      <div className="achievements-grid">
                        {item.keyAchievements.map((work, respIdx) => (
                          <div key={respIdx} className="achievement-item">
                            <FaCheckCircle className="check-icon" />
                            <span>{work}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  className="see-more-btn"
                  onClick={() => toggleCard(item.id)}
                  aria-expanded={!!expanded[item.id]}
                >
                  {expanded[item.id] ? (
                    <>
                      Collapse Details <FaChevronUp />
                    </>
                  ) : (
                    <>
                      View Full Details <FaChevronDown />
                    </>
                  )}
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;