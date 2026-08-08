import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFeaturedProjects } from "../api";
import { useLanguage } from "../i18n/LanguageContext";
import LikeButton from "./LikeButton";
import "../styles/projects.css";

const DISPLAY_COUNT = 3;

export default function Projects() {
  const { t, localize } = useLanguage();
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      const data = await fetchFeaturedProjects();
      setProjects(data || []);
      setLoading(false);
    }
    loadProjects();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const displayedProjects = projects.slice(0, DISPLAY_COUNT);

  return (
    <section ref={sectionRef} className={`projects ${visible ? "is-visible" : ""}`}>
      <div className="projects__inner">
        <div className="projects__header">
          <span className="projects__label">{t("projects.label")}</span>
          <h2 className="projects__title">{t("projects.title")}</h2>
        </div>

        {loading ? (
          <div className="projects__loading">{t("projects.loading")}</div>
        ) : projects.length === 0 ? (
          <div className="projects__empty">
            <div className="projects__empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <h3 className="projects__empty-title">{t("projects.comingSoon")}</h3>
            <p className="projects__empty-text">
              {t("projects.empty")}
            </p>
          </div>
        ) : (
          <>
            <div className="projects__grid">
              {displayedProjects.map((project, index) => {
                const title = localize(project, "title");
                return (
                  <div
                    key={project.id}
                    className="projects__card"
                    style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                  >
                    <div className="projects__image">
                      <img src={project.image} alt={title} />
                    </div>
                    <div className="projects__info">
                      <h3 className="projects__name">{title}</h3>
                      <div className="projects__meta">
                        <LikeButton type="projects" id={project.id} initialCount={project.like_count || 0} size="compact" />
                        {project.live_url && (
                          <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="projects__link"
                          >
                            {t("projects.visitSite")}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="projects__more">
              <Link to="/projects" className="projects__more-btn">
                {t("projects.seeMore")}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
