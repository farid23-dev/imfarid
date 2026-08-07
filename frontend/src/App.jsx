import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PlaceholderPage from "./pages/PlaceholderPage";

const pages = [
  { path: "about", title: "About", blurb: "My story and background — coming soon." },
  { path: "services", title: "Services", blurb: "Web development, Google Ads, consulting." },
  { path: "projects", title: "Projects", blurb: "Selected work — coming soon." },
  { path: "contact", title: "Contact", blurb: "Get in touch with me." },
  { path: "blog", title: "Blog", blurb: "Thoughts on web, ads, and Android." },
];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          {pages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={<PlaceholderPage title={page.title} blurb={page.blurb} />}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
