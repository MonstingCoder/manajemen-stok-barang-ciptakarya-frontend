import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../useAuth";
import { authApi, ApiError } from "../api";
import { Brand } from "../components/Brand";
import { Icon } from "../components/Icon";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authApi.login(email.trim(), password);
      login(result.token);
      void navigate({ to: "/app/items" });
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Tidak dapat memproses login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-panel">
        <div className="login-brand-row"><Link to="/" aria-label="Kembali ke beranda"><Brand /></Link><span className="login-index">PORTAL / 01</span></div>
        <div className="login-main">
          <div className="eyebrow"><span className="eyebrow-line" /> AKSES PENGGUNA</div>
          <h1>Selamat datang<br />kembali.</h1>
          <p className="login-description">Masuk untuk mengakses ruang kerja inventaris Cipta Karya.</p>
          <form onSubmit={submit} className="login-form">
            <label htmlFor="email">Alamat email</label>
            <div className="input-wrap"><Icon name="mail" size={18} /><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@perusahaan.co.id" required autoFocus /></div>
            <label htmlFor="password">Kata sandi</label>
            <div className="input-wrap"><Icon name="lock" size={18} /><input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" required /></div>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button type="submit" className="button button-dark login-submit" disabled={loading}>{loading ? "Memeriksa..." : "Masuk ke sistem"} {!loading && <Icon name="arrow" size={17} />}</button>
          </form>
          <p className="login-help">Belum memiliki akses? Hubungi administrator sistem.</p>
        </div>
        <div className="login-bottom"><Link to="/">← Kembali ke beranda</Link><span>Sesi pengguna · JWT</span></div>
      </div>
      <aside className="login-aside">
        <div className="aside-grid" />
        <div className="aside-content">
          <span className="aside-mark">CK<span> / </span>INV</span>
          <p>Ruang kerja yang tertata<br />dimulai dari data yang tepat.</p>
          <div className="aside-rule" />
          <div className="aside-caption"><span>01</span><span>INVENTORY MANAGEMENT</span><span>INTERNAL SYSTEM</span></div>
        </div>
        <div className="aside-bottom">CIPTA KARYA <span>•</span> INTERNAL PLATFORM</div>
      </aside>
    </main>
  );
}
