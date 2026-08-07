export default function PlaceholderPage({ title, blurb }) {
  return (
    <section className="page-placeholder">
      <div>
        <h1>{title}</h1>
        <p>{blurb}</p>
      </div>
    </section>
  );
}
