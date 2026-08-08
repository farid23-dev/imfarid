import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/skills.css";

const skillCategories = [
  {
    key: "programming",
    skills: ["PHP", "JavaScript", "React.js", "Next.js", "Node.js", "Kotlin", "C#", "Dart", "Flutter"],
  },
  {
    key: "principles",
    skills: ["Clean Code", "SOLID Principles", "OOP", "Version Control (Git)", "REST API Integration"],
  },
  {
    key: "web",
    skills: ["HTML5", "CSS3", "Responsive Design", "SQL", "Supabase", "REST APIs"],
  },
  {
    key: "hosting",
    skills: ["Web Hosting", "Domain & DNS", "Production Deployment", "Server Monitoring", "CI/CD", "GitHub Actions", "GitLab CI/CD", "Vercel", "Netlify"],
  },
  {
    key: "mobile",
    skills: ["Android (Kotlin)", "MVVM", "Room Database", "Retrofit", "Coroutines", "Hilt/Dagger", "Flow/StateFlow", "Firebase", "Material Design", "LiveData", "Data Binding", "Google Play Console"],
  },
  {
    key: "digitalMarketing",
    skills: ["Google Ads (UAC)", "Meta Ads", "Microsoft Ads", "App Store Optimization", "In-App Advertising", "Conversion Tracking", "Performance Monitoring", "CPA/ROI/LTV"],
  },
  {
    key: "ai",
    skills: ["ChatGPT", "Claude", "Gemini", "Perplexity", "Cursor", "Grok"],
  },
  {
    key: "platforms",
    skills: ["Git", "GitHub", "Microsoft Office", "Google Workspace", "Figma", "Jira", "Trello", "Notion", "Monday", "Slack", "Microsoft Teams", "Google Cloud", "Android Studio", "Gradle"],
  },
];

const INITIAL_COUNT = 3;

export default function Skills() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const displayedCategories = showAll
    ? skillCategories
    : skillCategories.slice(0, INITIAL_COUNT);

  const hasMore = skillCategories.length > INITIAL_COUNT;

  return (
    <section ref={sectionRef} className={`skills ${visible ? "is-visible" : ""}`}>
      <div className="skills__inner">
        <div className="skills__header">
          <span className="skills__label">{t("skills.label")}</span>
          <h2 className="skills__title">{t("skills.title")}</h2>
        </div>

        <div className="skills__grid">
          {displayedCategories.map((category, catIndex) => (
            <div
              key={category.key}
              className="skills__category"
              style={{ animationDelay: `${0.1 + catIndex * 0.1}s` }}
            >
              <h3 className="skills__category-title">
                {t(`skills.categories.${category.key}`)}
              </h3>
              <div className="skills__list">
                {category.skills.map((skill, skillIndex) => (
                  <span
                    key={skill}
                    className="skills__item"
                    style={{ animationDelay: `${0.2 + catIndex * 0.1 + skillIndex * 0.03}s` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="skills__more">
            <button
              className="skills__more-btn"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? t("skills.showLess") : t("skills.loadMore")}
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
      </div>
    </section>
  );
}
