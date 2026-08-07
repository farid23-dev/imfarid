import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjects } from "../api";
import Footer from "../components/Footer";
import "../styles/projects-page.css";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    async function loadProjects() {
      const data = await fetchProjects();
      setProjects(data || []);
      setLoading(false);
    }
    loadProjects();
  }, []);

  const technologies = [
    "all",
    ...new Set(projects.flatMap((p) => p.technologies || [])),
  ];

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.technologies?.includes(filter));

  return (
    <main className={`projects-page ${visible ? "is-visible" : ""}`}>
      <section className="projects-page__hero">
        <div className="projects-page__hero-inner">
          <span className="projects-page__label">Portfolio</span>
          <h1 className="projects-page__title">My Projects</h1>
          <p className="projects-page__subtitle">
            A collection of projects I've worked on, from web applications to marketing campaigns.
          </p>
        </div>
      </section>

      <section className="projects-page__content">
        <div className="projects-page__content-inner">
          {technologies.length > 1 && (
            <div className="projects-page__filters">
              {technologies.slice(0, 8).map((tech) => (
                <button
                  key={tech}
                  className={`projects-page__filter ${filter === tech ? "is-active" : ""}`}
                  onClick={() => setFilter(tech)}
                >
                  {tech === "all" ? "All Projects" : tech}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="projects-page__loading">
              <div className="projects-page__loading-spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="projects-page__empty">
              <div className="projects-page__empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <h2>Coming Soon</h2>
              <p>I'm currently working on some exciting projects. Check back soon!</p>
              <Link to="/" className="projects-page__back-btn">
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="projects-page__grid">
              {filteredProjects.map((project, index) => (
                <article
                  key={project.id}
                  className="projects-page__card"
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                >
                  <div className="projects-page__card-image">
                    {project.cover_image || project.image ? (
                      <img src={project.cover_image || project.image} alt={project.title} />
                    ) : (
                      <div className="projects-page__card-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                      </div>
                    )}
                    <div className="projects-page__card-overlay">
                      <div className="projects-page__card-links">
                        {project.live_url && (
                          <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="projects-page__card-link"
                            aria-label="View live site"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                            </svg>
                          </a>
                        )}
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="projects-page__card-link"
                            aria-label="View on GitHub"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="projects-page__card-content">
                    <h3 className="projects-page__card-title">{project.title}</h3>
                    {project.description && (
                      <p className="projects-page__card-desc">{project.description}</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="projects-page__card-tech">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <span key={tech} className="projects-page__card-tag">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
