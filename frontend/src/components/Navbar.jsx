import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const langSwitcher = (
    <div className="navbar__lang">
      <button
        type="button"
        className={`navbar__lang-btn${lang === "en" ? " is-active" : ""}`}
        onClick={() => setLang("en")}
      >
        {t("lang.en")}
      </button>
      <button
        type="button"
        className={`navbar__lang-btn${lang === "az" ? " is-active" : ""}`}
        onClick={() => setLang("az")}
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
            onClick={() => setOpen(!open)}
            aria-label={t("nav.toggleMenu")}
          >
            <span className="navbar__toggle-line" />
            <span className="navbar__toggle-line" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="navbar__mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="navbar__mobile-links">
              {links.map((link, i) => (
                <motion.li
                  key={link.to}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      `navbar__mobile-link${isActive ? " is-active" : ""}`
                    }
                    onClick={() => setOpen(false)}
                  >
                    {t(`nav.${link.key}`)}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
