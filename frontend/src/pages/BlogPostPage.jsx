import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPost } from "../api";
import "../styles/blog-post-page.css";

export default function BlogPostPage() {
  const { slug } = useParams();
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
    return new Date(dateString).toLocaleDateString("en-US", {
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
          <p>Loading post...</p>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="blog-post-page">
        <div className="blog-post-page__not-found">
          <h1>Post Not Found</h1>
          <p>The post you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog" className="blog-post-page__back-btn">
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`blog-post-page ${visible ? "is-visible" : ""}`}>
      <article className="blog-post-page__article">
        <header className="blog-post-page__header">
          <Link to="/blog" className="blog-post-page__back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
          <time className="blog-post-page__date">{formatDate(post.created_at)}</time>
          <h1 className="blog-post-page__title">{post.title}</h1>
          {post.excerpt && (
            <p className="blog-post-page__excerpt">{post.excerpt}</p>
          )}
        </header>

        {post.cover_image && (
          <div className="blog-post-page__cover">
            <img src={post.cover_image} alt={post.title} />
          </div>
        )}

        <div
          className="blog-post-page__content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="blog-post-page__footer">
          <Link to="/blog" className="blog-post-page__back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to all posts
          </Link>
        </footer>
      </article>
    </main>
  );
}
