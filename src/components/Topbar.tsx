import { Download, Plus, Search } from "lucide-react";
import type { PageKey } from "@/components/Sidebar";

const pageNames: Record<PageKey, string> = {
  dashboard: "Dashboard",
  pendataan: "Pendataan Sparepart",
  inventori: "Inventori & Stok",
  penjualan: "Sparepart Layak Jual",
  barangbekas: "Pendataan Barang Bekas",
  cabang: "Data per Cabang",
  laporan: "Laporan & Analitik"
};

export function getPageTitle(page: PageKey) {
  return pageNames[page];
}

export function Topbar({
  activePage,
  query,
  onQueryChange,
  onSubmitSearch,
  onExport,
  onAdd
}: {
  activePage: PageKey;
  query: string;
  onQueryChange: (value: string) => void;
  onSubmitSearch: () => void;
  onExport: () => void;
  onAdd: () => void;
}) {
  const title = getPageTitle(activePage);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1>{title}</h1>
        <div>BARKAS+ / Indopaket 2026 / {title}</div>
      </div>
      <form
        className="search-box"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmitSearch();
        }}
      >
        <Search size={15} />
        <input placeholder="Cari sparepart / barang bekas..." value={query} onChange={(event) => onQueryChange(event.target.value)} />
      </form>
      <button className="btn btn-ghost btn-sm" onClick={onExport} type="button">
        <Download size={14} />
        CSV
      </button>
      <button className="btn btn-primary" onClick={onAdd} type="button">
        <Plus size={15} />
        Input Barang
      </button>
    </header>
  );
}
