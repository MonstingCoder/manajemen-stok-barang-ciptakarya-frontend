import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ApiError, itemsApi, PAGE_SIZE, tagsApi } from "../api";
import { useAuth } from "../useAuth";
import { Icon } from "../components/Icon";
import type { InventoryItem, InventoryTag, ItemInput } from "../types";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const emptyForm = {
  name: "",
  price: "",
  quantity: "",
  description: "",
  tagIds: [] as number[],
};

export function InventoryPage() {
  const { session } = useAuth();
  const isAdmin = session?.role === "admin";
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [tags, setTags] = useState<InventoryTag[]>([]);
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadData = useCallback(async () => {
    try {
      const [itemList, tagList] = await Promise.all([
        query ? itemsApi.findByName(query) : itemsApi.list(offset),
        tagsApi.list(0),
      ]);
      setError("");
      setItems(itemList);
      setTags(tagList);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Gagal memuat inventaris.");
    } finally {
      setLoading(false);
    }
  }, [offset, query]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const lowStockCount = useMemo(
    () => items.filter((item) => item.Quantity < 10).length,
    [items],
  );
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };
  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setForm({
      name: item.Name,
      price: String(item.Price),
      quantity: String(item.Quantity),
      description: item.Description,
      tagIds: (item.Tags ?? []).map((tag) => tag.ID),
    });
    setFormError("");
    setModalOpen(true);
  };
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = searchText.trim();
    setLoading(true);
    if (nextQuery === query && offset === 0) {
      void loadData();
      return;
    }
    setOffset(0);
    setQuery(nextQuery);
  };
  const clearSearch = () => {
    setSearchText("");
    if (!query) return;
    setLoading(true);
    setQuery("");
    setOffset(0);
  };
  const saveItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSaving(true);
    const input: ItemInput = {
      name: form.name.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
      description: form.description.trim(),
      tags: tags
        .filter((tag) => form.tagIds.includes(tag.ID))
        .map((tag) => ({ id: tag.ID, name: tag.Name })),
    };
    try {
      if (editing) await itemsApi.update(editing.ID, input);
      else await itemsApi.create(input);
      setModalOpen(false);
      if (query) {
        setQuery("");
        setSearchText("");
        setOffset(0);
        setLoading(true);
      } else {
        setLoading(true);
        await loadData();
      }
    } catch (reason) {
      setFormError(reason instanceof ApiError ? reason.message : "Gagal menyimpan barang.");
    } finally {
      setSaving(false);
    }
  };
  const removeItem = async (item: InventoryItem) => {
    if (!window.confirm(`Hapus barang “${item.Name}”? Tindakan ini tidak dapat dibatalkan.`)) return;
    setError("");
    setLoading(true);
    try {
      await itemsApi.remove(item.ID);
      if (!query && items.length === 1 && offset >= PAGE_SIZE) {
        setOffset(offset - PAGE_SIZE);
        return;
      }
      await loadData();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Gagal menghapus barang.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow"><span className="eyebrow-line" /> OPERASIONAL / INVENTARIS</div><h1>Inventaris barang</h1><p>Pantau ketersediaan dan kelola detail barang operasional.</p></div>
        {isAdmin && <button type="button" className="button button-dark" onClick={openCreate}><Icon name="plus" size={17} /> Tambah barang</button>}
      </div>

      <section className="summary-grid">
        <article className="summary-card"><span className="summary-icon"><Icon name="box" /></span><div><span>Barang di halaman</span><strong>{loading ? "—" : items.length.toString().padStart(2, "0")}</strong><small>daftar saat ini</small></div></article>
        <article className="summary-card"><span className="summary-icon summary-icon-warn"><Icon name="warning" /></span><div><span>Stok menipis</span><strong>{loading ? "—" : lowStockCount.toString().padStart(2, "0")}</strong><small>kurang dari 10 unit</small></div></article>
        <article className="summary-card"><span className="summary-icon summary-icon-green"><Icon name="tag" /></span><div><span>Tag di halaman</span><strong>{tags.length.toString().padStart(2, "0")}</strong><small>label inventaris</small></div></article>
      </section>

      <section className="data-panel">
        <div className="panel-toolbar">
          <div><h2>Daftar barang</h2><p>Data inventaris yang tercatat dalam sistem.</p></div>
          <form className="search-form" onSubmit={submitSearch}>
            <Icon name="search" size={17} />
            <input aria-label="Cari nama barang" placeholder="Cari nama barang..." value={searchText} onChange={(event) => setSearchText(event.target.value)} />
            {searchText && <button type="button" aria-label="Hapus pencarian" className="search-clear" onClick={clearSearch}><Icon name="close" size={15} /></button>}
            <button type="submit" className="search-submit">Cari</button>
          </form>
        </div>
        {query && <div className="search-hint">Hasil pencarian nama tepat untuk “{query}”. <button type="button" onClick={clearSearch}>Tampilkan semua</button></div>}
        {error && <div className="notice notice-error" role="alert"><Icon name="warning" />{error}<button type="button" onClick={() => { setLoading(true); void loadData(); }}>Coba lagi</button></div>}
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Nama barang</th><th>Tag</th><th>Harga</th><th>Jumlah</th><th>Deskripsi</th>{isAdmin && <th className="actions-heading">Aksi</th>}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={isAdmin ? 6 : 5}><div className="table-state"><span className="spinner" /> Memuat data inventaris...</div></td></tr>
                : items.length === 0 ? <tr><td colSpan={isAdmin ? 6 : 5}><div className="table-state empty-state"><span className="empty-icon"><Icon name="box" size={22} /></span><strong>{query ? "Barang tidak ditemukan" : "Belum ada barang"}</strong><span>{query ? "Coba nama barang lain atau tampilkan semua data." : "Inventaris belum memiliki barang."}</span>{isAdmin && !query && <button type="button" className="button button-outline" onClick={openCreate}><Icon name="plus" size={16} /> Tambah barang</button>}</div></td></tr>
                : items.map((item) => (
                  <tr key={item.ID}>
                    <td><div className="item-cell"><span className="item-avatar">{item.Name.trim().charAt(0).toUpperCase() || "B"}</span><div><strong>{item.Name}</strong><small>ID #{item.ID}</small></div></div></td>
                    <td><div className="tag-list">{(item.Tags ?? []).length ? item.Tags?.map((tag) => <Link className="tag-chip tag-chip-link" key={tag.ID} to="/app/tags/$tagId/items" params={{ tagId: String(tag.ID) }} search={{ name: tag.Name }}>{tag.Name}</Link>) : <span className="muted">—</span>}</div></td>
                    <td className="money-cell">{currency.format(item.Price)}</td>
                    <td><span className={`stock-badge${item.Quantity < 10 ? " stock-low" : ""}`}><i />{item.Quantity} unit</span></td>
                    <td className="description-cell">{item.Description || <span className="muted">Tidak ada deskripsi</span>}</td>
                    {isAdmin && <td><div className="row-actions"><button type="button" className="icon-button" aria-label={`Ubah ${item.Name}`} title="Ubah barang" onClick={() => openEdit(item)}><Icon name="edit" size={16} /></button><button type="button" className="icon-button danger-hover" aria-label={`Hapus ${item.Name}`} title="Hapus barang" onClick={() => void removeItem(item)}><Icon name="trash" size={16} /></button></div></td>}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="panel-footer">
          <span>{query ? `${items.length} hasil pencarian` : `Menampilkan ${items.length ? offset + 1 : 0}–${offset + items.length} barang`}</span>
          {!query && <div className="pagination"><button type="button" disabled={offset === 0 || loading} onClick={() => { setLoading(true); setOffset(Math.max(0, offset - PAGE_SIZE)); }}>Sebelumnya</button><span>{Math.floor(offset / PAGE_SIZE) + 1}</span><button type="button" disabled={items.length < PAGE_SIZE || loading} onClick={() => { setLoading(true); setOffset(offset + PAGE_SIZE); }}>Berikutnya</button></div>}
        </div>
      </section>

      {isAdmin && modalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
        <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="item-form-title">
          <div className="modal-header"><div><div className="eyebrow"><span className="eyebrow-line" /> DETAIL INVENTARIS</div><h2 id="item-form-title">{editing ? "Ubah barang" : "Tambah barang"}</h2></div><button type="button" className="icon-button" aria-label="Tutup" onClick={() => setModalOpen(false)}><Icon name="close" /></button></div>
          <form onSubmit={saveItem} className="modal-form">
            <label>Nama barang<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Laptop kantor" required autoFocus /></label>
            <div className="form-grid"><label>Harga (Rp)<input type="number" min="0" step="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="0" required /></label><label>Jumlah stok<input type="number" min="0" step="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="0" required /></label></div>
            <label>Deskripsi<textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Tambahkan keterangan barang (opsional)" /></label>
            <fieldset className="tag-fieldset"><legend>Tag barang</legend>{tags.length ? <div className="checkbox-tags">{tags.map((tag) => <label key={tag.ID}><input type="checkbox" checked={form.tagIds.includes(tag.ID)} onChange={(event) => setForm({ ...form, tagIds: event.target.checked ? [...form.tagIds, tag.ID] : form.tagIds.filter((id) => id !== tag.ID) })} /><span>{tag.Name}</span></label>)}</div> : <p className="muted">Belum ada tag. Anda tetap dapat menyimpan barang tanpa tag.</p>}</fieldset>
            {formError && <div className="form-error" role="alert">{formError}</div>}
            <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setModalOpen(false)}>Batal</button><button type="submit" className="button button-dark" disabled={saving}>{saving ? "Menyimpan..." : editing ? "Simpan perubahan" : "Simpan barang"}</button></div>
          </form>
        </section>
      </div>}
    </>
  );
}
