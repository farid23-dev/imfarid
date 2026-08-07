import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "../styles/navbar.css";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
  { to: "/blog", label: "Blog" },
];

export default function Navbar() {
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
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={`navbar__toggle${open ? " is-open" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="navbar__toggle-line" />
          <span className="navbar__toggle-line" />
        </button>
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
                    {link.label}
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
