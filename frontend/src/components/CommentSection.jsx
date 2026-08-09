import { useEffect, useState } from "react";
import { fetchPostComments, submitPostComment } from "../api";
import { useLanguage } from "../i18n/LanguageContext";
import Recaptcha, { isRecaptchaConfigured } from "./Recaptcha";
import UserAvatar from "./UserAvatar";

export default function CommentSection({ post }) {
  const { t, dateLocale } = useLanguage();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!post?.id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const data = await fetchPostComments(post.id);
      if (!cancelled) {
        setComments(data || []);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [post?.id]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(dateLocale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!name.trim() || !message.trim()) {
      setStatus({ type: "error", text: t("comments.required") });
      return;
    }

    if (!isRecaptchaConfigured()) {
      setStatus({ type: "error", text: t("captcha.notConfigured") });
      return;
    }

    if (!captchaToken) {
      setStatus({ type: "error", text: t("captcha.required") });
      return;
    }

    setSubmitting(true);
    try {
      await submitPostComment({
        post_id: post.id,
        post_slug: post.slug,
        post_title: post.title,
        name: name.trim(),
        message: message.trim(),
        captchaToken,
      });
      setName("");
      setMessage("");
      setCaptchaToken("");
      setCaptchaReset((n) => n + 1);
      setStatus({ type: "success", text: t("comments.successPending") });
    } catch (error) {
      setStatus({ type: "error", text: error.message || t("comments.error") });
      setCaptchaToken("");
      setCaptchaReset((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const commentCount = post.comment_count ?? comments.length;

  return (
    <section className="blog-comments" id="comments">
      <div className="blog-comments__header">
        <h2 className="blog-comments__title">{t("comments.title")}</h2>
        <p className="blog-comments__count">
          {loading
            ? t("comments.loading")
            : t("comments.count").replace("{count}", String(comments.length || commentCount))}
        </p>
      </div>

      {!loading && comments.length === 0 && (
        <p className="blog-comments__empty">{t("comments.empty")}</p>
      )}

      {!loading && comments.length > 0 && (
        <ul className="blog-comments__list">
          {comments.map((comment) => (
            <li key={comment.id} className="blog-comments__item">
              <div className="blog-comments__row">
                <UserAvatar name={comment.name} size={42} />
                <div className="blog-comments__body">
                  <div className="blog-comments__meta">
                    <strong className="blog-comments__name">{comment.name}</strong>
                    <time className="blog-comments__date">{formatDate(comment.created_at)}</time>
                  </div>
                  <p className="blog-comments__message">{comment.message}</p>
                  {comment.reply && (
                    <div className="blog-comments__reply">
                      <div className="blog-comments__reply-head">
                        <UserAvatar name="Farid" size={28} className="user-avatar--admin" />
                        <div className="blog-comments__reply-label">{t("comments.adminReply")}</div>
                      </div>
                      <p className="blog-comments__reply-text">{comment.reply}</p>
                      {comment.replied_at && (
                        <time className="blog-comments__date">{formatDate(comment.replied_at)}</time>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="blog-comments__form" onSubmit={handleSubmit}>
        <div className="blog-comments__form-head">
          <UserAvatar name={name} size={40} />
          <h3 className="blog-comments__form-title">{t("comments.leaveComment")}</h3>
        </div>
        {status && (
          <p
            className={`blog-comments__status blog-comments__status--${status.type}`}
            role="status"
          >
            {status.text}
          </p>
        )}
        <div className="blog-comments__field">
          <label htmlFor="comment-name">{t("comments.name")}</label>
          <input
            id="comment-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("comments.namePlaceholder")}
            maxLength={80}
            required
          />
        </div>
        <div className="blog-comments__field">
          <label htmlFor="comment-message">{t("comments.message")}</label>
          <textarea
            id="comment-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("comments.messagePlaceholder")}
            rows={4}
            maxLength={2000}
            required
          />
        </div>
        <div className="blog-comments__field blog-comments__captcha">
          <Recaptcha
            onChange={setCaptchaToken}
            onExpire={() => setCaptchaToken("")}
            resetSignal={captchaReset}
          />
        </div>
        <button type="submit" className="blog-comments__submit" disabled={submitting}>
          {submitting ? t("comments.sending") : t("comments.send")}
        </button>
      </form>
    </section>
  );
}
