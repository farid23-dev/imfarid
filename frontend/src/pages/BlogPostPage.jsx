import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPost } from "../api";
import Footer from "../components/Footer";
import LikeButton from "../components/LikeButton";
import CommentSection from "../components/CommentSection";
import { useLanguage } from "../i18n/LanguageContext";
import { applyPageMeta } from "../utils/seo";
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

  useEffect(() => {
    if (!post) return;
    const title = localize(post, "title");
    const excerpt = localize(post, "excerpt");
    applyPageMeta({
      title: t("seo.blogPostTitle").replace("{{title}}", title),
      description: excerpt || t("seo.blog.description"),
      path: `/blog/${post.slug || slug}`,
      image: post.cover_image,
      type: "article",
    });
  }, [post, localize, slug, t]);

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
          <div className="blog-post-page__footer-meta">
            <LikeButton type="posts" id={post.id} initialCount={post.like_count || 0} size="large" />
            <a href="#comments" className="blog-post-page__comment-count">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {t("comments.count").replace("{count}", String(post.comment_count || 0))}
            </a>
          </div>
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
