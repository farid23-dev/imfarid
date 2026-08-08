import { useEffect, useRef, useState } from "react";
import { fetchExperiences } from "../api";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/resume.css";

const fallbackExperiences = [
  {
    id: 1,
    company: "Meridian Media",
    position: "Lead IT Specialist",
    location: "Remote",
    start_date: "August 2026",
    end_date: "Present",
    description: ["Developed and deployed web applications"],
  },
];

const INITIAL_COUNT = 2;

export default function Resume() {
  const { t, localize } = useLanguage();
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function loadExperiences() {
      const data = await fetchExperiences();
      setExperiences(data || fallbackExperiences);
      setLoading(false);
    }
    loadExperiences();
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

  const displayedExperiences = showAll
    ? experiences
    : experiences.slice(0, INITIAL_COUNT);

  const hasMore = experiences.length > INITIAL_COUNT;

  return (
    <section ref={sectionRef} className={`resume ${visible ? "is-visible" : ""}`}>
      <div className="resume__inner">
        <div className="resume__header">
          <span className="resume__label">{t("resume.label")}</span>
          <h2 className="resume__title">{t("resume.title")}</h2>
        </div>

        {loading ? (
          <div className="resume__loading">{t("resume.loading")}</div>
        ) : (
          <>
            <div className="resume__timeline">
              {displayedExperiences.map((exp, index) => {
                const bullets = localize(exp, "description");
                return (
                  <div
                    key={exp.id}
                    className="resume__item"
                    style={{ animationDelay: `${0.1 + index * 0.08}s` }}
                  >
                    <div className="resume__dot" />
                    <div className="resume__content">
                      <div className="resume__top">
                        <div>
                          <h3 className="resume__company">{localize(exp, "company") || exp.company}</h3>
                          <p className="resume__position">{localize(exp, "position") || exp.position}</p>
                        </div>
                        <div className="resume__meta">
                          <span className="resume__date">
                            {exp.start_date} — {exp.end_date}
                          </span>
                          <span className="resume__location">{localize(exp, "location") || exp.location}</span>
                        </div>
                      </div>
                      <ul className="resume__list">
                        {(Array.isArray(bullets) ? bullets : []).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="resume__more">
                <button
                  className="resume__more-btn"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll
                    ? t("resume.showLess")
                    : t("resume.loadMore", { count: experiences.length - INITIAL_COUNT })}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: showAll ? "rotate(180deg)" : "none" }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
