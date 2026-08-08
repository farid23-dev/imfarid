export default function AdminLangTabs({ lang, onChange }) {
  return (
    <div className="admin-lang-tabs">
      <button
        type="button"
        className={`admin-lang-tabs__btn${lang === "en" ? " is-active" : ""}`}
        onClick={() => onChange("en")}
      >
        English
      </button>
      <button
        type="button"
        className={`admin-lang-tabs__btn${lang === "az" ? " is-active" : ""}`}
        onClick={() => onChange("az")}
      >
        Azərbaycanca
      </button>
    </div>
  );
}
