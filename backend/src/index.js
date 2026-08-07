import "dotenv/config";
import express from "express";
import cors from "cors";
import experiencesRouter from "./routes/experiences.js";
import projectsRouter from "./routes/projects.js";
import postsRouter from "./routes/posts.js";
import contactRouter from "./routes/contact.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/experiences", experiencesRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/contact", contactRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
