import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError, PAGE_SIZE, usersApi } from "../api";
import { Icon } from "../components/Icon";
import type { InventoryUser, UserInput } from "../types";

export function UsersPage() {
  const [users, setUsers] = useState<InventoryUser[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<InventoryUser | null>(null);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const loadUsers = useCallback(async () => {
    try {
      const results = await usersApi.list(offset);
      setError("");
      setUsers(results);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Gagal memuat pengguna.");
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const editUser = (user: InventoryUser) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: "" });
    setFormError("");
  };

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError("");
    const input: UserInput = {};
    if (form.name.trim() !== editing.name) input.name = form.name.trim();
    if (form.email.trim() !== editing.email) input.email = form.email.trim();
    if (form.password) input.password = form.password;
    if (Object.keys(input).length === 0) {
      setFormError("Tidak ada perubahan untuk disimpan.");
      setSaving(false);
      return;
    }
    try {
      await usersApi.update(editing.ID, input);
      setEditing(null);
      setLoading(true);
      await loadUsers();
    } catch (reason) {
      setFormError(reason instanceof ApiError ? reason.message : "Gagal memperbarui pengguna.");
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (user: InventoryUser) => {
    if (!window.confirm(`Hapus akses pengguna ${user.name} (${user.email})?`)) return;
    setError("");
    setLoading(true);
    try {
      await usersApi.remove(user.ID);
      if (users.length === 1 && offset >= PAGE_SIZE) {
        setOffset(offset - PAGE_SIZE);
        return;
      }
      await loadUsers();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Gagal menghapus pengguna.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow"><span className="eyebrow-line" /> PENGATURAN / AKSES</div><h1>Pengguna sistem</h1><p>Kelola identitas dan akses pengguna yang terdaftar.</p></div>
        <div className="heading-count"><strong>{users.length.toString().padStart(2, "0")}</strong><span>pengguna di halaman</span></div>
      </div>
      <div className="notice notice-info"><Icon name="users" /><span>Peran akses ditetapkan oleh backend. Halaman ini tidak mengubah peran atau membuat akun baru.</span></div>
      {error && <div className="notice notice-error" role="alert"><Icon name="warning" />{error}<button type="button" onClick={() => { setLoading(true); void loadUsers(); }}>Coba lagi</button></div>}
      <section className="data-panel">
        <div className="panel-toolbar"><div><h2>Daftar pengguna</h2><p>Informasi akun dan peran yang telah diberikan.</p></div><span className="tag-count-pill">ADMIN VIEW</span></div>
        <div className="table-scroll"><table className="data-table">
          <thead><tr><th>Pengguna</th><th>Email</th><th>Peran</th><th>ID pengguna</th><th className="actions-heading">Aksi</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan={5}><div className="table-state"><span className="spinner" /> Memuat data pengguna...</div></td></tr>
            : users.length === 0 ? <tr><td colSpan={5}><div className="table-state empty-state"><span className="empty-icon"><Icon name="users" size={22} /></span><strong>Belum ada pengguna</strong><span>Data pengguna belum tersedia dari backend.</span></div></td></tr>
              : users.map((user) => <tr key={user.ID}><td><div className="item-cell"><span className="item-avatar user-avatar-cell">{user.name.trim().charAt(0).toUpperCase() || "U"}</span><div><strong>{user.name}</strong><small>Terdaftar di sistem</small></div></div></td><td>{user.email}</td><td><span className={`role-pill${user.role?.Name === "admin" ? " role-admin" : ""}`}><i />{user.role?.Name ?? "Pengguna"}</span></td><td className="id-cell">USR / {user.ID.toString().padStart(4, "0")}</td><td><div className="row-actions"><button type="button" className="icon-button" aria-label={`Ubah ${user.name}`} title="Ubah pengguna" onClick={() => editUser(user)}><Icon name="edit" size={16} /></button><button type="button" className="icon-button danger-hover" aria-label={`Hapus ${user.name}`} title="Hapus pengguna" onClick={() => void removeUser(user)}><Icon name="trash" size={16} /></button></div></td></tr>)}</tbody>
        </table></div>
        <div className="panel-footer"><span>Menampilkan {users.length ? offset + 1 : 0}–{offset + users.length} pengguna</span><div className="pagination"><button type="button" disabled={offset === 0 || loading} onClick={() => { setLoading(true); setOffset(Math.max(0, offset - PAGE_SIZE)); }}>Sebelumnya</button><span>{Math.floor(offset / PAGE_SIZE) + 1}</span><button type="button" disabled={users.length < PAGE_SIZE || loading} onClick={() => { setLoading(true); setOffset(offset + PAGE_SIZE); }}>Berikutnya</button></div></div>
      </section>
      {editing && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
        <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="user-form-title">
          <div className="modal-header"><div><div className="eyebrow"><span className="eyebrow-line" /> AKUN PENGGUNA</div><h2 id="user-form-title">Ubah pengguna</h2></div><button type="button" className="icon-button" aria-label="Tutup" onClick={() => setEditing(null)}><Icon name="close" /></button></div>
          <form onSubmit={saveUser} className="modal-form">
            <label>Nama<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
            <label>Alamat email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
            <label>Kata sandi baru <span className="label-optional">opsional</span><input type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Kosongkan jika tidak diubah" minLength={8} /></label>
            <p className="field-note">Kata sandi harus memiliki huruf besar, huruf kecil, angka, dan simbol.</p>
            {formError && <div className="form-error" role="alert">{formError}</div>}
            <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setEditing(null)}>Batal</button><button type="submit" className="button button-dark" disabled={saving}>{saving ? "Menyimpan..." : "Simpan perubahan"}</button></div>
          </form>
        </section>
      </div>}
    </>
  );
}
