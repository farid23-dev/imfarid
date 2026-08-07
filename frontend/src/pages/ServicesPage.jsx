import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import "../styles/services-page.css";

const services = [
  {
    id: "web-development",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Web Development",
    description: "Full-stack web applications built with modern technologies and best practices.",
    features: [
      "React.js & Next.js Applications",
      "PHP & Node.js Backend Development",
      "RESTful API Design & Integration",
      "Database Design (MySQL, PostgreSQL, Supabase)",
      "Responsive & Mobile-First Design",
      "Performance Optimization",
    ],
    technologies: ["React.js", "Next.js", "Node.js", "PHP", "Supabase", "MySQL"],
  },
  {
    id: "google-ads",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
    title: "Google Ads & Performance Marketing",
    description: "Data-driven advertising campaigns that maximize ROI and drive quality leads.",
    features: [
      "Google Ads Campaign Management",
      "Meta & Microsoft Ads Campaigns",
      "Conversion Tracking & Analytics Setup",
      "Audience Targeting & Optimization",
      "A/B Testing & Performance Analysis",
      "Budget Management & ROI Optimization",
    ],
    technologies: ["Google Ads", "Meta Ads", "Microsoft Ads", "Analytics", "Tag Manager"],
  },
  {
    id: "android-development",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    title: "Android Development",
    description: "Native Android applications built with Kotlin using modern architecture patterns.",
    features: [
      "Native Kotlin Development",
      "MVVM Architecture Pattern",
      "Room Database Integration",
      "Retrofit API Integration",
      "Coroutines for Async Operations",
      "Material Design UI/UX",
    ],
    technologies: ["Kotlin", "Android Studio", "MVVM", "Room", "Retrofit", "Coroutines"],
  },
  {
    id: "it-operations",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "IT Operations & Support",
    description: "Comprehensive IT support and operations management for businesses.",
    features: [
      "Production Environment Monitoring",
      "Technical Issue Resolution",
      "System Administration",
      "Team Technical Support",
      "Process Automation",
      "Documentation & Training",
    ],
    technologies: ["Linux", "Windows Server", "Monitoring Tools", "Automation"],
  },
  {
    id: "hosting-management",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
    title: "Hosting & Server Management",
    description: "Server configuration, deployment, and maintenance for optimal performance.",
    features: [
      "Server Configuration & Setup",
      "Domain & DNS Management",
      "SSL Certificate Installation",
      "cPanel & Hosting Management",
      "Website Deployment & Migration",
      "Backup & Security Management",
    ],
    technologies: ["cPanel", "Linux", "Nginx", "Apache", "Docker", "Git"],
  },
  {
    id: "tracking-analytics",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
    title: "Tracking & Analytics",
    description: "Implement tracking solutions to measure and optimize performance.",
    features: [
      "Google Analytics 4 Setup",
      "Conversion Tracking Implementation",
      "Pixel Installation (Meta, TikTok, etc.)",
      "Google Tag Manager Configuration",
      "Custom Event Tracking",
      "Data Flow & Attribution Analysis",
    ],
    technologies: ["GA4", "GTM", "Meta Pixel", "Conversion API", "Data Studio"],
  },
];

const process = [
  {
    step: "01",
    title: "Discovery",
    description: "Understanding your goals, requirements, and challenges through detailed discussion.",
  },
  {
    step: "02",
    title: "Planning",
    description: "Creating a comprehensive roadmap with timelines, milestones, and deliverables.",
  },
  {
    step: "03",
    title: "Development",
    description: "Building your solution with regular updates and feedback loops.",
  },
  {
    step: "04",
    title: "Delivery",
    description: "Launching your project with thorough testing and ongoing support.",
  },
];

export default function ServicesPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <main className={`services-page ${visible ? "is-visible" : ""}`}>
      <section className="services-page__hero">
        <div className="services-page__hero-inner">
          <span className="services-page__label">What I Do</span>
          <h1 className="services-page__title">Services</h1>
          <p className="services-page__subtitle">
            From web development to performance marketing, I offer comprehensive 
            solutions to help your business grow and succeed in the digital world.
          </p>
        </div>
      </section>

      <section className="services-page__services">
        <div className="services-page__services-inner">
          <div className="services-page__grid">
            {services.map((service, index) => (
              <article
                key={service.id}
                className="services-page__card"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="services-page__card-icon">{service.icon}</div>
                <h2 className="services-page__card-title">{service.title}</h2>
                <p className="services-page__card-desc">{service.description}</p>
                <ul className="services-page__card-features">
                  {service.features.map((feature) => (
                    <li key={feature}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="services-page__card-tech">
                  {service.technologies.map((tech) => (
                    <span key={tech} className="services-page__card-tag">{tech}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="services-page__process">
        <div className="services-page__process-inner">
          <h2>How I Work</h2>
          <p className="services-page__process-intro">
            A streamlined process to ensure your project is delivered on time and exceeds expectations.
          </p>
          <div className="services-page__process-grid">
            {process.map((item, index) => (
              <div
                key={item.step}
                className="services-page__process-item"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <span className="services-page__process-step">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="services-page__cta">
        <div className="services-page__cta-inner">
          <h2>Ready to Start Your Project?</h2>
          <p>
            Let's discuss how I can help you achieve your goals. 
            Get in touch for a free consultation.
          </p>
          <div className="services-page__cta-buttons">
            <Link to="/contact" className="services-page__cta-btn services-page__cta-btn--primary">
              Get in Touch
            </Link>
            <Link to="/projects" className="services-page__cta-btn services-page__cta-btn--secondary">
              View My Work
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
