import { useEffect, useMemo, useState } from "react";
import { fetchAnalytics } from "../../api/admin";

const PERIODS = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "month", label: "This month" },
  { id: "6mo", label: "6 months" },
];

function formatNumber(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString();
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchAnalytics(period);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load analytics");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const maxPageviews = useMemo(() => {
    const series = data?.timeseries || [];
    return Math.max(1, ...series.map((d) => d.pageviews || 0));
  }, [data]);

  if (loading) {
    return <div className="admin-page__loading">Loading analytics...</div>;
  }

  if (error && !data) {
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <h1>Analytics</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const agg = data?.aggregate || {};

  return (
    <div className="admin-page">
      <div className="admin-page__header admin-analytics__header">
        <div>
          <h1>Analytics</h1>
          <p>Free first-party traffic stats for your site (no third-party service).</p>
        </div>
        <div className="admin-analytics__periods">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`admin-analytics__period${period === p.id ? " is-active" : ""}`}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {data?.error && <div className="admin-analytics__error">{data.error}</div>}

      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--analytics">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
          </div>
          <div className="admin-stat__info">
            <span className="admin-stat__value">{formatNumber(agg.visitors)}</span>
            <span className="admin-stat__label">Unique visitors</span>
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--projects">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="admin-stat__info">
            <span className="admin-stat__value">{formatNumber(agg.pageviews)}</span>
            <span className="admin-stat__label">Pageviews</span>
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--experiences">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="admin-stat__info">
            <span className="admin-stat__value">{formatNumber(data?.blogPosts?.length || 0)}</span>
            <span className="admin-stat__label">Blog posts viewed</span>
            <span className="admin-stat__sub">in this period</span>
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--posts">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <div className="admin-stat__info">
            <span className="admin-stat__value">{formatNumber(data?.topPages?.length || 0)}</span>
            <span className="admin-stat__label">Pages with traffic</span>
          </div>
        </div>
      </div>

      {(data?.timeseries || []).length > 0 && (
        <div className="admin-section admin-analytics__chart-card">
          <div className="admin-section__header">
            <h2>Pageviews over time</h2>
          </div>
          <div className="admin-analytics__chart" aria-hidden="true">
            {data.timeseries.map((point) => (
              <div
                key={point.date}
                className="admin-analytics__bar-wrap"
                title={`${point.date}: ${point.pageviews} views · ${point.visitors} visitors`}
              >
                <div
                  className="admin-analytics__bar"
                  style={{
                    height: `${Math.max(4, (point.pageviews / maxPageviews) * 100)}%`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-analytics__grid">
        <div className="admin-section">
          <div className="admin-section__header">
            <h2>Top pages</h2>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Visitors</th>
                  <th>Views</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topPages || []).length === 0 ? (
                  <tr>
                    <td colSpan={3}>No pageviews yet — browse the public site to start collecting.</td>
                  </tr>
                ) : (
                  data.topPages.map((row) => (
                    <tr key={row.page}>
                      <td>
                        <code>{row.page}</code>
                      </td>
                      <td>{formatNumber(row.visitors)}</td>
                      <td>{formatNumber(row.pageviews)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section__header">
            <h2>Blog posts</h2>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Visitors</th>
                  <th>Views</th>
                </tr>
              </thead>
              <tbody>
                {(data?.blogPosts || []).length === 0 ? (
                  <tr>
                    <td colSpan={3}>No blog views in this period</td>
                  </tr>
                ) : (
                  data.blogPosts.map((row) => (
                    <tr key={row.page}>
                      <td>
                        <code>{row.page.replace(/^\/blog\//, "")}</code>
                      </td>
                      <td>{formatNumber(row.visitors)}</td>
                      <td>{formatNumber(row.pageviews)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
