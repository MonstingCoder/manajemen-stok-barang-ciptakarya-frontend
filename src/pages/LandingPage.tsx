import { Link } from "@tanstack/react-router";
import { Brand } from "../components/Brand";
import { Icon } from "../components/Icon";

export function LandingPage() {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Brand />
        <Link to="/login" className="landing-signin">Masuk <Icon name="arrow" size={16} /></Link>
      </nav>
      <section className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> SISTEM OPERASIONAL CIPTA KARYA</div>
          <h1>Semua stok.<br /><span>Satu kendali.</span></h1>
          <p>Kelola inventaris dengan lebih tertata. Pantau barang, perbarui jumlah, dan jaga data tetap mudah diakses oleh tim.</p>
          <div className="hero-actions">
            <Link to="/login" className="button button-dark">Masuk ke sistem <Icon name="arrow" size={17} /></Link>
            <span className="hero-note">Akses khusus pengguna terdaftar</span>
          </div>
          <div className="hero-trust"><span className="trust-dot" /> DATA INVENTARIS TERPUSAT <span className="trust-divider" /> AKSES BERBASIS PERAN</div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-topline"><span>RINGKASAN INVENTARIS</span><span className="visual-live"><i /> LIVE</span></div>
          <div className="visual-metric">
            <span className="metric-label">PENGELOLAAN TERINTEGRASI</span>
            <strong>Lebih rapi,<br />lebih terukur.</strong>
            <p>Satu ruang untuk melihat dan mengelola aset operasional.</p>
          </div>
          <div className="visual-chart">
            <div className="chart-head"><span>ALUR PENGELOLAAN</span><span>01 — 04</span></div>
            <div className="chart-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="chart-labels"><span>DATA</span><span>PEMANTAUAN</span><span>AKSI</span></div>
          </div>
          <div className="visual-corner">CK<span> / </span>01</div>
        </div>
      </section>
      <section className="landing-features">
        <article><span className="feature-number">01</span><div><h2>Inventaris terpusat</h2><p>Detail barang, nilai, jumlah, dan tag tersimpan dalam satu tampilan.</p></div></article>
        <article><span className="feature-number">02</span><div><h2>Perubahan tercatat</h2><p>Perbarui stok dan informasi barang sesuai kebutuhan operasional.</p></div></article>
        <article><span className="feature-number">03</span><div><h2>Akses teratur</h2><p>Hak akses admin dan pengguna mengikuti peran di sistem.</p></div></article>
      </section>
      <footer className="landing-footer"><Brand compact /><span>© Cipta Karya · Sistem internal</span></footer>
    </main>
  );
}
