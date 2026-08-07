import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "../api";
import Footer from "../components/Footer";
import LikeButton from "../components/LikeButton";
import "../styles/blog-page.css";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    async function loadPosts() {
      const data = await fetchPosts();
      setPosts(data || []);
      setLoading(false);
    }
    loadPosts();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className={`blog-page ${visible ? "is-visible" : ""}`}>
      <section className="blog-page__hero">
        <div className="blog-page__hero-inner">
          <span className="blog-page__label">Blog</span>
          <h1 className="blog-page__title">Thoughts & Insights</h1>
          <p className="blog-page__subtitle">
            Articles about web development, tech, marketing, and my journey as a developer.
          </p>
        </div>
      </section>

      <section className="blog-page__content">
        <div className="blog-page__content-inner">
          {loading ? (
            <div className="blog-page__loading">
              <div className="blog-page__loading-spinner"></div>
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="blog-page__empty">
              <div className="blog-page__empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="M2 2l7.586 7.586"/>
                  <circle cx="11" cy="11" r="2"/>
                </svg>
              </div>
              <h2>Coming Soon</h2>
              <p>
                I'm working on some great content! Check back soon for articles 
                about web development, marketing, and more.
              </p>
              <Link to="/" className="blog-page__back-btn">
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="blog-page__grid">
              {posts.map((post, index) => (
                <article
                  key={post.id}
                  className="blog-page__card"
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                >
                  <Link to={`/blog/${post.slug}`} className="blog-page__card-link">
                    <div className="blog-page__card-image">
                      {post.cover_image ? (
                        <img src={post.cover_image} alt={post.title} />
                      ) : (
                        <div className="blog-page__card-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="blog-page__card-content">
                      <time className="blog-page__card-date">
                        {formatDate(post.created_at)}
                      </time>
                      <h2 className="blog-page__card-title">{post.title}</h2>
                      {post.excerpt && (
                        <p className="blog-page__card-excerpt">{post.excerpt}</p>
                      )}
                      <span className="blog-page__card-read">
                        Read More
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                  <div className="blog-page__card-actions">
                    <LikeButton type="posts" id={post.id} initialCount={post.like_count || 0} size="compact" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
