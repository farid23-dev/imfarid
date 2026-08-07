import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import "../styles/about-page.css";

const stats = [
  { value: "5+", label: "Years Experience" },
  { value: "50+", label: "Projects Delivered" },
  { value: "10+", label: "Companies Worked" },
];

const timeline = [
  {
    year: "2026",
    title: "Co-Founder & CTO at Kodely",
    description: "Leading technical operations and web development",
  },
  {
    year: "2025",
    title: "IT Operations Manager",
    description: "Managing technical infrastructure and development teams",
  },
  {
    year: "2021",
    title: "IT Specialist & Mediabuyer",
    description: "Web development and performance marketing campaigns",
  },
  {
    year: "2020",
    title: "Full Stack Developer",
    description: "Started professional development career",
  },
];

const skills = {
  "Frontend Development": ["React.js", "Next.js", "HTML5", "CSS3", "JavaScript", "TypeScript", "Tailwind CSS"],
  "Backend Development": ["Node.js", "Express.js", "PHP", "REST APIs", "Supabase", "MySQL", "PostgreSQL"],
  "Mobile Development": ["Kotlin", "Android", "MVVM", "Room", "Retrofit", "Coroutines"],
  "Marketing & Ads": ["Google Ads", "Meta Ads", "Microsoft Ads", "ASO", "Analytics", "Tracking"],
  "DevOps & Tools": ["Git", "Linux", "Docker", "Hosting", "DNS Management", "cPanel"],
};

export default function AboutPage() {
  const [visible, setVisible] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <main ref={pageRef} className={`about-page ${visible ? "is-visible" : ""}`}>
      <section className="about-page__hero">
        <div className="about-page__hero-inner">
          <span className="about-page__label">About Me</span>
          <h1 className="about-page__title">Farid Ismayilov</h1>
          <p className="about-page__role">
            IT Specialist & Full-Stack Web Developer
          </p>
          <p className="about-page__location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Baku, Azerbaijan
          </p>
        </div>
      </section>

      <section className="about-page__bio">
        <div className="about-page__bio-inner">
          <div className="about-page__bio-content">
            <h2>My Story</h2>
            <p>
              I'm an IT Specialist and Full-Stack Web Developer with hands-on expertise 
              in building and deploying web applications using PHP, Next.js, React, and Node.js. 
              With over 5 years of experience in the tech industry, I've worked with startups 
              and established companies alike.
            </p>
            <p>
              Currently serving as <strong>Co-Founder & CTO at Kodely</strong> and 
              <strong> Lead IT Specialist at multiple companies</strong>, I specialize in 
              managing hosting environments, domains and DNS, implementing RESTful APIs, 
              and integrating tracking systems.
            </p>
            <p>
              Beyond web development, I have extensive experience in <strong>performance marketing</strong> with 
              Google Ads, Meta Ads, and Microsoft Ads. I'm also passionate about 
              <strong> Android development</strong> with Kotlin, building apps using modern architecture 
              patterns like MVVM with Room, Retrofit, and Coroutines.
            </p>
            <p>
              I hold a <strong>Master's degree in Computer Engineering</strong> from Azerbaijan 
              Technical University and I'm fluent in Azerbaijani, English, Turkish, and Russian.
            </p>
          </div>
          <div className="about-page__bio-stats">
            {stats.map((stat, index) => (
              <div key={stat.label} className="about-page__stat" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                <span className="about-page__stat-value">{stat.value}</span>
                <span className="about-page__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-page__timeline">
        <div className="about-page__timeline-inner">
          <h2>Career Journey</h2>
          <div className="about-page__timeline-list">
            {timeline.map((item, index) => (
              <div key={index} className="about-page__timeline-item" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                <span className="about-page__timeline-year">{item.year}</span>
                <div className="about-page__timeline-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/#resume" className="about-page__timeline-link">
            View Full Experience
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="about-page__skills">
        <div className="about-page__skills-inner">
          <h2>Skills & Technologies</h2>
          <div className="about-page__skills-grid">
            {Object.entries(skills).map(([category, items], catIndex) => (
              <div key={category} className="about-page__skill-category" style={{ animationDelay: `${0.1 + catIndex * 0.1}s` }}>
                <h3>{category}</h3>
                <div className="about-page__skill-tags">
                  {items.map((skill) => (
                    <span key={skill} className="about-page__skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-page__cta">
        <div className="about-page__cta-inner">
          <h2>Let's Work Together</h2>
          <p>
            Have a project in mind or want to collaborate? I'm always open to discussing 
            new opportunities and interesting projects.
          </p>
          <div className="about-page__cta-buttons">
            <Link to="/contact" className="about-page__cta-btn about-page__cta-btn--primary">
              Get in Touch
            </Link>
            <a href="/Farid-Ismayilov-resume.pdf" download className="about-page__cta-btn about-page__cta-btn--secondary">
              Download Resume
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
