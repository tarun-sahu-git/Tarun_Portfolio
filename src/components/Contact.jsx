import React, { useState } from "react";
import "./Contact.css";

import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaBriefcase,
  FaSearchLocation,
  FaSearch
} from "react-icons/fa";

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const formData = new FormData(e.target);

    try {
      const response = await fetch(`https://formspree.io/f/mwvgnyoo`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setSubmitted(true);
        e.target.reset();
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact" id="contact">
      {/* Background Atmosphere Orbs */}
      <div className="contact-orb orb-1" aria-hidden="true"></div>
      <div className="contact-orb orb-2" aria-hidden="true"></div>

      <div className="contact-container">
        {/* HEADING SECTION */}
        <div className="contact-heading">
          <span className="contact-badge">GET IN TOUCH</span>
          <h2>Let's Build Something Great Together</h2>
          <p>
            Have a project idea, job opportunity, or just want to say hi? 
            Feel free to reach out through any platform below or drop a direct message!
          </p>
        </div>

        <div className="contact-wrapper">
          {/* LEFT COLUMN - 3D RACK STRUCTURE */}
          <div className="contact-left-rack">
            <div className="rack-card-container">
              
              {/* EMAIL CARD */}
              <a
                href="mailto:tarunsahut754@gmail.com"
                className="rack-card"
                title="Email Me"
              >
                <div className="rack-icon-badge">
                  <FaEnvelope />
                </div>
                <div className="rack-info">
                  <span className="rack-label"></span>
                  <h3>tarunsahut754@gmail.com</h3>
                </div>
              </a>

              {/* PHONE CARD */}
              <a
                href="tel:+919302706772"
                className="rack-card"
                title="Call Phone Number"
              >
                <div className="rack-icon-badge">
                  <FaPhoneAlt />
                </div>
                <div className="rack-info">
                  <span className="rack-label"></span>
                  <h3>+91 9302706772</h3>
                </div>
              </a>

              {/* LOCATION CARD */}
              <a
                href="https://www.google.com/maps/place/Raipur,+Chhattisgarh"
                target="_blank"
                rel="noreferrer"
                className="rack-card"
                title="Open Location in Google Maps"
              >
                <div className="rack-icon-badge">
                  <FaMapMarkerAlt />
                </div>
                <div className="rack-info">
                  <span className="rack-label"></span>
                  <h3>Raipur, Chhattisgarh</h3>
                </div>
              </a>

            </div>

            {/* UNIFIED SOCIAL & PORTAL LINKS */}
            <div className="social-section">
              <h4>Connect & Social Handles</h4>
              <div className="social-links-grid">
                <a
                  href="https://github.com/tarun-sahu-git"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub Profile"
                  className="social-btn"
                  title="GitHub"
                >
                  <FaGithub />
                </a>

                <a
                  href="https://www.linkedin.com/in/tarunsahu"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn Profile"
                  className="social-btn"
                  title="LinkedIn"
                >
                  <FaLinkedin />
                </a>

                <a
                  href="https://www.instagram.com/tarunsahu0274"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram Profile"
                  className="social-btn"
                  title="Instagram"
                >
                  <FaInstagram />
                </a>

                <a
                  href="https://www.glassdoor.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Glassdoor"
                  className="social-btn"
                >
                  <FaSearch />
                </a>

                <a
                  href="https://www.naukri.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Naukri.com"
                  className="social-btn"
                >
                  <FaBriefcase />
                </a>

                <a
                  href="https://www.indeed.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Indeed"
                  className="social-btn"
                >
                  <FaSearchLocation />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - DIRECT FORM */}
          <div className="contact-right">
            <div className="form-header">
              <h3>Send a Direct Message</h3>
              <p>Fill out the form below and I'll get back to you within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Your Name *"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Your Email *"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="Subject *"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <textarea
                  name="message"
                  rows="5"
                  required
                  placeholder="Your Message *"
                  className="form-input textarea"
                ></textarea>
              </div>

              <button
                type="submit"
                className={`submit-btn ${submitted ? "success" : ""} ${error ? "error" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : submitted ? (
                  <>
                    <FaCheckCircle /> Message Sent Successfully!
                  </>
                ) : error ? (
                  <>
                    <FaExclamationCircle /> Failed, Please Try Again
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;