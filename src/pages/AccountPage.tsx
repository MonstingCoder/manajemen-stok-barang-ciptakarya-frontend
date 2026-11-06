import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError, usersApi } from "../api";
import { useAuth } from "../useAuth";
import { Icon } from "../components/Icon";
import type { InventoryUser, UserInput } from "../types";

function isValidPassword(password: string): boolean {
  const byteLength = new TextEncoder().encode(password).length;
  return (
    byteLength >= 8 &&
    byteLength < 72 &&
    /\p{Lu}/u.test(password) &&
    /\p{Ll}/u.test(password) &&
    /\p{N}/u.test(password) &&
    /[\p{P}\p{S}]/u.test(password)
  );
}

export function AccountPage() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<InventoryUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async (): Promise<boolean> => {
    try {
      const current = await usersApi.me();
      setProfile(current);
      setName(current.name);
      setEmail(current.email);
      setError("");
      return true;
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Gagal memuat profil akun.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile || !session) return;
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Nama lengkap tidak boleh kosong.");
      return;
    }

    const input: UserInput = {};
    if (name.trim() !== profile.name) input.name = name.trim();
    if (email.trim() !== profile.email) input.email = email.trim();
    if (password) {
      if (!isValidPassword(password)) {
        setError("Kata sandi harus 8–71 byte serta memuat huruf besar, huruf kecil, angka, dan simbol.");
        return;
      }
      input.password = password;
    }
    if (!Object.keys(input).length) {
      setError("Belum ada perubahan untuk disimpan.");
      return;
    }

    setSaving(true);
    try {
      await usersApi.update(session.userId, input);
      setPassword("");
      if (await loadProfile()) setSuccess("Perubahan akun berhasil disimpan.");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Gagal memperbarui profil akun.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> PENGATURAN / AKUN SAYA</div>
          <h1>Profil akun</h1>
          <p>Perbarui informasi akun pribadi Anda. Peran akses dikelola administrator.</p>
        </div>
        {profile && <div className="heading-count"><strong>#{profile.ID}</strong><span>identitas pengguna</span></div>}
      </div>

      <section className="account-layout">
        <aside className="account-summary">
          <span className="account-avatar">{profile?.name.trim().charAt(0).toUpperCase() || "U"}</span>
          <div className="account-summary-copy">
            <h2>{loading ? "Memuat akun..." : profile?.name}</h2>
            <p>{profile?.email}</p>
          </div>
          {profile && <span className={`role-pill${profile.role?.Name === "admin" ? " role-admin" : ""}`}><i />{profile.role?.Name ?? "Pengguna"}</span>}
          <div className="account-summary-rule" />
          <div className="account-summary-note"><Icon name="lock" size={16} /><span>Informasi akun Anda hanya dapat diperbarui melalui sesi login yang aktif.</span></div>
        </aside>

        <section className="data-panel account-form-panel">
          <div className="panel-toolbar"><div><h2>Informasi pribadi</h2><p>Perubahan hanya diterapkan ke akun yang sedang masuk.</p></div><span className="tag-count-pill">ID / {session?.userId}</span></div>
          {error && <div className="notice notice-error" role="alert"><Icon name="warning" />{error}<button type="button" onClick={() => { setLoading(true); void loadProfile(); }}>Muat ulang</button></div>}
          {success && <div className="notice notice-success" role="status"><Icon name="check" />{success}</div>}
          {loading && !profile ? <div className="panel-state"><span className="spinner" /> Memuat profil...</div> : profile && (
            <form className="modal-form account-form" onSubmit={saveProfile}>
              <label>Nama lengkap<input value={name} onChange={(event) => { setName(event.target.value); setSuccess(""); }} autoComplete="name" required /></label>
              <label>Alamat email<input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSuccess(""); }} autoComplete="email" required /></label>
              <label>Kata sandi baru <span className="label-optional">opsional</span><input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setSuccess(""); }} autoComplete="new-password" placeholder="Kosongkan jika tidak ingin mengganti" /></label>
              <p className="field-note">Kata sandi baru perlu memuat huruf besar, huruf kecil, angka, dan simbol (8–71 byte).</p>
              <div className="account-form-footer"><span>Peran: <strong>{profile.role?.Name ?? "Tidak diketahui"}</strong> · hanya admin yang dapat mengubahnya.</span><button className="button button-dark" type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan perubahan"} {!saving && <Icon name="arrow" size={16} />}</button></div>
            </form>
          )}
        </section>
      </section>
    </>
  );
}
