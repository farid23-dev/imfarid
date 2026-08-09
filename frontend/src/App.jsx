import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import DocumentMeta from "./components/DocumentMeta";
import Analytics from "./components/Analytics";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ProjectsPage from "./pages/ProjectsPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminComments from "./pages/admin/AdminComments";
import AdminExperiences from "./pages/admin/AdminExperiences";

export default function App() {
  return (
    <BrowserRouter>
      <DocumentMeta />
      <Analytics />
      <Routes>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="services" element={<ServicesPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="comments" element={<AdminComments />} />
          <Route path="experiences" element={<AdminExperiences />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
