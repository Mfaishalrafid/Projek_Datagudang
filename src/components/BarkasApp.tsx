"use client";

import {
  createSaleOrder,
  createSparepart,
  deleteSparepart,
  updateSaleOrderStatus,
  updateSparepart
} from "@/app/actions";
import { Badge, branchTone } from "@/components/Badge";
import { DataTable, type Column } from "@/components/DataTable";
import { Drawer } from "@/components/Drawer";
import { FilterBar, type FilterState } from "@/components/FilterBar";
import { Modal } from "@/components/Modal";
import { ProgressBar, ProgressRow } from "@/components/ProgressBar";
import { Sidebar, type PageKey } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { ToastStack, type ToastItem } from "@/components/Toast";
import { Topbar } from "@/components/Topbar";
import {
  buyerTypeOptions,
  categoryOptions,
  conditionOptions,
  saleStatusLabels,
  vehicleCodeOptions,
  vehicleTypeByCode,
  vehicleTypeLabels
} from "@/data/options";
import { buildSparepartCsv, downloadCsv } from "@/lib/csv";
import { formatCurrency, formatDate, formatDateInput, groupBy, pct } from "@/lib/format";
import type { BranchDTO, DashboardStats, InitialData, SaleOrderDTO, SparepartDTO } from "@/lib/types";
import { saleOrderInputSchema, sparepartInputSchema, sparepartUpdateSchema } from "@/lib/validations";
import type { BuyerType, Category, Condition, SaleStatus, VehicleCode, VehicleType } from "@prisma/client";
import {
  Building2,
  CheckCircle2,
  Download,
  FileBarChart,
  Package,
  Plus,
  Printer,
  ShoppingCart,
  Trash2,
  Truck,
  X
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";

type SparepartForm = {
  pjpp: string;
  branchId: string;
  removedDate: string;
  name: string;
  category: Category;
  plateNumber: string;
  vehicleCode: VehicleCode;
  vehicleType: VehicleType;
  condition: Condition;
  storageLocation: string;
  notes: string;
};

type SaleForm = {
  sparepartId: string;
  buyerName: string;
  buyerType: BuyerType;
  price: string;
  saleDate: string;
};

const blankFilters: FilterState = {
  query: "",
  condition: "",
  category: "",
  branchId: "",
  vehicleType: ""
};

const blankPartForm: SparepartForm = {
  pjpp: "",
  branchId: "",
  removedDate: "",
  name: "",
  category: "BAN",
  plateNumber: "",
  vehicleCode: "CDE",
  vehicleType: "ENGKEL",
  condition: "LAYAK_JUAL",
  storageLocation: "",
  notes: ""
};

const blankSaleForm: SaleForm = {
  sparepartId: "",
  buyerName: "",
  buyerType: "PELANGGAN_UMUM",
  price: "",
  saleDate: new Date().toISOString().slice(0, 10)
};

const chartColors = ["var(--blue)", "var(--teal)", "var(--amber2)", "var(--red2)", "var(--purple)", "var(--orange)", "var(--green)"];

export function BarkasApp({ initialData }: { initialData: InitialData }) {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [branches] = useState<BranchDTO[]>(initialData.branches);
  const [spareparts, setSpareparts] = useState<SparepartDTO[]>(initialData.spareparts);
  const [saleOrders, setSaleOrders] = useState<SaleOrderDTO[]>(initialData.saleOrders);
  const [filters, setFilters] = useState<FilterState>(blankFilters);
  const [globalQuery, setGlobalQuery] = useState("");
  const [selectedPart, setSelectedPart] = useState<SparepartDTO | null>(null);
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparepartDTO | null>(null);
  const [partForm, setPartForm] = useState<SparepartForm>(blankPartForm);
  const [saleForm, setSaleForm] = useState<SaleForm>(blankSaleForm);
  const [formError, setFormError] = useState("");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isPending, startTransition] = useTransition();

  const sortedSpareparts = useMemo(() => sortSpareparts(spareparts), [spareparts]);
  const stats = useMemo(() => computeStats(spareparts, branches), [spareparts, branches]);
  const saleable = useMemo(() => sortedSpareparts.filter((part) => part.condition === "LAYAK_JUAL"), [sortedSpareparts]);
  const filteredSpareparts = useMemo(() => filterSpareparts(sortedSpareparts, filters), [sortedSpareparts, filters]);
  const selectedSalePart = useMemo(
    () => spareparts.find((part) => part.id === saleForm.sparepartId) || null,
    [saleForm.sparepartId, spareparts]
  );

  function pushToast(message: string, type: ToastItem["type"] = "success") {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3200);
  }

  function openCreatePart() {
    setEditingPart(null);
    setPartForm(blankPartForm);
    setFormError("");
    setPartModalOpen(true);
  }

  function openEditPart(part: SparepartDTO) {
    setEditingPart(part);
    setPartForm({
      pjpp: part.pjpp,
      branchId: part.branchId,
      removedDate: formatDateInput(part.removedDate),
      name: part.name,
      category: part.category,
      plateNumber: part.plateNumber,
      vehicleCode: part.vehicleCode,
      vehicleType: part.vehicleType,
      condition: part.condition,
      storageLocation: part.storageLocation,
      notes: part.notes || ""
    });
    setSelectedPart(null);
    setFormError("");
    setPartModalOpen(true);
  }

  function openSale(part?: SparepartDTO) {
    const target = part || saleable[0] || null;
    setSaleForm({
      ...blankSaleForm,
      sparepartId: target?.id || ""
    });
    setSelectedPart(null);
    setFormError("");
    setSaleModalOpen(true);
  }

  function submitGlobalSearch() {
    const query = globalQuery.trim();
    if (!query) return;

    const count = filterSpareparts(sortedSpareparts, { ...blankFilters, query }).length;
    setFilters({ ...blankFilters, query });
    setActivePage("pendataan");
    pushToast(`${count} hasil untuk "${query}" dibuka di Pendataan`, "info");
  }

  async function handleExport() {
    try {
      const response = await fetch("/api/export", { cache: "no-store" });
      if (!response.ok) throw new Error("Export server gagal.");
      const csv = await response.text();
      downloadCsv(csv, "BARKAS+_Indopaket_2026.csv");
      pushToast("Export CSV berhasil.");
    } catch {
      downloadCsv(buildSparepartCsv(sortedSpareparts), "BARKAS+_Indopaket_2026.csv");
      pushToast("Export CSV memakai data layar saat ini.", "info");
    }
  }

  function handlePartSubmit() {
    const payload = {
      ...partForm,
      plateNumber: partForm.plateNumber.toUpperCase(),
      storageLocation: partForm.storageLocation || undefined,
      notes: partForm.notes || undefined
    };

    const validation = editingPart
      ? sparepartUpdateSchema.safeParse({ ...payload, id: editingPart.id })
      : sparepartInputSchema.safeParse(payload);

    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || "Data belum valid.");
      return;
    }

    setFormError("");
    startTransition(() => {
      void (async () => {
        try {
          if (editingPart) {
            const saved = await updateSparepart(editingPart.id, { ...payload, id: editingPart.id });
            setSpareparts((items) => items.map((item) => (item.id === saved.id ? saved : item)));
            pushToast(`"${saved.name}" berhasil diperbarui.`);
          } else {
            const saved = await createSparepart(payload);
            setSpareparts((items) => [saved, ...items]);
            pushToast(`"${saved.name}" berhasil ditambahkan.`);
          }
          setPartModalOpen(false);
          setEditingPart(null);
        } catch (error) {
          pushToast(error instanceof Error ? error.message : "Gagal menyimpan sparepart.", "error");
        }
      })();
    });
  }

  function handleDelete(part: SparepartDTO) {
    if (!window.confirm(`Hapus "${part.name}" dari database?`)) return;

    startTransition(() => {
      void (async () => {
        try {
          await deleteSparepart(part.id);
          setSpareparts((items) => items.filter((item) => item.id !== part.id));
          setSaleOrders((items) => items.filter((item) => item.sparepartId !== part.id));
          setSelectedPart(null);
          pushToast(`"${part.name}" berhasil dihapus.`, "info");
        } catch (error) {
          pushToast(error instanceof Error ? error.message : "Gagal menghapus data.", "error");
        }
      })();
    });
  }

  function handleSaleSubmit() {
    const payload = {
      sparepartId: saleForm.sparepartId,
      buyerName: saleForm.buyerName,
      buyerType: saleForm.buyerType,
      price: Number(saleForm.price),
      saleDate: saleForm.saleDate,
      status: "APPROVAL" as const
    };
    const validation = saleOrderInputSchema.safeParse(payload);

    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || "Data order belum valid.");
      return;
    }

    setFormError("");
    startTransition(() => {
      void (async () => {
        try {
          const saved = await createSaleOrder(payload);
          setSaleOrders((items) => [saved, ...items]);
          setSaleModalOpen(false);
          pushToast(`Order "${saved.sparepartName}" masuk ke pipeline approval.`);
        } catch (error) {
          pushToast(error instanceof Error ? error.message : "Gagal membuat order jual.", "error");
        }
      })();
    });
  }

  function handleOrderStatus(order: SaleOrderDTO, status: SaleStatus) {
    startTransition(() => {
      void (async () => {
        try {
          const saved = await updateSaleOrderStatus(order.id, status);
          setSaleOrders((items) => items.map((item) => (item.id === saved.id ? saved : item)));
          pushToast(`Order ditandai ${saleStatusLabels[status]}.`, status === "BATAL" ? "info" : "success");
        } catch (error) {
          pushToast(error instanceof Error ? error.message : "Gagal memperbarui order.", "error");
        }
      })();
    });
  }

  const page = (() => {
    if (activePage === "pendataan") {
      return (
        <PendataanPage
          branches={branches}
          filters={filters}
          onFiltersChange={setFilters}
          data={filteredSpareparts}
          onOpen={setSelectedPart}
          onAdd={openCreatePart}
          onSale={openSale}
          onDelete={handleDelete}
          onExport={handleExport}
        />
      );
    }
    if (activePage === "inventori") return <InventoriPage data={sortedSpareparts} stats={stats} />;
    if (activePage === "penjualan") {
      return (
        <LayakJualPage
          saleable={saleable}
          orders={saleOrders}
          stats={stats}
          onOpen={setSelectedPart}
          onSale={openSale}
          onOrderStatus={handleOrderStatus}
        />
      );
    }
    if (activePage === "cabang") return <CabangPage branches={branches} data={sortedSpareparts} onOpen={setSelectedPart} />;
    if (activePage === "laporan") return <LaporanPage data={sortedSpareparts} stats={stats} onOpen={setSelectedPart} onExport={handleExport} />;
    return <DashboardPage data={sortedSpareparts} stats={stats} onOpen={setSelectedPart} onNavigate={setActivePage} />;
  })();

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        stats={stats}
        onNavigate={setActivePage}
        onAdd={openCreatePart}
        onExport={handleExport}
        onPrint={() => window.print()}
      />
      <main className="main">
        <Topbar
          activePage={activePage}
          query={globalQuery}
          onQueryChange={setGlobalQuery}
          onSubmitSearch={submitGlobalSearch}
          onExport={handleExport}
          onAdd={openCreatePart}
        />
        <div className="content">{page}</div>
      </main>
      <Drawer
        sparepart={selectedPart}
        onClose={() => setSelectedPart(null)}
        onSale={openSale}
        onEdit={openEditPart}
        onDelete={handleDelete}
        onPrintLabel={() => pushToast("Label siap dicetak.", "success")}
      />
      <SparepartModal
        open={partModalOpen}
        editing={editingPart}
        branches={branches}
        form={partForm}
        error={formError}
        pending={isPending}
        onChange={setPartForm}
        onClose={() => setPartModalOpen(false)}
        onSubmit={handlePartSubmit}
      />
      <SaleModal
        open={saleModalOpen}
        form={saleForm}
        error={formError}
        pending={isPending}
        saleable={saleable}
        selectedPart={selectedSalePart}
        onChange={setSaleForm}
        onClose={() => setSaleModalOpen(false)}
        onSubmit={handleSaleSubmit}
      />
      <ToastStack items={toasts} />
    </div>
  );
}

function DashboardPage({
  data,
  stats,
  onOpen,
  onNavigate
}: {
  data: SparepartDTO[];
  stats: DashboardStats;
  onOpen: (part: SparepartDTO) => void;
  onNavigate: (page: PageKey) => void;
}) {
  return (
    <div className="page-stack">
      <StatsGrid stats={stats} />
      <div className="grid-2">
        <Card
          title="Semua Data Sparepart Ex-Service"
          subtitle={`${data.length} record dari ${stats.activeBranches} cabang`}
          action={
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => onNavigate("pendataan")}>
              Semua
            </button>
          }
        >
          <DataTable columns={dashboardColumns()} data={data} getRowKey={(row) => row.id} onRowClick={onOpen} />
        </Card>
        <Card title="Kondisi Sparepart" subtitle="Distribusi layak jual vs rusak">
          <ProgressRow label="LAYAK JUAL" value={stats.saleable} max={stats.total} color="var(--teal)" />
          <ProgressRow label="RUSAK" value={stats.damaged} max={stats.total} color="var(--red2)" />
          <div className="compact-panel center">
            <div className="compact-subtitle">Total Unit</div>
            <div className="compact-value">{stats.total}</div>
          </div>
        </Card>
      </div>
      <div className="grid-3">
        <ChartCard title="Per Cabang" entries={groupEntries(data, (item) => item.branchName)} color="var(--purple)" />
        <ChartCard title="Per Kategori" entries={groupEntries(data, (item) => item.categoryLabel)} />
        <ChartCard title="Per Jenis Kendaraan" entries={groupEntries(data, (item) => item.vehicleTypeLabel)} color="var(--amber2)" />
      </div>
    </div>
  );
}

function PendataanPage({
  branches,
  filters,
  onFiltersChange,
  data,
  onOpen,
  onAdd,
  onSale,
  onDelete,
  onExport
}: {
  branches: BranchDTO[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  data: SparepartDTO[];
  onOpen: (part: SparepartDTO) => void;
  onAdd: () => void;
  onSale: (part: SparepartDTO) => void;
  onDelete: (part: SparepartDTO) => void;
  onExport: () => void;
}) {
  return (
    <div className="page-stack">
      <PageHead
        title="Pendataan Sparepart Ex-Service"
        subtitle={`INDOPAKET 2026 - ${data.length} record`}
        actions={
          <>
            <button className="btn btn-ghost btn-sm" type="button" onClick={onExport}>
              <Download size={14} />
              Export CSV
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => window.print()}>
              <Printer size={14} />
              Print
            </button>
            <button className="btn btn-primary" type="button" onClick={onAdd}>
              <Plus size={15} />
              Tambah
            </button>
          </>
        }
      />
      <FilterBar value={filters} branches={branches} count={data.length} onChange={onFiltersChange} />
      <Card>
        <DataTable columns={pendataanColumns(onSale, onDelete)} data={data} getRowKey={(row) => row.id} onRowClick={onOpen} />
      </Card>
    </div>
  );
}

function InventoriPage({ data, stats }: { data: SparepartDTO[]; stats: DashboardStats }) {
  const categoryRows = groupEntries(data, (item) => item.categoryLabel);
  const branchRows = groupEntries(data, (item) => item.branchName);
  const vehicleRows = groupEntries(data, (item) => item.vehicleTypeLabel);

  return (
    <div className="page-stack">
      <PageHead title="Inventori Sparepart" subtitle="Ringkasan stok per kategori, cabang, dan kondisi" />
      <div className="stats stats-4">
        <StatCard label="Total Unit" value={stats.total} icon={Package} tone="blue" />
        <StatCard label="Layak Jual" value={stats.saleable} icon={CheckCircle2} tone="teal" />
        <StatCard label="Rusak/Scrap" value={stats.damaged} icon={X} tone="red" />
        <StatCard label="Unik Nopol" value={stats.uniquePlates} icon={Truck} tone="amber" />
      </div>
      <div className="grid-2">
        <Card title="Stok per Kategori">
          <DataTable columns={inventoryColumns()} data={categoryRows} getRowKey={(row) => row.label} />
        </Card>
        <Card title="Stok per Cabang">
          <DataTable columns={branchStockColumns()} data={branchRows} getRowKey={(row) => row.label} />
        </Card>
      </div>
      <Card title="Distribusi per Jenis Kendaraan">
        <div className="compact-grid">
          {vehicleRows.map((row) => (
            <div className="compact-panel center" key={row.label}>
              <div className="compact-title">{row.label}</div>
              <div className="compact-subtitle">{[...new Set(row.items.map((item) => item.vehicleCode))].join("/")}</div>
              <div className="compact-value">{row.total}</div>
              <div className="badge-row" style={{ justifyContent: "center" }}>
                <Badge tone="saleable">{row.saleable} layak</Badge>
                <Badge tone="damaged">{row.damaged} rusak</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function LayakJualPage({
  saleable,
  orders,
  stats,
  onOpen,
  onSale,
  onOrderStatus
}: {
  saleable: SparepartDTO[];
  orders: SaleOrderDTO[];
  stats: DashboardStats;
  onOpen: (part: SparepartDTO) => void;
  onSale: (part?: SparepartDTO) => void;
  onOrderStatus: (order: SaleOrderDTO, status: SaleStatus) => void;
}) {
  const sold = orders.filter((order) => order.status === "TERJUAL").length;

  return (
    <div className="page-stack">
      <PageHead
        title="Sparepart Layak Jual"
        subtitle="Daftar sparepart kondisi LAYAK JUAL siap dipasarkan"
        actions={
          <button className="btn btn-teal" type="button" onClick={() => onSale()}>
            <Plus size={15} />
            Buat Order Jual
          </button>
        }
      />
      <div className="stats stats-3">
        <StatCard label="Tersedia Layak Jual" value={stats.saleable} meta="unit siap dijual" icon={CheckCircle2} tone="teal" />
        <StatCard label="Order Masuk" value={orders.length} meta="total transaksi" icon={FileBarChart} tone="blue" />
        <StatCard label="Terjual" value={sold} meta="unit berhasil terjual" icon={ShoppingCart} tone="amber" />
      </div>
      <div className="grid-2">
        <Card title="Daftar Layak Jual" subtitle={`${saleable.length} unit siap ditransaksikan`}>
          <DataTable columns={saleableColumns(onSale)} data={saleable} getRowKey={(row) => row.id} onRowClick={onOpen} />
        </Card>
        <Card title="Pipeline Order">
          {orders.length ? (
            orders.map((order) => (
              <div className="pipeline-card" key={order.id}>
                <div className="pipeline-head">
                  <div className="pipeline-title">{order.sparepartName}</div>
                  <OrderBadge order={order} />
                </div>
                <div className="pipeline-meta">
                  {order.buyerName} - {formatDate(order.saleDate)}
                </div>
                <div className="pipeline-foot">
                  <span className="pipeline-price">{formatCurrency(order.price)}</span>
                  {order.status === "APPROVAL" ? (
                    <span className="badge-row">
                      <button className="btn btn-teal btn-xs" type="button" onClick={() => onOrderStatus(order, "TERJUAL")}>
                        Setujui
                      </button>
                      <button className="btn btn-danger btn-xs" type="button" onClick={() => onOrderStatus(order, "BATAL")}>
                        Batal
                      </button>
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-title">Belum ada order penjualan</div>
              <div className="empty-subtitle">Order baru akan tampil dengan status Approval.</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function CabangPage({
  branches,
  data,
  onOpen
}: {
  branches: BranchDTO[];
  data: SparepartDTO[];
  onOpen: (part: SparepartDTO) => void;
}) {
  return (
    <div className="page-stack">
      <PageHead title="Data per Cabang" subtitle={`${branches.length} cabang aktif - SPI Rangkasbitung, IGR Ciputat, IGR Cikokol`} />
      {branches.map((branch) => {
        const parts = data.filter((item) => item.branchId === branch.id);
        const rows = groupEntries(parts, (item) => item.categoryLabel);
        const dominant = rows[0]?.label || "-";
        return (
          <Card
            key={branch.id}
            className="branch-card"
            title={branch.name}
            subtitle={`${parts.length} unit - ${parts.filter((item) => item.condition === "LAYAK_JUAL").length} layak jual - ${
              parts.filter((item) => item.condition === "RUSAK").length
            } rusak - kategori dominan ${dominant}`}
            action={
              <div className="badge-row">
                <Badge tone="saleable">{parts.filter((item) => item.condition === "LAYAK_JUAL").length} Layak</Badge>
                <Badge tone="damaged">{parts.filter((item) => item.condition === "RUSAK").length} Rusak</Badge>
              </div>
            }
          >
            <DataTable columns={branchColumns()} data={parts} getRowKey={(row) => row.id} onRowClick={onOpen} />
            <div className="card-body branch-summary">
              <div className="branch-summary-block">
                <div className="mini-label">Kategori</div>
                <div className="badge-row">
                  {rows.map((row) => (
                    <Badge key={row.label}>{row.label}: {row.total}</Badge>
                  ))}
                </div>
              </div>
              <div className="branch-summary-block">
                <div className="mini-label">Jenis Kendaraan</div>
                <div className="badge-row">
                  {groupEntries(parts, (item) => item.vehicleTypeLabel).map((row) => (
                    <Badge key={row.label} tone="vehicle">
                      {row.label}: {row.total}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function LaporanPage({
  data,
  stats,
  onOpen,
  onExport
}: {
  data: SparepartDTO[];
  stats: DashboardStats;
  onOpen: (part: SparepartDTO) => void;
  onExport: () => void;
}) {
  const categoryRows = groupEntries(data, (item) => item.categoryLabel);
  const trend = trendEntries(data);

  return (
    <div className="page-stack">
      <PageHead
        title="Laporan & Analitik"
        subtitle="Ringkasan komprehensif pendataan sparepart ex-service INDOPAKET 2026"
        actions={
          <>
            <button className="btn btn-ghost btn-sm" type="button" onClick={onExport}>
              <Download size={14} />
              Export CSV
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => window.print()}>
              <Printer size={14} />
              Cetak
            </button>
          </>
        }
      />
      <div className="stats stats-4">
        <StatCard label="Total Sparepart" value={stats.total} icon={Package} tone="blue" />
        <StatCard label="Layak Jual" value={stats.saleable} meta={<span className="meta-up">{pct(stats.saleable, stats.total)}%</span>} icon={CheckCircle2} tone="teal" />
        <StatCard label="Rusak" value={stats.damaged} meta={<span className="meta-down">{pct(stats.damaged, stats.total)}%</span>} icon={X} tone="red" />
        <StatCard label="Unik PJPP" value={stats.uniquePjpp} icon={FileBarChart} tone="amber" />
      </div>
      <div className="grid-2">
        <Card title="Rekap per Kategori & Cabang">
          <DataTable columns={reportRekapColumns()} data={categoryRows} getRowKey={(row) => row.label} />
        </Card>
        <Card title="Tren Masuk per Bulan">
          <BarChart entries={trend} />
        </Card>
      </div>
      <Card title={`Tabel Lengkap - Semua ${data.length} Data Sparepart`} subtitle="INDOPAKET 2026">
        <DataTable columns={reportColumns()} data={data} getRowKey={(row) => row.id} onRowClick={onOpen} />
      </Card>
    </div>
  );
}

function SparepartModal({
  open,
  editing,
  branches,
  form,
  error,
  pending,
  onChange,
  onClose,
  onSubmit
}: {
  open: boolean;
  editing: SparepartDTO | null;
  branches: BranchDTO[];
  form: SparepartForm;
  error: string;
  pending: boolean;
  onChange: (form: SparepartForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  function set<K extends keyof SparepartForm>(key: K, value: SparepartForm[K]) {
    if (key === "vehicleCode") {
      const code = value as VehicleCode;
      onChange({ ...form, vehicleCode: code, vehicleType: vehicleTypeByCode[code] });
      return;
    }
    onChange({ ...form, [key]: value });
  }

  return (
    <Modal
      open={open}
      title={editing ? "Edit Sparepart Ex-Service" : "Input Sparepart Ex-Service"}
      subtitle={editing ? "Perbarui data sparepart berdasarkan PJPP" : "Tambah data sparepart baru berdasarkan PJPP"}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-primary" type="button" onClick={onSubmit} disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan Data"}
          </button>
        </>
      }
      wide
    >
      <div className="form-section">
        <div className="form-section-title">Referensi PJPP & Kendaraan</div>
        <div className="form-row two">
          <Field label="No. PJPP" required>
            <input className="form-control" value={form.pjpp} onChange={(event) => set("pjpp", event.target.value)} placeholder="Contoh: 347/PJPPU/DMS/III/2026" />
          </Field>
          <Field label="Tanggal Lepas">
            <input className="form-control" type="date" value={form.removedDate} onChange={(event) => set("removedDate", event.target.value)} />
          </Field>
        </div>
        <div className="form-row three">
          <Field label="Cabang" required>
            <select className="form-control" value={form.branchId} onChange={(event) => set("branchId", event.target.value)}>
              <option value="">Pilih Cabang</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nopol Kendaraan" required>
            <input className="form-control" value={form.plateNumber} onChange={(event) => set("plateNumber", event.target.value)} placeholder="B 9308 UXD" />
          </Field>
          <Field label="Kode Jenis">
            <select className="form-control" value={form.vehicleCode} onChange={(event) => set("vehicleCode", event.target.value as VehicleCode)}>
              {vehicleCodeOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="form-row two">
          <Field label="Jenis Kendaraan Lengkap">
            <input className="form-control" readOnly value={vehicleTypeLabels[form.vehicleType]} />
          </Field>
          <Field label="Lokasi Penyimpanan">
            <input className="form-control" value={form.storageLocation} onChange={(event) => set("storageLocation", event.target.value)} placeholder="Contoh: IGR CIPUTAT" />
          </Field>
        </div>
      </div>
      <div className="form-section">
        <div className="form-section-title">Data Sparepart</div>
        <div className="form-row one">
          <Field label="Nama Sparepart" required>
            <input className="form-control" value={form.name} onChange={(event) => set("name", event.target.value)} placeholder="Contoh: BAN LUAR R-15, KTB OIL FILTER" />
          </Field>
        </div>
        <div className="form-row two">
          <Field label="Kategori" required>
            <select className="form-control" value={form.category} onChange={(event) => set("category", event.target.value as Category)}>
              {categoryOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Kondisi" required>
            <select className="form-control" value={form.condition} onChange={(event) => set("condition", event.target.value as Condition)}>
              {conditionOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="form-row one">
          <Field label="Keterangan">
            <textarea className="form-control" value={form.notes} onChange={(event) => set("notes", event.target.value)} placeholder="Catatan kondisi, alasan penggantian, catatan mekanik..." />
          </Field>
        </div>
      </div>
      {error ? <div className="form-error">{error}</div> : null}
    </Modal>
  );
}

function SaleModal({
  open,
  form,
  error,
  pending,
  saleable,
  selectedPart,
  onChange,
  onClose,
  onSubmit
}: {
  open: boolean;
  form: SaleForm;
  error: string;
  pending: boolean;
  saleable: SparepartDTO[];
  selectedPart: SparepartDTO | null;
  onChange: (form: SaleForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  function set<K extends keyof SaleForm>(key: K, value: SaleForm[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <Modal
      open={open}
      title="Buat Order Penjualan"
      subtitle="Transaksi sparepart ex-service kondisi layak jual"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-teal" type="button" onClick={onSubmit} disabled={pending}>
            {pending ? "Memproses..." : "Buat Order"}
          </button>
        </>
      }
    >
      <div className="form-section">
        <div className="form-section-title">Sparepart yang Dijual</div>
        <div className="form-row one">
          <Field label="Pilih Sparepart" required>
            <select className="form-control" value={form.sparepartId} onChange={(event) => set("sparepartId", event.target.value)}>
              <option value="">Pilih sparepart layak jual</option>
              {saleable.map((part) => (
                <option key={part.id} value={part.id}>
                  {part.name} ({part.plateNumber}) - {part.branchName}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="form-row three">
          <Field label="No. PJPP Asal">
            <input className="form-control" readOnly value={selectedPart?.pjpp || ""} />
          </Field>
          <Field label="Kondisi">
            <input className="form-control" readOnly value={selectedPart?.conditionLabel || ""} />
          </Field>
          <Field label="Cabang Asal">
            <input className="form-control" readOnly value={selectedPart?.branchName || ""} />
          </Field>
        </div>
      </div>
      <div className="form-section">
        <div className="form-section-title">Data Pembeli & Transaksi</div>
        <div className="form-row two">
          <Field label="Nama Pembeli" required>
            <input className="form-control" value={form.buyerName} onChange={(event) => set("buyerName", event.target.value)} placeholder="Nama pelanggan / mitra bengkel" />
          </Field>
          <Field label="Tipe Pembeli">
            <select className="form-control" value={form.buyerType} onChange={(event) => set("buyerType", event.target.value as BuyerType)}>
              {buyerTypeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="form-row two">
          <Field label="Harga Jual (Rp)" required>
            <input className="form-control" type="number" min="0" value={form.price} onChange={(event) => set("price", event.target.value)} placeholder="0" />
          </Field>
          <Field label="Tanggal Penjualan">
            <input className="form-control" type="date" value={form.saleDate} onChange={(event) => set("saleDate", event.target.value)} />
          </Field>
        </div>
      </div>
      {error ? <div className="form-error">{error}</div> : null}
    </Modal>
  );
}

function StatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="stats stats-5">
      <StatCard label="Total Sparepart" value={stats.total} meta="unit terdaftar 2026" icon={Package} tone="blue" />
      <StatCard label="Layak Jual" value={stats.saleable} meta={<span className="meta-up">{pct(stats.saleable, stats.total)}% dari total</span>} icon={CheckCircle2} tone="teal" />
      <StatCard label="Rusak / Scrap" value={stats.damaged} meta={<span className="meta-down">{pct(stats.damaged, stats.total)}% dari total</span>} icon={X} tone="red" />
      <StatCard label="Cabang Aktif" value={stats.activeBranches} meta="lokasi" icon={Building2} tone="purple" />
      <StatCard label="Unik Nopol" value={stats.uniquePlates} meta="kendaraan" icon={Truck} tone="amber" />
    </div>
  );
}

function PageHead({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <div className="page-title">{title}</div>
        {subtitle ? <div className="page-subtitle">{subtitle}</div> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}

function Card({
  title,
  subtitle,
  action,
  children,
  className
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className ? `card ${className}` : "card"}>
      {title || subtitle || action ? (
        <div className="card-head">
          <div>
            {title ? <div className="card-title">{title}</div> : null}
            {subtitle ? <div className="card-subtitle">{subtitle}</div> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="field">
      <label>
        {label} {required ? <span>*</span> : null}
      </label>
      {children}
    </div>
  );
}

function ChartCard({
  title,
  entries,
  color
}: {
  title: string;
  entries: GroupRow[];
  color?: string;
}) {
  const max = Math.max(...entries.map((entry) => entry.total), 1);

  return (
    <Card title={title}>
      <div className="card-body">
        {entries.map((entry, index) => (
          <ProgressRow key={entry.label} label={entry.label} value={entry.total} max={max} color={color || chartColors[index % chartColors.length]} />
        ))}
      </div>
    </Card>
  );
}

function BarChart({ entries }: { entries: { label: string; value: number }[] }) {
  const max = Math.max(...entries.map((entry) => entry.value), 1);

  return (
    <div className="card-body">
      <div className="bar-chart">
        {entries.map((entry) => (
          <div className="bar-item" key={entry.label}>
            <div className="bar-value">{entry.value}</div>
            <div className="bar-fill" style={{ height: `${Math.max(4, Math.round((entry.value / max) * 85))}px` }} />
            <div className="bar-label">{entry.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConditionBadge({ part }: { part: SparepartDTO }) {
  return (
    <Badge tone={part.condition === "LAYAK_JUAL" ? "saleable" : "damaged"} dot>
      {part.conditionLabel}
    </Badge>
  );
}

function BranchBadge({ part }: { part: SparepartDTO }) {
  return <Badge tone={branchTone(part.branchName)}>{part.branchName}</Badge>;
}

function OrderBadge({ order }: { order: SaleOrderDTO }) {
  const tone = order.status === "TERJUAL" ? "sold" : order.status === "BATAL" ? "cancelled" : "approval";
  return (
    <Badge tone={tone} dot>
      {order.statusLabel}
    </Badge>
  );
}

function dashboardColumns(): Column<SparepartDTO>[] {
  return [
    { key: "pjpp", header: "No. PJPP", cell: (part) => <span className="mono-blue truncate-cell" title={part.pjpp}>{part.pjpp}</span> },
    { key: "name", header: "Sparepart", cell: (part) => <span className="td-bold">{part.name}</span> },
    { key: "plate", header: "Nopol", cell: (part) => <span className="plate-chip">{part.plateNumber}</span> },
    { key: "type", header: "Jenis", cell: (part) => <VehicleCell part={part} /> },
    { key: "condition", header: "Kondisi", cell: (part) => <ConditionBadge part={part} /> },
    { key: "branch", header: "Cabang", cell: (part) => <BranchBadge part={part} /> }
  ];
}

function pendataanColumns(onSale: (part: SparepartDTO) => void, onDelete: (part: SparepartDTO) => void): Column<SparepartDTO>[] {
  return [
    { key: "no", header: "No", cell: (_part, index) => <span className="td-muted">{index + 1}</span> },
    { key: "pjpp", header: "No. PJPP", cell: (part) => <span className="mono-blue truncate-cell" title={part.pjpp}>{part.pjpp}</span> },
    { key: "branch", header: "Cabang", cell: (part) => <BranchBadge part={part} /> },
    { key: "date", header: "Tgl Lepas", cell: (part) => <span className="td-muted">{formatDate(part.removedDate)}</span> },
    { key: "name", header: "Nama Sparepart", cell: (part) => <span className="td-bold">{part.name}</span> },
    { key: "category", header: "Kategori", cell: (part) => <Badge>{part.categoryLabel}</Badge> },
    { key: "plate", header: "Nopol", cell: (part) => <span className="plate-chip">{part.plateNumber}</span> },
    { key: "code", header: "Kode", cell: (part) => <Badge tone="vehicle">{part.vehicleCode}</Badge> },
    { key: "vehicle", header: "Jenis Kendaraan", cell: (part) => part.vehicleTypeLabel },
    { key: "condition", header: "Kondisi", cell: (part) => <ConditionBadge part={part} /> },
    { key: "storage", header: "Lokasi Simpan", cell: (part) => <span className="td-muted">{part.storageLocation}</span> },
    {
      key: "actions",
      header: "Aksi",
      cell: (part) => (
        <div className="badge-row" onClick={(event) => event.stopPropagation()}>
          {part.condition === "LAYAK_JUAL" ? (
            <button className="btn btn-teal btn-xs" type="button" onClick={() => onSale(part)}>
              Jual
            </button>
          ) : null}
          <button className="btn btn-danger btn-xs" type="button" onClick={() => onDelete(part)} title="Hapus data">
            <Trash2 size={12} />
          </button>
        </div>
      )
    }
  ];
}

function inventoryColumns(): Column<GroupRow>[] {
  return [
    { key: "category", header: "Kategori", cell: (row) => <span className="td-bold">{row.label}</span> },
    { key: "total", header: "Total", cell: (row) => <strong>{row.total}</strong> },
    { key: "saleable", header: "Layak Jual", cell: (row) => <Badge tone="saleable">{row.saleable}</Badge> },
    { key: "damaged", header: "Rusak", cell: (row) => <Badge tone="damaged">{row.damaged}</Badge> },
    {
      key: "pct",
      header: "% Layak",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 60 }}>
            <ProgressBar value={row.saleable} max={row.total} color={pct(row.saleable, row.total) >= 50 ? "var(--teal)" : "var(--red2)"} />
          </div>
          <strong style={{ fontSize: 11 }}>{pct(row.saleable, row.total)}%</strong>
        </div>
      )
    }
  ];
}

function branchStockColumns(): Column<GroupRow>[] {
  return [
    { key: "branch", header: "Cabang", cell: (row) => <Badge tone={branchTone(row.label)}>{row.label}</Badge> },
    { key: "total", header: "Total", cell: (row) => <strong>{row.total}</strong> },
    { key: "saleable", header: "Layak Jual", cell: (row) => <Badge tone="saleable">{row.saleable}</Badge> },
    { key: "damaged", header: "Rusak", cell: (row) => <Badge tone="damaged">{row.damaged}</Badge> }
  ];
}

function saleableColumns(onSale: (part: SparepartDTO) => void): Column<SparepartDTO>[] {
  return [
    { key: "pjpp", header: "No. PJPP", cell: (part) => <span className="mono-blue truncate-cell" title={part.pjpp}>{part.pjpp}</span> },
    { key: "name", header: "Sparepart", cell: (part) => <span className="td-bold">{part.name}</span> },
    { key: "category", header: "Kategori", cell: (part) => <Badge>{part.categoryLabel}</Badge> },
    { key: "plate", header: "Nopol", cell: (part) => <span className="plate-chip">{part.plateNumber}</span> },
    { key: "type", header: "Jenis", cell: (part) => <Badge tone="vehicle">{part.vehicleCode}</Badge> },
    { key: "branch", header: "Cabang", cell: (part) => <BranchBadge part={part} /> },
    {
      key: "action",
      header: "Aksi",
      cell: (part) => (
        <button className="btn btn-teal btn-xs" type="button" onClick={(event) => { event.stopPropagation(); onSale(part); }}>
          <ShoppingCart size={12} />
          Jual
        </button>
      )
    }
  ];
}

function branchColumns(): Column<SparepartDTO>[] {
  return [
    { key: "pjpp", header: "No. PJPP", cell: (part) => <span className="mono-blue truncate-cell" title={part.pjpp}>{part.pjpp}</span> },
    { key: "date", header: "Tgl Lepas", cell: (part) => <span className="td-muted">{formatDate(part.removedDate)}</span> },
    { key: "name", header: "Nama Sparepart", cell: (part) => <span className="td-bold">{part.name}</span> },
    { key: "category", header: "Kategori", cell: (part) => <Badge>{part.categoryLabel}</Badge> },
    { key: "plate", header: "Nopol", cell: (part) => <span className="plate-chip">{part.plateNumber}</span> },
    { key: "code", header: "Kode", cell: (part) => <Badge tone="vehicle">{part.vehicleCode}</Badge> },
    { key: "vehicle", header: "Jenis Kendaraan", cell: (part) => part.vehicleTypeLabel },
    { key: "condition", header: "Kondisi", cell: (part) => <ConditionBadge part={part} /> }
  ];
}

function reportRekapColumns(): Column<GroupRow>[] {
  return [
    { key: "category", header: "Kategori", cell: (row) => <span className="td-bold">{row.label}</span> },
    { key: "total", header: "Total", cell: (row) => <strong>{row.total}</strong> },
    { key: "saleable", header: "Layak Jual", cell: (row) => <Badge tone="saleable">{row.saleable}</Badge> },
    { key: "damaged", header: "Rusak", cell: (row) => <Badge tone="damaged">{row.damaged}</Badge> },
    {
      key: "pct",
      header: "% Layak",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 55 }}>
            <ProgressBar value={row.saleable} max={row.total} color={pct(row.saleable, row.total) >= 50 ? "var(--teal)" : "var(--red2)"} />
          </div>
          <strong style={{ fontSize: 11 }}>{pct(row.saleable, row.total)}%</strong>
        </div>
      )
    },
    { key: "branches", header: "Cabang", cell: (row) => <span className="td-muted">{[...new Set(row.items.map((item) => item.branchName))].join(", ")}</span> }
  ];
}

function reportColumns(): Column<SparepartDTO>[] {
  return [
    { key: "no", header: "No", cell: (_part, index) => <span className="td-muted">{index + 1}</span> },
    { key: "pjpp", header: "No. PJPP", cell: (part) => <span className="mono-blue truncate-cell" title={part.pjpp}>{part.pjpp}</span> },
    { key: "branch", header: "Cabang", cell: (part) => <BranchBadge part={part} /> },
    { key: "date", header: "Tgl Lepas", cell: (part) => <span className="td-muted">{formatDate(part.removedDate)}</span> },
    { key: "name", header: "Nama Sparepart", cell: (part) => <span className="td-bold">{part.name}</span> },
    { key: "category", header: "Kategori", cell: (part) => <Badge>{part.categoryLabel}</Badge> },
    { key: "plate", header: "Nopol", cell: (part) => <span className="plate-chip">{part.plateNumber}</span> },
    { key: "code", header: "Kode", cell: (part) => <Badge tone="vehicle">{part.vehicleCode}</Badge> },
    { key: "vehicle", header: "Jenis Kendaraan", cell: (part) => part.vehicleTypeLabel },
    { key: "condition", header: "Kondisi", cell: (part) => <ConditionBadge part={part} /> },
    { key: "storage", header: "Lokasi", cell: (part) => <span className="td-muted">{part.storageLocation}</span> }
  ];
}

function VehicleCell({ part }: { part: SparepartDTO }) {
  return (
    <span className="badge-row">
      <Badge tone="vehicle">{part.vehicleCode}</Badge>
      <span className="td-muted">{part.vehicleTypeLabel}</span>
    </span>
  );
}

type GroupRow = {
  label: string;
  total: number;
  saleable: number;
  damaged: number;
  items: SparepartDTO[];
};

function groupEntries(data: SparepartDTO[], selector: (part: SparepartDTO) => string): GroupRow[] {
  return Object.entries(groupBy(data, selector))
    .map(([label, items]) => ({
      label,
      total: items.length,
      saleable: items.filter((item) => item.condition === "LAYAK_JUAL").length,
      damaged: items.filter((item) => item.condition === "RUSAK").length,
      items
    }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
}

function trendEntries(data: SparepartDTO[]) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return Object.entries(
    data.reduce<Record<string, number>>((acc, item) => {
      const key = item.removedDate ? item.removedDate.slice(0, 7) : "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      if (key === "Unknown") return { label: "N/A", value };
      const month = Number(key.slice(5, 7)) - 1;
      return { label: monthNames[month] || key, value };
    });
}

function computeStats(data: SparepartDTO[], branches: BranchDTO[]): DashboardStats {
  return {
    total: data.length,
    saleable: data.filter((part) => part.condition === "LAYAK_JUAL").length,
    damaged: data.filter((part) => part.condition === "RUSAK").length,
    activeBranches: branches.length,
    uniquePlates: new Set(data.map((part) => part.plateNumber.trim())).size,
    uniquePjpp: new Set(data.map((part) => part.pjpp.trim())).size
  };
}

function filterSpareparts(data: SparepartDTO[], filters: FilterState) {
  const query = filters.query.trim().toLowerCase();
  return data.filter((part) => {
    if (filters.condition && part.condition !== filters.condition) return false;
    if (filters.category && part.category !== filters.category) return false;
    if (filters.branchId && part.branchId !== filters.branchId) return false;
    if (filters.vehicleType && part.vehicleType !== filters.vehicleType) return false;
    if (!query) return true;
    return (
      part.name.toLowerCase().includes(query) ||
      part.pjpp.toLowerCase().includes(query) ||
      part.plateNumber.toLowerCase().includes(query)
    );
  });
}

function sortSpareparts(data: SparepartDTO[]) {
  return [...data].sort((a, b) => {
    const aDate = a.removedDate ? Date.parse(a.removedDate) : 0;
    const bDate = b.removedDate ? Date.parse(b.removedDate) : 0;
    return bDate - aDate || a.name.localeCompare(b.name);
  });
}
