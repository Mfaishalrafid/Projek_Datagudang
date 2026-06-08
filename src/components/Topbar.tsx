import { Download, LogOut, Plus, Search, UserCircle } from "lucide-react";
import type { PageKey } from "@/components/Sidebar";
import type { SessionUser } from "@/lib/access-control";
import { roleLabels } from "@/data/options";

const pageNames: Record<PageKey, string> = {
  dashboard: "Dashboard",
  pendataan: "Pendataan Sparepart",
  inventori: "Inventori & Stok",
  penjualan: "Layak Jual",
  barangbekas: "Pendataan Barang Bekas",
  sga: "Pendataan SGA",
  cabang: "Data per Cabang",
  laporan: "Laporan & Analitik",
  branches: "Manajemen Cabang",
  users: "Manajemen User"
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
  onAdd,
  onLogout,
  currentUser,
  canExport
}: {
  activePage: PageKey;
  query: string;
  onQueryChange: (value: string) => void;
  onSubmitSearch: () => void;
  onExport: () => void;
  onAdd: () => void;
  onLogout: () => void;
  currentUser: SessionUser;
  canExport: boolean;
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
        <input placeholder="Cari sparepart / barang bekas / SGA..." value={query} onChange={(event) => onQueryChange(event.target.value)} />
      </form>
      {canExport ? <button className="btn btn-ghost btn-sm" onClick={onExport} type="button">
        <Download size={14} />
        CSV
      </button> : null}
      <button className="btn btn-primary" onClick={onAdd} type="button">
        <Plus size={15} />
        Input Barang
      </button>
      <div className="user-chip">
        <UserCircle size={16} />
        <span>{currentUser.name}</span>
        <strong>{roleLabels[currentUser.role]}</strong>
      </div>
      <button className="icon-button" onClick={onLogout} type="button" title="Logout">
        <LogOut size={16} />
      </button>
    </header>
  );
}
