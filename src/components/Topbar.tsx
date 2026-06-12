import { Download, LogOut, Plus, Search, UserCircle } from "lucide-react";
import type { PageKey } from "@/components/Sidebar";
import type { SessionUser } from "@/lib/access-control";
import { roleLabels } from "@/data/options";
import type { SgaItemDTO, SparepartDTO, UsedGoodsDTO } from "@/lib/types";
import type { ReactNode } from "react";

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

export type GlobalSearchResults = {
  spareparts: SparepartDTO[];
  usedGoods: UsedGoodsDTO[];
  sgaItems: SgaItemDTO[];
};

export type GlobalSearchKind = keyof GlobalSearchResults;

export function Topbar({
  activePage,
  query,
  results,
  onQueryChange,
  onSubmitSearch,
  onSelectSearchResult,
  onExport,
  onAdd,
  onLogout,
  currentUser,
  canExport
}: {
  activePage: PageKey;
  query: string;
  results: GlobalSearchResults;
  onQueryChange: (value: string) => void;
  onSubmitSearch: () => void;
  onSelectSearchResult: (kind: GlobalSearchKind, id: string) => void;
  onExport: () => void;
  onAdd: () => void;
  onLogout: () => void;
  currentUser: SessionUser;
  canExport: boolean;
}) {
  const title = getPageTitle(activePage);
  const trimmedQuery = query.trim();
  const totalResults = results.spareparts.length + results.usedGoods.length + results.sgaItems.length;

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
        <input placeholder="Cari sparepart, barang bekas, atau SGA..." value={query} onChange={(event) => onQueryChange(event.target.value)} />
        {trimmedQuery ? (
          <div className="global-search-panel">
            <div className="global-search-title">Hasil pencarian &quot;{trimmedQuery}&quot;</div>
            {totalResults ? (
              <>
                <SearchGroup title="Sparepart" empty={!results.spareparts.length}>
                  {results.spareparts.map((item) => (
                    <button className="search-result-item" type="button" key={item.id} onClick={() => onSelectSearchResult("spareparts", item.id)}>
                      <strong>{item.name}</strong>
                      <span>{item.pjpp} · {item.branchName} · {item.plateNumber}</span>
                    </button>
                  ))}
                </SearchGroup>
                <SearchGroup title="Barang Bekas" empty={!results.usedGoods.length}>
                  {results.usedGoods.map((item) => (
                    <button className="search-result-item" type="button" key={item.id} onClick={() => onSelectSearchResult("usedGoods", item.id)}>
                      <strong>{item.name}</strong>
                      <span>{item.code} · {item.branchName} · {item.qty} {item.unitLabel}{item.pic ? ` · ${item.pic}` : ""}</span>
                    </button>
                  ))}
                </SearchGroup>
                <SearchGroup title="SGA" empty={!results.sgaItems.length}>
                  {results.sgaItems.map((item) => (
                    <button className="search-result-item" type="button" key={item.id} onClick={() => onSelectSearchResult("sgaItems", item.id)}>
                      <strong>{item.itemName}</strong>
                      <span>{item.tlsNumber} · {item.branchName} · {item.quantity} barang · {item.picName} · {item.eligibilityStatusLabel} · {item.transactionStatusLabel}</span>
                    </button>
                  ))}
                </SearchGroup>
              </>
            ) : (
              <div className="global-search-empty">Tidak ada hasil untuk pencarian ini.</div>
            )}
          </div>
        ) : null}
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

function SearchGroup({
  title,
  empty,
  children
}: {
  title: string;
  empty: boolean;
  children: ReactNode;
}) {
  return (
    <div className="search-result-group">
      <div className="search-result-heading">{title}</div>
      {empty ? <div className="search-result-empty">Tidak ada hasil</div> : children}
    </div>
  );
}
