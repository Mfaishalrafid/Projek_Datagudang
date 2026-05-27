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
import { getSidebarMenu, isCentralRole, type SessionUser } from "@/lib/access-control";

export type PageKey =
  | "dashboard"
  | "pendataan"
  | "inventori"
  | "penjualan"
  | "barangbekas"
  | "cabang"
  | "laporan"
  | "branches"
  | "users";

const iconByKey = {
  dashboard: Home,
  pendataan: FileBarChart,
  inventori: Warehouse,
  penjualan: ShoppingCart,
  barangbekas: Archive,
  cabang: Building2,
  laporan: BarChart3,
  branches: Building2,
  users: Package
} satisfies Record<PageKey, typeof Home>;

const sectionLabels = {
  main: "Menu Utama",
  usedGoods: "Barang Bekas",
  reference: "Referensi",
  management: "Manajemen",
  tools: "Tools"
} as const;

export function Sidebar({
  activePage,
  stats,
  currentUser,
  onNavigate,
  onAdd,
  onExport,
  onPrint
}: {
  activePage: PageKey;
  stats: DashboardStats;
  currentUser: SessionUser;
  onNavigate: (page: PageKey) => void;
  onAdd: () => void;
  onExport: () => void;
  onPrint: () => void;
}) {
  const menu = getSidebarMenu(currentUser);
  const canExport = currentUser.role !== "KARYAWAN_CABANG";

  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="brand-logo-box">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo-img" src="/brand/indopaket_nobackground.svg" alt="INDOPAKET" />
        </div>
        <div>
          <div className="sb-name">BARKAS+</div>
          <div className="sb-version">Multi-Branch v4</div>
        </div>
      </div>
      <div className="sb-org">
        <div className="sb-org-name">INDOPAKET</div>
        <div className="sb-org-sub">{isCentralRole(currentUser.role) ? "Dashboard Pusat" : currentUser.branchName || "Dashboard Cabang"}</div>
      </div>
      <nav className="sb-nav">
        {(["main", "usedGoods", "reference", "management"] as const).map((section) => {
          const items = menu.filter((item) => item.section === section);
          if (!items.length) return null;

          return (
            <div key={section}>
              <div className="sb-section">{sectionLabels[section]}</div>
              {items.map((item) => (
                <SidebarItem
                  key={item.key}
                  active={activePage === item.key}
                  label={item.label}
                  icon={iconByKey[item.key as PageKey]}
                  badge={
                    item.key === "dashboard" || item.key === "pendataan"
                      ? stats.total
                      : item.key === "penjualan"
                        ? stats.saleable
                        : item.key === "barangbekas"
                          ? stats.usedGoods.total
                          : undefined
                  }
                  onClick={() => onNavigate(item.key as PageKey)}
                />
              ))}
            </div>
          );
        })}
        <div className="sb-section">Tools</div>
        {!isCentralRole(currentUser.role) ? <SidebarTool label="Input Barang Baru" icon={Plus} onClick={onAdd} /> : null}
        {canExport ? <SidebarTool label="Export CSV" icon={Download} onClick={onExport} /> : null}
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
        <div className="sb-footnote">{currentUser.name} - {currentUser.role.replaceAll("_", " ")}</div>
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
