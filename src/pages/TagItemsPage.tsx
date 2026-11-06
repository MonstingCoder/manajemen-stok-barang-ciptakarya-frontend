import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import { ApiError, itemsApi, PAGE_SIZE } from "../api";
import { Icon } from "../components/Icon";
import type { InventoryItem } from "../types";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function TagItemsPage() {
  const { tagId: rawTagId } = useParams({ from: "/app/tags/$tagId/items" });
  const { name: tagName } = useSearch({ from: "/app/tags/$tagId/items" });
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    if (!tagName) {
      setError("Nama tag pada alamat halaman tidak tersedia.");
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const results = await itemsApi.listByTag(tagName, offset);
      setItems(results);
      setError("");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Gagal memuat barang dengan tag ini.");
    } finally {
      setLoading(false);
    }
  }, [offset, tagName]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const changePage = (nextOffset: number) => {
    setLoading(true);
    setOffset(nextOffset);
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> INVENTARIS / FILTER TAG</div>
          <h1>{tagName || `Barang dengan tag #${rawTagId}`}</h1>
          <p>Daftar barang yang terhubung dengan tag ini.</p>
        </div>
        <Link to="/app/tags" className="button button-outline"><Icon name="chevron" size={16} className="back-icon" /> Kembali ke tag</Link>
      </div>

      {error && <div className="notice notice-error" role="alert"><Icon name="warning" />{error}<button type="button" onClick={() => { setLoading(true); void loadItems(); }}>Coba lagi</button></div>}

      <section className="data-panel">
        <div className="panel-toolbar">
          <div><h2>Barang bertag {tagName ? `“${tagName}”` : `#${rawTagId}`}</h2><p>Hasil dimuat dari relasi inventaris di server.</p></div>
          <span className="tag-count-pill">{loading ? "…" : `${items.length} barang`}</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Nama barang</th><th>Tag</th><th>Harga</th><th>Jumlah</th><th>Deskripsi</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5}><div className="table-state"><span className="spinner" /> Memuat barang...</div></td></tr>
                : items.length === 0 ? <tr><td colSpan={5}><div className="table-state empty-state"><span className="empty-icon"><Icon name="tag" size={22} /></span><strong>Belum ada barang dengan tag ini</strong><span>Tag tetap tersedia, tetapi belum dipasangkan ke barang.</span></div></td></tr>
                  : items.map((item) => (
                    <tr key={item.ID}>
                      <td><div className="item-cell"><span className="item-avatar">{item.Name.trim().charAt(0).toUpperCase() || "B"}</span><div><strong>{item.Name}</strong><small>ID #{item.ID}</small></div></div></td>
                      <td><div className="tag-list">{(item.Tags ?? []).map((tag) => <Link className="tag-chip tag-chip-link" key={tag.ID} to="/app/tags/$tagId/items" params={{ tagId: String(tag.ID) }} search={{ name: tag.Name }}>{tag.Name}</Link>)}</div></td>
                      <td className="money-cell">{currency.format(item.Price)}</td>
                      <td><span className={`stock-badge${item.Quantity < 10 ? " stock-low" : ""}`}><i />{item.Quantity} unit</span></td>
                      <td className="description-cell">{item.Description || <span className="muted">Tidak ada deskripsi</span>}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <div className="panel-footer">
          <span>Menampilkan {items.length ? offset + 1 : 0}–{offset + items.length} barang</span>
          <div className="pagination">
            <button type="button" disabled={offset === 0 || loading} onClick={() => changePage(Math.max(0, offset - PAGE_SIZE))}>Sebelumnya</button>
            <span>{Math.floor(offset / PAGE_SIZE) + 1}</span>
            <button type="button" disabled={items.length < PAGE_SIZE || loading} onClick={() => changePage(offset + PAGE_SIZE)}>Berikutnya</button>
          </div>
        </div>
      </section>
    </>
  );
}
