import { useRef, useState } from "react";
import { uploadImage, getImageUrl } from "../../api/admin";

export default function ImageUpload({ label = "Image", value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = value ? getImageUrl(value) : "";

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const result = await uploadImage(file);
      onChange(result.url);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleClear = () => {
    onChange("");
    setError("");
  };

  return (
    <div className="admin-form__field admin-image-upload">
      <label>{label}</label>

      {previewUrl && (
        <div className="admin-image-upload__preview">
          <img src={previewUrl} alt="Preview" />
          <button type="button" className="admin-image-upload__remove" onClick={handleClear}>
            Remove
          </button>
        </div>
      )}

      <div className="admin-image-upload__actions">
        <button
          type="button"
          className="admin-btn"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          hidden
        />
      </div>

      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste an image URL"
        className="admin-image-upload__url"
      />

      {error && <p className="admin-image-upload__error">{error}</p>}
      <p className="admin-image-upload__hint">Images are converted to WebP and resized automatically.</p>
    </div>
  );
}
