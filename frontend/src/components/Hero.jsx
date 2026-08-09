import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/hero.css";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <div className="hero__bg">
        <img
          src="/hero-bg.png"
          alt=""
          className="hero__bg-image"
        />
        <div className="hero__overlay" />
        <div className="hero__grid" />
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
        <div className="hero__glow" />
      </div>

      <div className="hero__inner">
        <p className="hero__eyebrow">
          {t("hero.eyebrow")}
        </p>

        <h1 className="hero__name">
          Farid
        </h1>

        <p className="hero__tagline">
          {t("hero.tagline")}
        </p>

        <div className="hero__cta">
          <Link to="/projects" className="btn btn--primary">
            {t("hero.viewProjects")}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="/Farid-Ismayilov-resume.pdf?v=2"
            download="Farid-Ismayilov-resume.pdf"
            type="application/pdf"
            className="btn btn--outline"
          >
            {t("hero.downloadResume")}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </a>
        </div>
      </div>

      <div className="hero__scroll">
        <span>{t("hero.scroll")}</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
