
import React, { useEffect, useRef, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBriefcase,
  FaDownload,
  FaCode,
  FaGraduationCap,
  FaCheckCircle,

} from "react-icons/fa";
import "./About.css";


// Helper Component for Animated Counter
const Counter = ({ target, suffix = "", isVisible }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const end = parseInt(target, 10);
    if (isNaN(end)) return;

    let start = 0;
    const duration = 1800; // 1.8 seconds
    const totalSteps = 40;
    const stepTime = duration / totalSteps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / totalSteps;
      const currentCount = Math.floor(end * progress);

      if (currentStep >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(currentCount);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isVisible, target]);

  return <span>{count}{suffix}</span>;
};

function About() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Trigger animations when scrolled into viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
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

  const skills = [
    { name: "React.js", value: 95 },
    { name: "Node.js", value: 90 },
    { name: "MongoDB", value: 88 },
    { name: "Django", value: 85 },
    { name: "JavaScript", value: 92 },
    { name: "PostgreSQL", value: 80 },
  ];

  const infoList = [
    { icon: <FaUser />, title: "Name", value: "Tarun" },
    { icon: <FaEnvelope />, title: "Email", value: "tarunsahut754@email.com" },
    { icon: <FaMapMarkerAlt />, title: "Location", value: "Raipur chhattishgadhh" },
    { icon: <FaBriefcase />, title: "Experience", value: "Full Stack Intern" },
  ];

  const statsList = [
    { number: 5, suffix: "+", label: "Projects Completed" },
    { number: 100, suffix: "%", label: "Responsive Design" },
    { number: 6, suffix: "+", label: "Technologies Mastered" },
  ];

  return (
    <section className="about" id="about" ref={sectionRef}>
      {/* Background Decorative Blur Spheres */}
      <div className="about-glow about-glow-1" aria-hidden="true" />
      <div className="about-glow about-glow-2" aria-hidden="true" />

      {/* 1. TOP CENTER HEADER */}
      <div className="about-header-top">
        <span className="section-tag">
          <span className="tag-dot"></span> About Me
        </span>
        <h2 className="about-heading">
          Passionate <span className="highlight">Full Stack</span> Developer
        </h2>
      </div>

      <div className="about-container">

        {/* 2. LEFT SIDE: Image + Description + Download Resume */}
        <div className="about-left">

          {/* Profile Image with Rotating Border */}
          <div className="about-image-wrapper">
            <div className="about-image-border"></div>
            <div className="about-image">
              <img
                src="/documents/Tarun.png"
                alt="Tarun - Full Stack Developer Profile"
              />
            </div>

            {/* Floating Glass Badges */}
            <div className="floating-card card-top-left">
              <div className="card-icon">
                <FaCode />
              </div>
              <div>
                <h4>Full Stack</h4>
                <p>Developer</p>
              </div>
            </div>

            <div className="floating-card card-bottom-right">
              <div className="card-icon primary">
                <FaCheckCircle />
              </div>
              <div>
                <h2>
                  <Counter target={20} suffix="+" isVisible={isVisible} />
                </h2>
                <p>Projects Done</p>
              </div>
            </div>
          </div>

          {/* Description Below Image */}
          <p className="about-text">
            I am <strong>Tarun</strong>, a Full Stack Developer specializing in
            React.js, Node.js, Django, MongoDB, and PostgreSQL. I enjoy building
            responsive, scalable, and modern web applications with clean code and
            attractive user interfaces. I focus on performance, accessibility, and
            user experience.
          </p>

          {/* Download Resume Button Below Text */}
          <a href="#contact" className="about-btn">
            <span>Hire Me</span>
            <FaEnvelope className="btn-icon" />
          </a>

        </div>

        {/* 3. RIGHT SIDE: Personal Info + Technologies + Counter Stats */}
        <div className="about-right">

          {/* Personal Info Grid */}
          <h3 className="section-sub-title">Personal Info</h3>
          <div className="about-info">
            {infoList.map((item, index) => (
              <div key={index} className="info-box">
                <div className="info-icon">{item.icon}</div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Technologies / Skills Section */}
          <div className="about-skills">
            <h3 className="section-sub-title">Technologies & Skills</h3>
            <div className="skills-grid">
              {skills.map((skill, index) => (
                <div key={index} className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-percentage">{skill.value}%</span>
                  </div>
                  <div className="skill-bar-bg">
                    <div
                      className="skill-bar-fill"
                      style={{
                        width: isVisible ? `${skill.value}%` : "0%",
                        transitionDelay: `${index * 0.1}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Animated Statistics Cards */}
          <h3 className="section-sub-title">Key Statistics</h3>
          <div className="stats">
            {statsList.map((stat, index) => (
              <div key={index} className="stat-box">
                <h2>
                  <Counter target={stat.number} suffix={stat.suffix} isVisible={isVisible} />
                </h2>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

export default About;