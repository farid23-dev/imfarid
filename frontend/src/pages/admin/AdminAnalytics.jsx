import { useEffect, useMemo, useState } from "react";
import { fetchAnalytics } from "../../api/admin";

const PERIODS = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "month", label: "This month" },
  { id: "6mo", label: "6 months" },
];

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return "—";
  const s = Math.round(Number(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m <= 0) return `${rem}s`;
  return `${m}m ${rem}s`;
}

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

  if (!data?.configured) {
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <h1>Analytics</h1>
          <p>Connect Plausible to see visits, top pages, and blog post views here.</p>
        </div>

        <div className="admin-section admin-analytics__setup">
          <div className="admin-section__header">
            <h2>Setup (about 5 minutes)</h2>
          </div>
          <ol className="admin-analytics__steps">
            <li>
              Create a free account at{" "}
              <a href="https://plausible.io/register" target="_blank" rel="noreferrer">
                plausible.io
              </a>{" "}
              and add site <strong>imfarid.com</strong>.
            </li>
            <li>
              In Plausible → Site settings → <strong>Visibility</strong>, copy a shared
              dashboard link (optional, for the embed below).
            </li>
            <li>
              In Plausible → Settings → <strong>API keys</strong>, create a key.
            </li>
            <li>
              On the VPS, add to <code>backend/.env</code>:
              <pre>{`PLAUSIBLE_SITE_ID=imfarid.com
PLAUSIBLE_API_KEY=your_api_key_here
# optional:
PLAUSIBLE_SHARED_LINK=https://plausible.io/share/imfarid.com?auth=...`}</pre>
            </li>
            <li>
              In the frontend build env (or <code>frontend/.env</code> before build), set:
              <pre>{`VITE_PLAUSIBLE_DOMAIN=imfarid.com`}</pre>
              Then rebuild the frontend and restart the API:
              <pre>{`pm2 restart imfarid-api --update-env
cd /opt/imfarid/frontend && npm run build && rsync -a --delete dist/ /var/www/imfarid/`}</pre>
            </li>
          </ol>
          {data?.message && <p className="admin-analytics__hint">{data.message}</p>}
        </div>
      </div>
    );
  }

  const agg = data.aggregate || {};

  return (
    <div className="admin-page">
      <div className="admin-page__header admin-analytics__header">
        <div>
          <h1>Analytics</h1>
          <p>
            Traffic for <strong>{data.siteId}</strong> via Plausible
            {data.error ? ` — ${data.error}` : ""}
          </p>
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

      {data.error ? (
        <div className="admin-analytics__error">{data.error}</div>
      ) : (
        <>
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
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div className="admin-stat__info">
                <span className="admin-stat__value">{formatDuration(agg.visitDuration)}</span>
                <span className="admin-stat__label">Avg. visit duration</span>
              </div>
            </div>
            <div className="admin-stat">
              <div className="admin-stat__icon admin-stat__icon--posts">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div className="admin-stat__info">
                <span className="admin-stat__value">
                  {agg.bounceRate != null ? `${Math.round(agg.bounceRate)}%` : "—"}
                </span>
                <span className="admin-stat__label">Bounce rate</span>
              </div>
            </div>
          </div>

          {(data.timeseries || []).length > 0 && (
            <div className="admin-section admin-analytics__chart-card">
              <div className="admin-section__header">
                <h2>Pageviews over time</h2>
              </div>
              <div className="admin-analytics__chart" aria-hidden="true">
                {data.timeseries.map((point) => (
                  <div key={point.date} className="admin-analytics__bar-wrap" title={`${point.date}: ${point.pageviews} views`}>
                    <div
                      className="admin-analytics__bar"
                      style={{ height: `${Math.max(4, (point.pageviews / maxPageviews) * 100)}%` }}
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
                    {(data.topPages || []).length === 0 ? (
                      <tr>
                        <td colSpan={3}>No page data yet</td>
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
                    {(data.blogPosts || []).length === 0 ? (
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

          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Top sources</h2>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Visitors</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.sources || []).length === 0 ? (
                    <tr>
                      <td colSpan={3}>No source data yet</td>
                    </tr>
                  ) : (
                    data.sources.map((row) => (
                      <tr key={row.source}>
                        <td>{row.source}</td>
                        <td>{formatNumber(row.visitors)}</td>
                        <td>{formatNumber(row.pageviews)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {data.sharedLink && (
        <div className="admin-section admin-analytics__embed-card">
          <div className="admin-section__header">
            <h2>Full Plausible dashboard</h2>
            <a href={data.sharedLink} target="_blank" rel="noreferrer">
              Open ↗
            </a>
          </div>
          <iframe
            title="Plausible shared dashboard"
            className="admin-analytics__embed"
            src={`${data.sharedLink}${data.sharedLink.includes("?") ? "&" : "?"}embed=true&theme=dark`}
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
