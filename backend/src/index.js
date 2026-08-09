import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.js";
import experiencesRouter from "./routes/experiences.js";
import projectsRouter from "./routes/projects.js";
import postsRouter from "./routes/posts.js";
import contactRouter from "./routes/contact.js";
import uploadRouter from "./routes/upload.js";
import likesRouter from "./routes/likes.js";
import commentsRouter from "./routes/comments.js";
import analyticsRouter from "./routes/analytics.js";
import sitemapRouter from "./routes/sitemap.js";

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/experiences", experiencesRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/likes", likesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/sitemap.xml", sitemapRouter);
app.use("/api/sitemap.xml", sitemapRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
