import React, { useEffect, useRef, useState } from "react";
import {
  FaCode,
  FaServer,
  FaDatabase,
  FaTools,
  FaReact,
  FaHtml5,
  FaCss3Alt,
  FaJsSquare,
  FaBootstrap,
  FaNodeJs,
  FaPython,
  FaGitAlt,
  FaGithub,
} from "react-icons/fa";
import {
  SiExpress,
  SiDjango,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiPostman,
  SiJsonwebtokens,
} from "react-icons/si";
import { VscCode } from "react-icons/vsc";
import "./Skill.css";

// Animated Counter Sub-Component for Developer Stats
const Counter = ({ target, suffix = "", isVisible }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const end = parseInt(target, 10);
    if (isNaN(end)) return;

    const duration = 1800;
    const steps = 40;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const currentVal = Math.floor(end * progress);

      if (currentStep >= steps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(currentVal);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isVisible, target]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

const skillData = [
  {
    category: "Frontend",
    icon: <FaCode />,
    description: "Client-side interfaces & state management.",
    skills: [
      { name: "React.js", level: "92%", status: "Advanced", icon: <FaReact /> },
      { name: "JavaScript", level: "90%", status: "Advanced", icon: <FaJsSquare /> },
      { name: "HTML5", level: "95%", status: "Advanced", icon: <FaHtml5 /> },
      { name: "CSS3", level: "92%", status: "Advanced", icon: <FaCss3Alt /> },
      { name: "Bootstrap", level: "90%", status: "Intermediate", icon: <FaBootstrap /> },
    ],
  },
  {
    category: "Backend",
    icon: <FaServer />,
    description: "Server logic, REST APIs & security.",
    skills: [
      { name: "Node.js", level: "90%", status: "Advanced", icon: <FaNodeJs /> },
      { name: "Express.js", level: "88%", status: "Advanced", icon: <SiExpress /> },
      { name: "Django", level: "85%", status: "Intermediate", icon: <SiDjango /> },
      { name: "REST API", level: "90%", status: "Advanced", icon: <FaPython /> },
      { name: "JWT Auth", level: "85%", status: "Intermediate", icon: <SiJsonwebtokens /> },
    ],
  },
  {
    category: "Database",
    icon: <FaDatabase />,
    description: "Relational & NoSQL query optimization.",
    skills: [
      { name: "MongoDB", level: "90%", status: "Advanced", icon: <SiMongodb /> },
      { name: "PostgreSQL", level: "85%", status: "Intermediate", icon: <SiPostgresql /> },
      { name: "MySQL", level: "82%", status: "Intermediate", icon: <SiMysql /> },
    ],
  },
  {
    category: "Dev Tools",
    icon: <FaTools />,
    description: "Version control & workflow utilities.",
    skills: [
      { name: "Git", level: "90%", status: "Advanced", icon: <FaGitAlt /> },
      { name: "GitHub", level: "90%", status: "Advanced", icon: <FaGithub /> },
      { name: "Postman", level: "88%", status: "Advanced", icon: <SiPostman /> },
      { name: "VS Code", level: "95%", status: "Advanced", icon: <VscCode /> },
    ],
  },
];

const developerStats = [
  { number: 10, suffix: "+", label: "Projects Built" },
  { number: 6, suffix: "+", label: "Technologies Mastered" },
  { number: 100, suffix: "%", label: "Responsive Design" },
];

function Skill() {
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

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="skills" id="skills" ref={sectionRef}>
      <div className="skills-orb skills-orb-1" aria-hidden="true" />
      <div className="skills-orb skills-orb-2" aria-hidden="true" />

      <div className="skills-container">
        {/* HEADER SECTION */}
        <div className={`skills-header ${isVisible ? "animate-fade-up" : ""}`}>
          <span className="section-title">
            <span className="title-dot" /> My Skill
          </span>
          <h2>Technical Architecture & Stack</h2>
          <p className="skills-desc">
            Continuous real-time stream of core technologies across full stack development, database design, and dev tooling.
          </p>
        </div>

        {/* 4 HORIZONTAL COLUMNS GRID */}
        <div className="skills-grid">
          {skillData.map((category, index) => (
            <div
              className={`skill-card ${isVisible ? "animate-card" : ""}`}
              key={index}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className="card-header">
                <div className="category-icon">{category.icon}</div>
                <div>
                  <h3>{category.category}</h3>
                  <p className="category-desc">{category.description}</p>
                </div>
              </div>

              {/* VERTICAL MARQUEE STREAM */}
              <div className="dns-marquee-viewport">
                <div className="dns-marquee-track">
                  {/* Duplicate list to enable seamless infinite scroll loop */}
                  {[...category.skills, ...category.skills].map((skill, i) => (
                    <div className="dns-stream-item" key={i}>
                      <div className="dns-item-left">
                        <span className="tech-icon">{skill.icon}</span>
                        <span className="skill-name">{skill.name}</span>
                      </div>
                      <div className="dns-item-right">
                        <span className={`level-badge ${skill.status.toLowerCase()}`}>
                          {skill.status}
                        </span>
                        <span className="skill-percentage">{skill.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DEVELOPER STATS BOARD */}
        <div className={`developer-stats ${isVisible ? "animate-fade-up" : ""}`}>
          {developerStats.map((stat, idx) => (
            <div className="stat-card" key={idx}>
              <h2 className="stat-number">
                <Counter target={stat.number} suffix={stat.suffix} isVisible={isVisible} />
              </h2>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skill;