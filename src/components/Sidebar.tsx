import clsx from "clsx";
import {
  BarChart3,
  Building2,
  Download,
  FileBarChart,
  Home,
  Archive,
  Package,
  Plus,
  Printer,
  ShoppingCart,
  Warehouse
} from "lucide-react";
import type { DashboardStats } from "@/lib/types";

export type PageKey =
  | "dashboard"
  | "pendataan"
  | "inventori"
  | "penjualan"
  | "barangbekas"
  | "cabang"
  | "laporan";

const mainItems = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "pendataan", label: "Pendataan Sparepart", icon: FileBarChart },
  { key: "inventori", label: "Inventori & Stok", icon: Warehouse },
  { key: "penjualan", label: "Layak Jual", icon: ShoppingCart }
] as const;

const referenceItems = [
  { key: "cabang", label: "Data per Cabang", icon: Building2 },
  { key: "laporan", label: "Laporan", icon: BarChart3 }
] as const;

export function Sidebar({
  activePage,
  stats,
  onNavigate,
  onAdd,
  onExport,
  onPrint
}: {
  activePage: PageKey;
  stats: DashboardStats;
  onNavigate: (page: PageKey) => void;
  onAdd: () => void;
  onExport: () => void;
  onPrint: () => void;
}) {
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-mark">B+</div>
        <div>
          <div className="sb-name">BARKAS+</div>
          <div className="sb-version">Ex-Service & Material v3</div>
        </div>
      </div>
      <div className="sb-org">
        <div className="sb-org-name">INDOPAKET</div>
        <div className="sb-org-sub">Sparepart & Barang Bekas 2026</div>
      </div>
      <nav className="sb-nav">
        <div className="sb-section">Menu Utama</div>
        {mainItems.map((item) => (
          <SidebarItem
            key={item.key}
            active={activePage === item.key}
            label={item.label}
            icon={item.icon}
            badge={item.key === "dashboard" || item.key === "pendataan" ? stats.total : item.key === "penjualan" ? stats.saleable : undefined}
            onClick={() => onNavigate(item.key)}
          />
        ))}
        <div className="sb-section">Barang Bekas</div>
        <SidebarItem
          active={activePage === "barangbekas"}
          label="Pendataan Barang Bekas"
          icon={Archive}
          badge={stats.usedGoods.total}
          onClick={() => onNavigate("barangbekas")}
        />
        <div className="sb-section">Referensi</div>
        {referenceItems.map((item) => (
          <SidebarItem key={item.key} active={activePage === item.key} label={item.label} icon={item.icon} onClick={() => onNavigate(item.key)} />
        ))}
        <div className="sb-section">Tools</div>
        <SidebarTool label="Input Barang Baru" icon={Plus} onClick={onAdd} />
        <SidebarTool label="Export CSV" icon={Download} onClick={onExport} />
        <SidebarTool label="Cetak Laporan" icon={Printer} onClick={onPrint} />
      </nav>
      <div className="sb-bottom">
        <div className="sb-stats">
          <div className="sb-stat-card">
            <strong>{stats.total}</strong>
            <span>Total</span>
          </div>
          <div className="sb-stat-card">
            <strong className="green">{stats.saleable}</strong>
            <span>Layak</span>
          </div>
          <div className="sb-stat-card">
            <strong className="red">{stats.damaged}</strong>
            <span>Rusak</span>
          </div>
        </div>
        <div className="sb-footnote">Data diimpor dari Excel - 30 sparepart + barang bekas</div>
      </div>
    </aside>
  );
}

function SidebarItem({
  active,
  label,
  icon: Icon,
  badge,
  onClick
}: {
  active: boolean;
  label: string;
  icon: typeof Home;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button className={clsx("nav-item", active && "active")} onClick={onClick} type="button">
      <Icon size={16} />
      <span>{label}</span>
      {badge !== undefined ? <span className="nav-badge">{badge}</span> : null}
    </button>
  );
}

function SidebarTool({
  label,
  icon: Icon,
  onClick
}: {
  label: string;
  icon: typeof Package;
  onClick: () => void;
}) {
  return (
    <button className="nav-item" onClick={onClick} type="button">
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}
