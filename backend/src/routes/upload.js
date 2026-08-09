import express from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authMiddleware } from "../middleware/auth.js";
import { supabase } from "../config/supabase.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../uploads");
const STORAGE_BUCKET = process.env.SUPABASE_UPLOADS_BUCKET || "uploads";

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const saveLocally = async (buffer, filename) => {
  const outputPath = path.join(uploadsDir, filename);
  await sharp(buffer).toFile(outputPath);
  return outputPath;
};

// POST /api/upload - Optimize and save image
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const webpBuffer = await sharp(req.file.buffer)
      .resize(1600, 1600, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    if (supabase) {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filename, webpBuffer, {
          contentType: "image/webp",
          upsert: false,
        });

      if (!error) {
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
        return res.json({
          success: true,
          url: data.publicUrl,
          filename,
          storage: "supabase",
        });
      }

      console.warn("Supabase storage upload failed, using local disk:", error.message);
    }

    await saveLocally(webpBuffer, filename);
    const url = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

    res.json({
      success: true,
      url,
      filename,
      storage: "local",
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    res.status(500).json({ error: error.message || "Failed to upload image" });
  }
});

export default router;
