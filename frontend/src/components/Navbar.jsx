import { useEffect, useState, startTransition } from "react";
import { Link, NavLink } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/navbar.css";

const links = [
  { to: "/", key: "home" },
  { to: "/about", key: "about" },
  { to: "/services", key: "services" },
  { to: "/projects", key: "projects" },
  { to: "/contact", key: "contact" },
  { to: "/blog", key: "blog" },
];

export default function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const changeLang = (next) => {
    startTransition(() => {
      setLang(next);
    });
  };

  const langSwitcher = (
    <div className="navbar__lang">
      <button
        type="button"
        className={`navbar__lang-btn${lang === "en" ? " is-active" : ""}`}
        onClick={() => changeLang("en")}
      >
        {t("lang.en")}
      </button>
      <button
        type="button"
        className={`navbar__lang-btn${lang === "az" ? " is-active" : ""}`}
        onClick={() => changeLang("az")}
      >
        {t("lang.az")}
      </button>
    </div>
  );

  return (
    <header className={`navbar${scrolled ? " is-scrolled" : ""}${open ? " menu-open" : ""}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" onClick={() => setOpen(false)}>
          Farid<span>.</span>
        </Link>

        <nav>
          <ul className="navbar__links">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `navbar__link${isActive ? " is-active" : ""}`
                  }
                >
                  {t(`nav.${link.key}`)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar__actions">
          {langSwitcher}
          <button
            type="button"
            className={`navbar__toggle${open ? " is-open" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-label={t("nav.toggleMenu")}
            aria-expanded={open}
          >
            <span className="navbar__toggle-line" />
            <span className="navbar__toggle-line" />
          </button>
        </div>
      </div>

      <div
        className={`navbar__mobile${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <ul className="navbar__mobile-links">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `navbar__mobile-link${isActive ? " is-active" : ""}`
                }
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
              >
                {t(`nav.${link.key}`)}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
