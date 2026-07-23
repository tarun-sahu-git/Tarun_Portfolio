// import React from "react";
// import "./Education.css";
// import {
//   FaGraduationCap,
//   FaUniversity,
//   FaSchool,
//   FaEye,
//   FaDownload,
// } from "react-icons/fa";

// function Education() {
//   const educationData = [
//     {
//       id: 1,
//       icon: <FaGraduationCap />,
//       degree: "Master of Science (M.Sc.) - Information Technology",
//       institute: "Pt. Ravishankar Univercity Raipur (C.G)",
//       year: "2024 - 2026",
// description:
//   "Covered core computer science subjects such as C++, HTML, Data Structures & Algorithms (DSA), Operating Systems, DBMS, Computer Architecture, .NET, Java, Python, Artificial Intelligence (AI), Big Data, and Software Engineering. Completed a 6-month internship along with academic projects and hands-on practical training.",
//       file: "/documents/Finalyearmsc.pdf",
//     },

//     {
//       id: 2,
//       icon: <FaUniversity />,
//       degree: "Bachelor of Science (B.Sc.)",
//       institute: "Government Nagarjuna Science College",
//       year: "2021 - 2024",
//       description:
//         "Completed graduation with Mathematics, Physics and Chemistry. Developed strong analytical thinking and problem-solving abilities.",
//       file: "/documents/FinalYearbsc.pdf",
//     },

//     {
//       id: 3,
//       icon: <FaSchool />,
//       degree: "Higher Secondary (12th)",
//       institute: "C.G. Board",
//       year: "2020 - 2021",
//       description:
//         "Completed Higher Secondary with Science stream and built a strong foundation in Mathematics and Computer fundamentals.",
//       file: "/documents/12th.pdf",
//     },
//   ];

//   return (
//     <section className="education" id="education">
//       <div className="education-container">

//         {/* Heading */}

//         <div className="education-heading">

//           <span>🎓 EDUCATION</span>

//           <h2>My Academic Journey</h2>

//           <p>
//             My educational journey has provided me with a strong
//             technical foundation, analytical thinking and
//             problem-solving skills that support my career as a
//             Full Stack Developer.
//           </p>

//         </div>

//         {/* Timeline */}

//         <div className="timeline">

//           {educationData.map((item) => (

//             <div className="timeline-item" key={item.id}>

//               <div className="timeline-icon">
//                 {item.icon}
//               </div>

//               <div className="timeline-content">

//                 <span className="year">
//                   {item.year}
//                 </span>

//                 <h3>{item.degree}</h3>

//                 <h4>{item.institute}</h4>

//                 <p>{item.description}</p>

//                 {/* Buttons */}

//                 <div className="edu-buttons">

//                   <a
//                     href={item.file}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="view-btn"
//                   >
//                     <FaEye />
//                     View Marksheet
//                   </a>

//                   <a
//                     href={item.file}
//                     download
//                     className="download-btn"
//                   >
//                     <FaDownload />
//                     Download
//                   </a>

//                 </div>

//               </div>

//             </div>

//           ))}

//         </div>

//       </div>
//     </section>
//   );
// }

// export default Education;

import React, { useEffect, useRef, useState } from "react";
import "./Education.css";
import {
  FaGraduationCap,
  FaUniversity,
  FaSchool,
  FaEye,
  FaDownload,
  FaCheckCircle,
  FaAward,
  FaLaptopCode,
} from "react-icons/fa";

function Education() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Trigger scroll viewport animation
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

  const educationData = [
    {
      id: 1,
      icon: <FaSchool />,
      step: "01",
      degree: "Higher Secondary (12th)",
      institute: "C.G. Board",
      year: "2020 - 2021",
      status: "Completed",
      description:
        "Completed Higher Secondary with Science stream building a strong foundation in Mathematics, Science & Computer fundamentals.",
      achievement: "Secured high academic standing in Science Stream.",
      skills: ["Science Stream", "Mathematics", "Computers"],
      file: "/documents/12th.pdf",
    },
    {
      id: 2,
      icon: <FaUniversity />,
      step: "02",
      degree: "Bachelor of Science (B.Sc.)",
      institute: "Government Nagarjuna Science College",
      year: "2021 - 2024",
      status: "Completed",
      description:
        "Graduated with Mathematics, Physics, and Chemistry. Developed strong analytical thinking and problem-solving abilities.",
      achievement: "Honors in Core Science & Analytical Mathematics.",
      skills: ["Mathematics", "Physics", "Chemistry"],
      file: "/documents/FinalYearbsc.pdf",
    },
    {
      id: 3,
      icon: <FaGraduationCap />,
      step: "03",
      degree: "Master of Science (M.Sc. IT)",
      institute: "Pt. Ravishankar University Raipur (C.G)",
      year: "2024 - 2026",
      status: "Completed",
      description:
        "Mastered C++, Data Structures, DBMS, Web Tech, Python, AI & Big Data with hands-on research and practical training.",
      achievement: "Completed 6-month industry internship & degree.",
      skills: ["React.js", "JavaScript", "Python", "AI", "DBMS", "DSA"],
      file: "/documents/Finalyearmsc.pdf",
    },
  ];

  return (
    <section className="education" id="education" ref={sectionRef}>
      {/* Background Glows */}
      <div className="edu-glow edu-glow-1" aria-hidden="true" />
      <div className="edu-glow edu-glow-2" aria-hidden="true" />

      <div className="education-container">
        
        {/* HEADING SECTION */}
        <div className={`education-heading ${isVisible ? "animate-fade-in" : ""}`}>
          <span className="education-badge">
            <span className="badge-dot" />  My Education
          </span>
          <h2>My Academic Journey</h2>
          <p>
            A step-by-step horizontal journey highlighting my academic qualifications 
            and technical domain specialization.
          </p>
        </div>

        {/* HORIZONTAL ROADMAP CONTAINER */}
        <div className="roadmap-wrapper">
          
          {/* SVG Curved Connecting Path Line */}
          <svg
            className="roadmap-curve-path"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <path
              d="M 50 50 Q 250 10, 500 50 T 950 50"
              fill="none"
              stroke="url(#roadGradient)"
              strokeWidth="4"
              strokeDasharray="8 6"
            />
            <defs>
              <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff6a00" />
                <stop offset="50%" stopColor="#ff9800" />
                <stop offset="100%" stopColor="#ff6a00" />
              </linearGradient>
            </defs>
          </svg>

          <div className="roadmap-grid">
            {educationData.map((item, index) => (
              <div
                className={`roadmap-card-item ${
                  index % 2 === 1 ? "curve-down" : "curve-up"
                } ${isVisible ? "animate-card" : ""}`}
                key={item.id}
                style={{ animationDelay: `${index * 0.25}s` }}
              >
                {/* Node Milestone Circle */}
                <div className="roadmap-node">
                  <div className="node-pulse" />
                  <div className="node-icon">{item.icon}</div>
                  <span className="step-number">{item.step}</span>
                </div>

                {/* Compact Card Content */}
                <div className="roadmap-card">
                  
                  {/* Top Bar Badges */}
                  <div className="card-top-bar">
                    <span className="year-badge">{item.year}</span>
                    <span className="status-badge status-completed">
                      <FaCheckCircle /> {item.status}
                    </span>
                  </div>

                  <h3 className="card-degree">{item.degree}</h3>
                  <h4 className="card-institute">{item.institute}</h4>

                  <p className="card-desc">{item.description}</p>

                  {/* Achievement */}
                  {item.achievement && (
                    <div className="achievement-box">
                      <FaAward className="achievement-icon" />
                      <span>{item.achievement}</span>
                    </div>
                  )}

                  {/* Skills Pill List */}
                  {item.skills && (
                    <div className="skills-tags">
                      {item.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="skill-pill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* PDF Buttons */}
                  <div className="edu-buttons">
                    <a
                      href={item.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-btn"
                      title="View Marksheet"
                    >
                      <FaEye /> View Marksheet
                    </a>

                    <a
                      href={item.file}
                      download
                      className="download-btn"
                      title="Download PDF"
                    >
                      <FaDownload /> PDF
                    </a>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

export default Education;