import { useEffect, useState } from "react";
import { submitContactForm } from "../api";
import Footer from "../components/Footer";
import Recaptcha, { isRecaptchaConfigured } from "../components/Recaptcha";
import TelegramIcon from "../components/TelegramIcon";
import WhatsAppIcon from "../components/WhatsAppIcon";
import { SOCIAL_LINKS } from "../constants/social";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/contact-page.css";

export default function ContactPage() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status) setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    if (!isRecaptchaConfigured()) {
      setStatus("error");
      setStatusMessage(t("captcha.notConfigured"));
      setIsSubmitting(false);
      return;
    }

    if (!captchaToken) {
      setStatus("error");
      setStatusMessage(t("captcha.required"));
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await submitContactForm({ ...formData, captchaToken });
      setStatus("success");
      setStatusMessage(result.message);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setCaptchaToken("");
      setCaptchaReset((n) => n + 1);
    } catch (error) {
      setStatus("error");
      setStatusMessage(error.message || t("contactPage.errorFallback"));
      setCaptchaToken("");
      setCaptchaReset((n) => n + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`contact-page ${visible ? "is-visible" : ""}`}>
      <section className="contact-page__hero">
        <div className="contact-page__hero-inner">
          <span className="contact-page__label">{t("contactPage.label")}</span>
          <h1 className="contact-page__title">{t("contactPage.title")}</h1>
          <p className="contact-page__subtitle">
            {t("contactPage.subtitle")}
          </p>
        </div>
      </section>

      <section className="contact-page__content">
        <div className="contact-page__content-inner">
          <div className="contact-page__info">
            <h2>{t("contactPage.connectTitle")}</h2>
            <p>{t("contactPage.connectText")}</p>

            <div className="contact-page__cards">
              <a href="mailto:ismayilovf@outlook.com" className="contact-page__card">
                <div className="contact-page__card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <div className="contact-page__card-text">
                  <span className="contact-page__card-label">{t("contactPage.email")}</span>
                  <span className="contact-page__card-value">ismayilovf@outlook.com</span>
                </div>
              </a>

              <a href={SOCIAL_LINKS.phone} className="contact-page__card">
                <div className="contact-page__card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div className="contact-page__card-text">
                  <span className="contact-page__card-label">{t("contactPage.phone")}</span>
                  <span className="contact-page__card-value">{SOCIAL_LINKS.phoneDisplay}</span>
                </div>
              </a>

              <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" className="contact-page__card">
                <div className="contact-page__card-icon">
                  <TelegramIcon size={24} />
                </div>
                <div className="contact-page__card-text">
                  <span className="contact-page__card-label">{t("contactPage.telegram")}</span>
                  <span className="contact-page__card-value">{SOCIAL_LINKS.telegramHandle}</span>
                </div>
              </a>

              <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="contact-page__card">
                <div className="contact-page__card-icon">
                  <WhatsAppIcon size={24} />
                </div>
                <div className="contact-page__card-text">
                  <span className="contact-page__card-label">{t("contactPage.whatsapp")}</span>
                  <span className="contact-page__card-value">{SOCIAL_LINKS.phoneDisplay}</span>
                </div>
              </a>

              <div className="contact-page__card">
                <div className="contact-page__card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="contact-page__card-text">
                  <span className="contact-page__card-label">{t("contactPage.location")}</span>
                  <span className="contact-page__card-value">{t("contactPage.locationValue")}</span>
                </div>
              </div>
            </div>

            <div className="contact-page__social">
              <span className="contact-page__social-label">{t("contactPage.findMe")}</span>
              <div className="contact-page__social-links">
                <a
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-page__social-link"
                  aria-label="LinkedIn"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href={SOCIAL_LINKS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-page__social-link"
                  aria-label="GitHub"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a
                  href={SOCIAL_LINKS.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-page__social-link"
                  aria-label="Telegram"
                >
                  <TelegramIcon size={22} />
                </a>
                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-page__social-link"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon size={22} />
                </a>
              </div>
            </div>
          </div>

          <div className="contact-page__form-wrapper">
            <form className="contact-page__form" onSubmit={handleSubmit}>
              <h2>{t("contactPage.formTitle")}</h2>

              {status === "success" && (
                <div className="contact-page__form-status contact-page__form-status--success">
                  {statusMessage}
                </div>
              )}

              {status === "error" && (
                <div className="contact-page__form-status contact-page__form-status--error">
                  {statusMessage}
                </div>
              )}

              <div className="contact-page__form-row">
                <div className="contact-page__form-group">
                  <label htmlFor="name">{t("contactPage.name")}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={t("contactPage.namePlaceholder")}
                  />
                </div>
                <div className="contact-page__form-group">
                  <label htmlFor="email">{t("contactPage.emailLabel")}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder={t("contactPage.emailPlaceholder")}
                  />
                </div>
              </div>

              <div className="contact-page__form-group">
                <label htmlFor="subject">{t("contactPage.subject")}</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t("contactPage.subjectPlaceholder")}
                />
              </div>

              <div className="contact-page__form-group">
                <label htmlFor="message">{t("contactPage.message")}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder={t("contactPage.messagePlaceholder")}
                ></textarea>
              </div>

              <div className="contact-page__form-group contact-page__captcha">
                <Recaptcha
                  onChange={setCaptchaToken}
                  onExpire={() => setCaptchaToken("")}
                  resetSignal={captchaReset}
                />
              </div>

              <button 
                type="submit" 
                className="contact-page__form-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("contactPage.sending") : t("contactPage.send")}
                {!isSubmitting && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
