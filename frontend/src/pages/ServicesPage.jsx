import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/services-page.css";

const serviceDefs = [
  {
    id: "web",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    technologies: ["React.js", "Next.js", "Node.js", "PHP", "Supabase", "MySQL"],
  },
  {
    id: "ads",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
    technologies: ["Google Ads", "Meta Ads", "Microsoft Ads", "Analytics", "Tag Manager"],
  },
  {
    id: "android",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    technologies: ["Kotlin", "Android Studio", "MVVM", "Room", "Retrofit", "Coroutines"],
  },
  {
    id: "ops",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    technologies: ["Linux", "Windows Server", "Monitoring Tools", "Automation"],
  },
  {
    id: "hosting",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
    technologies: ["cPanel", "Linux", "Nginx", "Apache", "Docker", "Git"],
  },
  {
    id: "tracking",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
    technologies: ["GA4", "GTM", "Meta Pixel", "Conversion API", "Data Studio"],
  },
];

const stepDefs = [
  { step: "01", titleKey: "s1Title", descKey: "s1Desc" },
  { step: "02", titleKey: "s2Title", descKey: "s2Desc" },
  { step: "03", titleKey: "s3Title", descKey: "s3Desc" },
  { step: "04", titleKey: "s4Title", descKey: "s4Desc" },
];

export default function ServicesPage() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <main className={`services-page ${visible ? "is-visible" : ""}`}>
      <section className="services-page__hero">
        <div className="services-page__hero-inner">
          <span className="services-page__label">{t("servicesPage.label")}</span>
          <h1 className="services-page__title">{t("servicesPage.title")}</h1>
          <p className="services-page__subtitle">
            {t("servicesPage.subtitle")}
          </p>
        </div>
      </section>

      <section className="services-page__services">
        <div className="services-page__services-inner">
          <div className="services-page__grid">
            {serviceDefs.map((service, index) => (
              <article
                key={service.id}
                className="services-page__card"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="services-page__card-icon">{service.icon}</div>
                <h2 className="services-page__card-title">
                  {t(`servicesPage.items.${service.id}.title`)}
                </h2>
                <p className="services-page__card-desc">
                  {t(`servicesPage.items.${service.id}.description`)}
                </p>
                <ul className="services-page__card-features">
                  {["f1", "f2", "f3", "f4"].map((f) => (
                    <li key={f}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t(`servicesPage.items.${service.id}.${f}`)}
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
          <h2>{t("servicesPage.processTitle")}</h2>
          <div className="services-page__process-grid">
            {stepDefs.map((item, index) => (
              <div
                key={item.step}
                className="services-page__process-item"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <span className="services-page__process-step">{item.step}</span>
                <h3>{t(`servicesPage.steps.${item.titleKey}`)}</h3>
                <p>{t(`servicesPage.steps.${item.descKey}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="services-page__cta">
        <div className="services-page__cta-inner">
          <h2>{t("servicesPage.ctaTitle")}</h2>
          <p>{t("servicesPage.ctaText")}</p>
          <div className="services-page__cta-buttons">
            <Link to="/contact" className="services-page__cta-btn services-page__cta-btn--primary">
              {t("servicesPage.getInTouch")}
            </Link>
            <Link to="/projects" className="services-page__cta-btn services-page__cta-btn--secondary">
              {t("servicesPage.viewWork")}
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
