import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import CustomCursor from "./CustomCursor";
import "../styles/layout.css";

export default function Layout() {
  return (
    <div className="site-shell">
      <CustomCursor />
      <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
}
