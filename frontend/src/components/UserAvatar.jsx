const DEFAULT_AVATAR = "/avatar-default.svg";

export default function UserAvatar({ name = "", size = 40, className = "" }) {
  const initial = String(name).trim().charAt(0).toUpperCase();
  const showInitial = initial && initial !== "?";

  return (
    <span
      className={`user-avatar ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img src={DEFAULT_AVATAR} alt="" width={size} height={size} />
      {showInitial && <span className="user-avatar__initial">{initial}</span>}
    </span>
  );
}
