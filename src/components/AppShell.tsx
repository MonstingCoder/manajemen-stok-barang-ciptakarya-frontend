import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../useAuth";
import { isAdminRole } from "../auth";
import { Brand } from "./Brand";
import { Icon } from "./Icon";

export function AppShell() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = isAdminRole(session?.role ?? null);

  useEffect(() => {
    const handleExpired = () => void navigate({ to: "/login", replace: true });
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [navigate]);

  const signOut = () => {
    logout();
    void navigate({ to: "/" });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand">
          <Brand />
        </Link>
        <div className="sidebar-section-label">MENU UTAMA</div>
        <nav className="side-nav" aria-label="Navigasi utama">
          <Link to="/app/items" aria-label="Inventaris" activeProps={{ className: "nav-link active" }} className="nav-link">
            <Icon name="box" />
            <span>Inventaris</span>
          </Link>
          <Link to="/app/tags" aria-label="Kategori dan tag" activeProps={{ className: "nav-link active" }} className="nav-link">
            <Icon name="tag" />
            <span>Kategori &amp; tag</span>
          </Link>
          <Link to="/app/account" aria-label="Akun saya" activeProps={{ className: "nav-link active" }} className="nav-link">
            <Icon name="user" />
            <span>Akun saya</span>
          </Link>
          {isAdmin && (
            <Link to="/app/users" aria-label="Pengguna" activeProps={{ className: "nav-link active" }} className="nav-link">
              <Icon name="users" />
              <span>Pengguna</span>
              <span className="nav-admin">ADMIN</span>
            </Link>
          )}
        </nav>
        <div className="sidebar-bottom">
          <button type="button" className="nav-link logout-link" aria-label="Keluar dari sistem" onClick={signOut}>
            <Icon name="logout" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-mobile-brand"><Brand compact /></div>
          <div className="breadcrumb"><span>Ruang kerja</span><Icon name="chevron" size={14} /><strong>Manajemen stok</strong></div>
          <div className="topbar-user">
            <span className="user-avatar">{session?.role === "admin" ? "A" : "U"}</span>
            <span className="user-role">{session?.role === "admin" ? "Administrator" : "Pengguna"}</span>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
        <footer className="app-footer">Cipta Karya <span>·</span> Sistem manajemen inventaris</footer>
      </div>
    </div>
  );
}
