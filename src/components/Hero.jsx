


import React, { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import './Hero.css';

const Hero = () => {
  // Animated Typing Effect Logic
  const roles = [
    'Full Stack Developer',
    'React Developer',
    'Backend Developer'
  ];
  
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetText = roles[currentRoleIndex];
    let typingSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && currentText === targetText) {
      // Pause at the end of word
      typingSpeed = 2000;
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
      typingSpeed = 500;
    }

    const timer = setTimeout(() => {
      setCurrentText((prev) =>
        isDeleting
          ? targetText.substring(0, prev.length - 1)
          : targetText.substring(0, prev.length + 1)
      );

      if (!isDeleting && currentText === targetText) {
        setIsDeleting(true);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentRoleIndex]);

  const techStack = ['React', 'Node.js', 'Django', 'MongoDB', 'JavaScript'];

  return (
    <section className="pf-hero" aria-label="Hero Section">
      {/* Background Decorative Blur Spheres */}
      <div className="pf-hero__blur pf-hero__blur--1" aria-hidden="true" />
      <div className="pf-hero__blur pf-hero__blur--2" aria-hidden="true" />

      <div className="pf-hero__container">
        {/* Left Content */}
        <div className="pf-hero__content">
          <span className="pf-hero__greeting">Hello There 👋</span>

          <h1 className="pf-hero__title">
            Hi, I'm <span className="pf-hero__title-highlight">Tarun</span>
          </h1>

          <div className="pf-hero__role-wrapper" aria-label={`Role: ${currentText}`}>
            <span className="pf-hero__role">{currentText}</span>
            <span className="pf-hero__cursor" aria-hidden="true">|</span>
          </div>

          <p className="pf-hero__desc">
            Passionate software developer specializing in building scalable web applications. 
            Proficient in modern technologies including <strong>React.js</strong>, <strong>Node.js</strong>, 
            <strong> Django</strong>, <strong>MongoDB</strong>, and <strong>REST APIs</strong> to deliver 
            clean code and responsive UI.
          </p>

          {/* Tech Badges */}
          <div className="pf-hero__badges" aria-label="Technologies">
            {techStack.map((tech) => (
              <span key={tech} className="pf-hero__badge">
                {tech}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="pf-hero__buttons">
            <a href="#projects" className="pf-hero__btn pf-hero__btn--primary">
              View Projects
            </a>
          <a
  href="/documents/Tarun_Sahu_Resume.pdf"
  download="Tarun_Sahu_Resume.pdf"
  className="pf-hero__btn pf-hero__btn--outline"
>
  Download Resume
</a>
          </div>

          {/* Social Links */}
          <div className="pf-hero__socials">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="GitHub Profile"
              className="pf-hero__social-link"
            >
              <FaGithub />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="LinkedIn Profile"
              className="pf-hero__social-link"
            >
              <FaLinkedin />
            </a>
            <a 
              href="mailto:example@email.com" 
              aria-label="Send Email"
              className="pf-hero__social-link"
            >
              <FaEnvelope />
            </a>
          </div>
        </div>

        {/* Right Side Flip Card */}
        <div className="pf-hero__image-wrapper">
          <div className="flip-card" tabIndex={0} aria-label="Interactive developer profile card">
            <div className="flip-card-inner">
              
              {/* Front Side */}
              <div className="flip-card-front">
                <img
                  src="/documents/tarun2.png"
                  alt="Tarun - Frontend Developer"
                  loading="eager"
                />
                <h2>Frontend Dev</h2>
              </div>

              {/* Back Side */}
              <div className="flip-card-back">
                <img
                  src="/documents/tarun3.png"
                  alt="Tarun - Backend Developer"
                  loading="lazy"
                />
                <h2>Backend Dev</h2>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;