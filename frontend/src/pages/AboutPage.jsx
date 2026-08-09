import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/about-page.css";

const skillGroups = [
  { key: "frontend", items: ["React.js", "Next.js", "HTML5", "CSS3", "JavaScript", "TypeScript", "Tailwind CSS"] },
  { key: "backend", items: ["Node.js", "Express.js", "PHP", "REST APIs", "Supabase", "MySQL", "PostgreSQL"] },
  { key: "mobile", items: ["Kotlin", "Android", "MVVM", "Room", "Retrofit", "Coroutines"] },
  { key: "marketing", items: ["Google Ads", "Meta Ads", "Microsoft Ads", "ASO", "Analytics", "Tracking"] },
  { key: "devops", items: ["Git", "Linux", "Docker", "Hosting", "DNS Management", "cPanel"] },
];

export default function AboutPage() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const pageRef = useRef(null);

  const stats = [
    { value: "5+", label: t("aboutPage.statExperience") },
    { value: "10+", label: t("aboutPage.statCompanies") },
    { value: "3", label: t("aboutPage.statFocus") },
  ];

  const timeline = [
    { year: "01", title: t("aboutPage.career1Title"), description: t("aboutPage.career1Desc") },
    { year: "02", title: t("aboutPage.career2Title"), description: t("aboutPage.career2Desc") },
    { year: "03", title: t("aboutPage.career3Title"), description: t("aboutPage.career3Desc") },
    { year: "04", title: t("aboutPage.career4Title"), description: t("aboutPage.career4Desc") },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <main ref={pageRef} className={`about-page ${visible ? "is-visible" : ""}`}>
      <section className="about-page__hero">
        <div className="about-page__hero-inner">
          <span className="about-page__label">{t("aboutPage.label")}</span>
          <h1 className="about-page__title">Farid Ismayilov</h1>
          <p className="about-page__role">
            {t("aboutPage.role")}
          </p>
          <p className="about-page__location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {t("aboutPage.location")}
          </p>
        </div>
      </section>

      <section className="about-page__bio">
        <div className="about-page__bio-inner">
          <div className="about-page__bio-content">
            <h2>{t("aboutPage.storyTitle")}</h2>
            <p>{t("aboutPage.story1")}</p>
            <p>{t("aboutPage.story2")}</p>
            <p>{t("aboutPage.story3")}</p>
            <p>{t("aboutPage.story4")}</p>
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
          <h2>{t("aboutPage.careerTitle")}</h2>
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
            {t("aboutPage.viewExperience")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="about-page__skills">
        <div className="about-page__skills-inner">
          <h2>{t("aboutPage.skillsTitle")}</h2>
          <div className="about-page__skills-grid">
            {skillGroups.map((group, catIndex) => (
              <div key={group.key} className="about-page__skill-category" style={{ animationDelay: `${0.1 + catIndex * 0.1}s` }}>
                <h3>{t(`skills.categories.${group.key}`)}</h3>
                <div className="about-page__skill-tags">
                  {group.items.map((skill) => (
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
          <h2>{t("aboutPage.ctaTitle")}</h2>
          <p>{t("aboutPage.ctaText")}</p>
          <div className="about-page__cta-buttons">
            <Link to="/contact" className="about-page__cta-btn about-page__cta-btn--primary">
              {t("aboutPage.getInTouch")}
            </Link>
            <a
              href="/Farid-Ismayilov-resume.pdf?v=2"
              download="Farid-Ismayilov-resume.pdf"
              type="application/pdf"
              className="about-page__cta-btn about-page__cta-btn--secondary"
            >
              {t("aboutPage.downloadResume")}
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
