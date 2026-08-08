import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPost } from "../api";
import Footer from "../components/Footer";
import LikeButton from "../components/LikeButton";
import CommentSection from "../components/CommentSection";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/blog-post-page.css";

export default function BlogPostPage() {
  const { slug } = useParams();
  const { t, localize, dateLocale } = useLanguage();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    async function loadPost() {
      const data = await fetchPost(slug);
      setPost(data);
      setLoading(false);
    }
    loadPost();
  }, [slug]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(dateLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="blog-post-page">
        <div className="blog-post-page__loading">
          <div className="blog-post-page__loading-spinner"></div>
          <p>{t("blogPost.loading")}</p>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="blog-post-page">
        <div className="blog-post-page__not-found">
          <h1>{t("blogPost.notFoundTitle")}</h1>
          <p>{t("blogPost.notFoundText")}</p>
          <Link to="/blog" className="blog-post-page__back-btn">
            {t("blogPost.backToBlog")}
          </Link>
        </div>
      </main>
    );
  }

  const title = localize(post, "title");
  const excerpt = localize(post, "excerpt");
  const content = localize(post, "content");

  return (
    <main className={`blog-post-page ${visible ? "is-visible" : ""}`}>
      <article className="blog-post-page__article">
        <header className="blog-post-page__header">
          <Link to="/blog" className="blog-post-page__back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t("blogPost.backToBlog")}
          </Link>
          <time className="blog-post-page__date">{formatDate(post.created_at)}</time>
          <h1 className="blog-post-page__title">{title}</h1>
          {excerpt && (
            <p className="blog-post-page__excerpt">{excerpt}</p>
          )}
        </header>

        {post.cover_image && (
          <div className="blog-post-page__cover">
            <img src={post.cover_image} alt={title} />
          </div>
        )}

        <div
          className="blog-post-page__content"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        <footer className="blog-post-page__footer">
          <LikeButton type="posts" id={post.id} initialCount={post.like_count || 0} size="large" />
          <Link to="/blog" className="blog-post-page__back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t("blogPost.backToAll")}
          </Link>
        </footer>

        <CommentSection post={post} />
      </article>
      <Footer />
    </main>
  );
}
