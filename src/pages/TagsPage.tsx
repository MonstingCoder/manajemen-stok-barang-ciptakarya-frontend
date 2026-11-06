import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ApiError, PAGE_SIZE, tagsApi } from "../api";
import { useAuth } from "../useAuth";
import { Icon } from "../components/Icon";
import type { InventoryTag } from "../types";

export function TagsPage() {
  const { session } = useAuth();
  const isAdmin = session?.role === "admin";
  const [tags, setTags] = useState<InventoryTag[]>([]);
  const [offset, setOffset] = useState(0);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTags = useCallback(async () => {
    try {
      const results = await tagsApi.list(offset);
      setError("");
      setTags(results);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Gagal memuat tag.");
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => { void loadTags(); }, [loadTags]);

  const createTag = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await tagsApi.create(name.trim());
      setName("");
      setLoading(true);
      setOffset(0);
      if (offset === 0) await loadTags();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Gagal menambahkan tag.");
    } finally {
      setSaving(false);
    }
  };

  const removeTag = async (tag: InventoryTag) => {
    if (!window.confirm(`Hapus tag “${tag.Name}”?`)) return;
    setError("");
    setLoading(true);
    try {
      await tagsApi.remove(tag.ID);
      if (tags.length === 1 && offset >= PAGE_SIZE) {
        setOffset(offset - PAGE_SIZE);
        return;
      }
      await loadTags();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Gagal menghapus tag.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow"><span className="eyebrow-line" /> PENGELOMPOKAN / TAG</div><h1>Kategori &amp; tag</h1><p>Gunakan tag untuk menjaga inventaris lebih mudah ditelusuri.</p></div>
        <div className="heading-count"><strong>{tags.length.toString().padStart(2, "0")}</strong><span>tag di halaman ini</span></div>
      </div>
      {error && <div className="notice notice-error" role="alert"><Icon name="warning" />{error}<button type="button" onClick={() => { setLoading(true); void loadTags(); }}>Coba lagi</button></div>}
      {isAdmin && <section className="tag-create-panel"><div className="tag-create-copy"><span className="tag-create-icon"><Icon name="tag" /></span><div><h2>Buat tag baru</h2><p>Tag yang dibuat tersedia saat mengelola detail barang.</p></div></div><form onSubmit={createTag}><input aria-label="Nama tag" value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Peralatan kantor" required /><button className="button button-dark" type="submit" disabled={saving}><Icon name="plus" size={16} />{saving ? "Menyimpan..." : "Tambah tag"}</button></form></section>}
      <section className="data-panel">
        <div className="panel-toolbar"><div><h2>Tag inventaris</h2><p>Daftar label yang tersedia pada barang.</p></div><span className="tag-count-pill">{tags.length} tag</span></div>
        {loading ? <div className="panel-state"><span className="spinner" /> Memuat tag...</div> : tags.length === 0 ? <div className="panel-state empty-state"><span className="empty-icon"><Icon name="tag" size={22} /></span><strong>Belum ada tag</strong><span>{isAdmin ? "Buat tag pertama untuk mulai mengelompokkan barang." : "Tag inventaris belum tersedia."}</span></div> : <div className="tag-grid">{tags.map((tag, index) => <article className="tag-card" key={tag.ID}><Link className="tag-card-link" aria-label={`Lihat barang dengan tag ${tag.Name}`} to="/app/tags/$tagId/items" params={{ tagId: String(tag.ID) }} search={{ name: tag.Name }}><span className={`tag-number tag-tone-${index % 4}`}>{String(offset + index + 1).padStart(2, "0")}</span><div className="tag-card-main"><strong>{tag.Name}</strong><span>ID TAG / {tag.ID.toString().padStart(4, "0")}</span></div><Icon name="chevron" size={16} className="tag-card-chevron" /></Link>{isAdmin && <button type="button" className="icon-button danger-hover" aria-label={`Hapus tag ${tag.Name}`} onClick={() => void removeTag(tag)}><Icon name="trash" size={16} /></button>}</article>)}</div>}
        <div className="panel-footer"><span>Menampilkan {tags.length ? offset + 1 : 0}–{offset + tags.length} tag</span><div className="pagination"><button type="button" disabled={offset === 0 || loading} onClick={() => { setLoading(true); setOffset(Math.max(0, offset - PAGE_SIZE)); }}>Sebelumnya</button><span>{Math.floor(offset / PAGE_SIZE) + 1}</span><button type="button" disabled={tags.length < PAGE_SIZE || loading} onClick={() => { setLoading(true); setOffset(offset + PAGE_SIZE); }}>Berikutnya</button></div></div>
      </section>
    </>
  );
}
