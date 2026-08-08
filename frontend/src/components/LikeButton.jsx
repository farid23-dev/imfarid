import { useEffect, useState } from "react";
import { fetchLike, toggleLike } from "../api";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/like-button.css";

export default function LikeButton({ type, id, initialCount = 0, size = "default" }) {
  const { t } = useLanguage();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!id) return;
      try {
        const data = await fetchLike(type, id);
        if (!active) return;
        setCount(data.count ?? 0);
        setLiked(!!data.liked);
      } catch (error) {
        console.error("Failed to load likes:", error);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [type, id]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || !id) return;

    setLoading(true);
    // Optimistic update
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));

    try {
      const data = await toggleLike(type, id);
      setCount(data.count ?? 0);
      setLiked(!!data.liked);
    } catch (error) {
      // Revert
      setLiked(!nextLiked);
      setCount((prev) => Math.max(0, prev + (nextLiked ? -1 : 1)));
      console.error("Failed to toggle like:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`like-btn like-btn--${size} ${liked ? "is-liked" : ""}`}
      onClick={handleClick}
      disabled={loading}
      aria-pressed={liked}
      aria-label={liked ? t("common.unlike") : t("common.like")}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{count}</span>
    </button>
  );
}
