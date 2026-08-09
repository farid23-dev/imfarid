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

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return "—";
  const s = Math.round(Number(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m <= 0) return `${rem}s`;
  return `${m}m ${rem}s`;
}

function Change({ value }) {
  if (value == null) return null;
  const up = value > 0;
  const flat = value === 0;
  return (
    <span className={`admin-analytics__change${flat ? " is-flat" : up ? " is-up" : " is-down"}`}>
      {flat ? "0%" : `${up ? "+" : ""}${value}%`}
      <small> vs prev</small>
    </span>
  );
}

function ShareBars({ items, empty }) {
  if (!items?.length) {
    return <p className="admin-analytics__empty">{empty}</p>;
  }
  return (
    <ul className="admin-analytics__bars">
      {items.map((item) => (
        <li key={item.name}>
          <div className="admin-analytics__bars-meta">
            <span>{item.name}</span>
            <span>
              {formatNumber(item.count)} · {item.share}%
            </span>
          </div>
          <div className="admin-analytics__bars-track">
            <div style={{ width: `${Math.max(item.share, 2)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let timer;

    const load = async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        const result = await fetchAnalytics(period);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled && !silent) {
          setError(err.message || "Failed to load analytics");
          setData(null);
        }
      } finally {
        if (!cancelled && !silent) setLoading(false);
      }
    };

    load();
    timer = setInterval(() => load(true), 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
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
  const cmp = data?.comparison || {};

  return (
    <div className="admin-page">
      <div className="admin-page__header admin-analytics__header">
        <div>
          <h1>Analytics</h1>
          <p>First-party traffic insights for your site.</p>
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

      <div className="admin-analytics__live">
        <span className="admin-analytics__live-dot" />
        <strong>{formatNumber(data?.realtime?.visitors || 0)}</strong>
        live visitors
        <span className="admin-analytics__live-hint">last 5 minutes · auto-refresh</span>
      </div>

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
            <Change value={cmp.visitors} />
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
            <Change value={cmp.pageviews} />
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--experiences">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="admin-stat__info">
            <span className="admin-stat__value">{formatNumber(agg.sessions)}</span>
            <span className="admin-stat__label">Sessions</span>
            <Change value={cmp.sessions} />
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
              {agg.bounceRate != null ? `${agg.bounceRate}%` : "—"}
            </span>
            <span className="admin-stat__label">Bounce rate</span>
            <span className="admin-stat__sub">
              {agg.pagesPerVisit != null ? `${agg.pagesPerVisit} pages/visit` : ""}
              {agg.visitDuration != null ? ` · avg ${formatDuration(agg.visitDuration)}` : ""}
            </span>
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
            <h2>Devices</h2>
          </div>
          <div className="admin-analytics__panel">
            <ShareBars items={data?.devices} empty="No device data yet" />
          </div>
        </div>
        <div className="admin-section">
          <div className="admin-section__header">
            <h2>Browsers</h2>
          </div>
          <div className="admin-analytics__panel">
            <ShareBars items={data?.browsers} empty="No browser data yet" />
          </div>
        </div>
      </div>

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
