"use client";

import {
  createSaleOrder,
  createSparepart,
  createUsedGoods,
  deleteSparepart,
  deleteUsedGoods,
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
  usedGoodsCategoryOptions,
  usedGoodsConditionOptions,
  usedGoodsUnitOptions,
  vehicleCodeOptions,
  vehicleTypeByCode,
  vehicleTypeLabels
} from "@/data/options";
import { buildSparepartCsv, buildUsedGoodsCsv, downloadCsv } from "@/lib/csv";
import { formatCurrency, formatDate, formatDateInput, groupBy, pct } from "@/lib/format";
import type { BranchDTO, DashboardStats, InitialData, SaleOrderDTO, SparepartDTO, UsedGoodsDTO } from "@/lib/types";
import { calculateUsedGoodsStats } from "@/lib/used-goods-analytics";
import { saleOrderInputSchema, sparepartInputSchema, sparepartUpdateSchema, usedGoodsInputSchema } from "@/lib/validations";
import type {
  BuyerType,
  Category,
  Condition,
  SaleStatus,
  UsedGoodsCategory,
  UsedGoodsCondition,
  UsedGoodsUnit,
  VehicleCode,
  VehicleType
} from "@prisma/client";
import {
  Archive,
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

type UsedGoodsForm = {
  branchId: string;
  inputDate: string;
  name: string;
  category: UsedGoodsCategory;
  qty: string;
  unit: UsedGoodsUnit;
  estimatedWeightKg: string;
  estimatedPrice: string;
  condition: UsedGoodsCondition;
  storageLocation: string;
  pic: string;
  notes: string;
};

type UsedGoodsFilterState = {
  query: string;
  condition: "" | UsedGoodsCondition;
  category: "" | UsedGoodsCategory;
  branchId: string;
};

const blankFilters: FilterState = {
  query: "",
  condition: "",
  category: "",
  branchId: "",
  vehicleType: ""
};

const blankUsedGoodsFilters: UsedGoodsFilterState = {
  query: "",
  condition: "",
  category: "",
  branchId: ""
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

const blankUsedGoodsForm: UsedGoodsForm = {
  branchId: "",
  inputDate: new Date().toISOString().slice(0, 10),
  name: "",
  category: "KARDUS_KARTON",
  qty: "1",
  unit: "PCS",
  estimatedWeightKg: "",
  estimatedPrice: "",
  condition: "LAYAK_JUAL",
  storageLocation: "",
  pic: "",
  notes: ""
};

const chartColors = ["var(--blue)", "var(--teal)", "var(--amber2)", "var(--red2)", "var(--purple)", "var(--orange)", "var(--green)"];

export function BarkasApp({ initialData }: { initialData: InitialData }) {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [branches] = useState<BranchDTO[]>(initialData.branches);
  const [spareparts, setSpareparts] = useState<SparepartDTO[]>(initialData.spareparts);
  const [saleOrders, setSaleOrders] = useState<SaleOrderDTO[]>(initialData.saleOrders);
  const [usedGoods, setUsedGoods] = useState<UsedGoodsDTO[]>(initialData.usedGoods);
  const [filters, setFilters] = useState<FilterState>(blankFilters);
  const [usedGoodsFilters, setUsedGoodsFilters] = useState<UsedGoodsFilterState>(blankUsedGoodsFilters);
  const [globalQuery, setGlobalQuery] = useState("");
  const [selectedPart, setSelectedPart] = useState<SparepartDTO | null>(null);
  const [selectedUsedGoods, setSelectedUsedGoods] = useState<UsedGoodsDTO | null>(null);
  const [inputChooserOpen, setInputChooserOpen] = useState(false);
  const [chosenInputType, setChosenInputType] = useState<"sparepart" | "usedGoods" | null>(null);
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [usedGoodsModalOpen, setUsedGoodsModalOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparepartDTO | null>(null);
  const [partForm, setPartForm] = useState<SparepartForm>(blankPartForm);
  const [usedGoodsForm, setUsedGoodsForm] = useState<UsedGoodsForm>(blankUsedGoodsForm);
  const [saleForm, setSaleForm] = useState<SaleForm>(blankSaleForm);
  const [formError, setFormError] = useState("");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isPending, startTransition] = useTransition();

  const sortedSpareparts = useMemo(() => sortSpareparts(spareparts), [spareparts]);
  const sortedUsedGoods = useMemo(() => sortUsedGoods(usedGoods), [usedGoods]);
  const stats = useMemo(() => computeStats(spareparts, usedGoods), [spareparts, usedGoods]);
  const saleable = useMemo(() => sortedSpareparts.filter((part) => part.condition === "LAYAK_JUAL"), [sortedSpareparts]);
  const filteredSpareparts = useMemo(() => filterSpareparts(sortedSpareparts, filters), [sortedSpareparts, filters]);
  const filteredUsedGoods = useMemo(() => filterUsedGoods(sortedUsedGoods, usedGoodsFilters), [sortedUsedGoods, usedGoodsFilters]);
  const selectedSalePart = useMemo(
    () => spareparts.find((part) => part.id === saleForm.sparepartId) || null,
    [saleForm.sparepartId, spareparts]
  );

  function pushToast(message: string, type: ToastItem["type"] = "success") {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3200);
  }

  function openInputChooser() {
    setChosenInputType(null);
    setFormError("");
    setInputChooserOpen(true);
  }

  function confirmInputChooser() {
    if (chosenInputType === "sparepart") {
      setInputChooserOpen(false);
      openCreatePart();
      return;
    }
    if (chosenInputType === "usedGoods") {
      setInputChooserOpen(false);
      openCreateUsedGoods();
    }
  }

  function openCreatePart() {
    setEditingPart(null);
    setPartForm(blankPartForm);
    setFormError("");
    setPartModalOpen(true);
  }

  function openCreateUsedGoods() {
    setUsedGoodsForm(blankUsedGoodsForm);
    setFormError("");
    setUsedGoodsModalOpen(true);
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

    const sparepartCount = filterSpareparts(sortedSpareparts, { ...blankFilters, query }).length;
    const usedGoodsCount = filterUsedGoods(sortedUsedGoods, { ...blankUsedGoodsFilters, query }).length;

    if (usedGoodsCount > sparepartCount) {
      setUsedGoodsFilters({ ...blankUsedGoodsFilters, query });
      setActivePage("barangbekas");
      pushToast(`${usedGoodsCount} barang bekas untuk "${query}" dibuka di Pendataan Barang Bekas`, "info");
      return;
    }

    setFilters({ ...blankFilters, query });
    setActivePage("pendataan");
    pushToast(`${sparepartCount} sparepart + ${usedGoodsCount} barang bekas untuk "${query}"`, "info");
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

  async function handleUsedGoodsExport() {
    try {
      const response = await fetch("/api/export/used-goods", { cache: "no-store" });
      if (!response.ok) throw new Error("Export barang bekas gagal.");
      const csv = await response.text();
      downloadCsv(csv, "BARKAS+_Barang_Bekas_2026.csv");
      pushToast("Export CSV Barang Bekas berhasil.");
    } catch {
      downloadCsv(buildUsedGoodsCsv(sortedUsedGoods), "BARKAS+_Barang_Bekas_2026.csv");
      pushToast("Export CSV Barang Bekas memakai data layar saat ini.", "info");
    }
  }

  async function handleExportAll() {
    await handleExport();
    window.setTimeout(() => {
      void handleUsedGoodsExport();
    }, 250);
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

  function handleUsedGoodsSubmit() {
    const payload = {
      ...usedGoodsForm,
      qty: Number(usedGoodsForm.qty),
      estimatedWeightKg: usedGoodsForm.estimatedWeightKg === "" ? null : Number(usedGoodsForm.estimatedWeightKg),
      estimatedPrice: usedGoodsForm.estimatedPrice === "" ? null : Number(usedGoodsForm.estimatedPrice),
      storageLocation: usedGoodsForm.storageLocation || undefined,
      pic: usedGoodsForm.pic || undefined,
      notes: usedGoodsForm.notes || undefined
    };

    const validation = usedGoodsInputSchema.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || "Data barang bekas belum valid.");
      return;
    }

    setFormError("");
    startTransition(() => {
      void (async () => {
        try {
          const saved = await createUsedGoods(payload);
          setUsedGoods((items) => [saved, ...items]);
          setUsedGoodsModalOpen(false);
          pushToast(`"${saved.name}" berhasil ditambahkan.`);
        } catch (error) {
          pushToast(error instanceof Error ? error.message : "Gagal menyimpan barang bekas.", "error");
        }
      })();
    });
  }

  function handleUsedGoodsDelete(item: UsedGoodsDTO) {
    if (!window.confirm(`Hapus "${item.name}" dari database barang bekas?`)) return;

    startTransition(() => {
      void (async () => {
        try {
          await deleteUsedGoods(item.id);
          setUsedGoods((items) => items.filter((entry) => entry.id !== item.id));
          setSelectedUsedGoods(null);
          pushToast(`"${item.name}" berhasil dihapus.`, "info");
        } catch (error) {
          pushToast(error instanceof Error ? error.message : "Gagal menghapus barang bekas.", "error");
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
    if (activePage === "barangbekas") {
      return (
        <BarangBekasPage
          branches={branches}
          filters={usedGoodsFilters}
          onFiltersChange={setUsedGoodsFilters}
          data={filteredUsedGoods}
          stats={stats.usedGoods}
          onOpen={setSelectedUsedGoods}
          onAdd={openCreateUsedGoods}
          onDelete={handleUsedGoodsDelete}
          onExport={handleUsedGoodsExport}
        />
      );
    }
    if (activePage === "inventori") return <InventoriPage data={sortedSpareparts} usedGoods={sortedUsedGoods} stats={stats} />;
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
    if (activePage === "cabang") {
      return (
        <CabangPage
          branches={branches}
          data={sortedSpareparts}
          usedGoods={sortedUsedGoods}
          onOpen={setSelectedPart}
          onOpenUsedGoods={setSelectedUsedGoods}
        />
      );
    }
    if (activePage === "laporan") return <LaporanPage data={sortedSpareparts} stats={stats} onOpen={setSelectedPart} onExport={handleExport} />;
    return (
      <DashboardPage
        data={sortedSpareparts}
        usedGoods={sortedUsedGoods}
        stats={stats}
        onOpen={setSelectedPart}
        onOpenUsedGoods={setSelectedUsedGoods}
        onNavigate={setActivePage}
      />
    );
  })();

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        stats={stats}
        onNavigate={setActivePage}
        onAdd={openInputChooser}
        onExport={handleExportAll}
        onPrint={() => window.print()}
      />
      <main className="main">
        <Topbar
          activePage={activePage}
          query={globalQuery}
          onQueryChange={setGlobalQuery}
          onSubmitSearch={submitGlobalSearch}
          onExport={handleExportAll}
          onAdd={openInputChooser}
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
      <UsedGoodsDetailModal
        item={selectedUsedGoods}
        onClose={() => setSelectedUsedGoods(null)}
        onDelete={handleUsedGoodsDelete}
      />
      <InputChooserModal
        open={inputChooserOpen}
        value={chosenInputType}
        onChange={setChosenInputType}
        onClose={() => setInputChooserOpen(false)}
        onSubmit={confirmInputChooser}
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
      <UsedGoodsModal
        open={usedGoodsModalOpen}
        branches={branches}
        form={usedGoodsForm}
        error={formError}
        pending={isPending}
        onChange={setUsedGoodsForm}
        onClose={() => setUsedGoodsModalOpen(false)}
        onSubmit={handleUsedGoodsSubmit}
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
  usedGoods,
  stats,
  onOpen,
  onOpenUsedGoods,
  onNavigate
}: {
  data: SparepartDTO[];
  usedGoods: UsedGoodsDTO[];
  stats: DashboardStats;
  onOpen: (part: SparepartDTO) => void;
  onOpenUsedGoods: (item: UsedGoodsDTO) => void;
  onNavigate: (page: PageKey) => void;
}) {
  const [tab, setTab] = useState<"sparepart" | "usedGoods">("sparepart");

  return (
    <div className="page-stack">
      <div className="tabs">
        <button className={tab === "sparepart" ? "tab-btn active" : "tab-btn"} type="button" onClick={() => setTab("sparepart")}>
          Sparepart
        </button>
        <button className={tab === "usedGoods" ? "tab-btn active" : "tab-btn"} type="button" onClick={() => setTab("usedGoods")}>
          Barang Bekas
        </button>
      </div>
      {tab === "sparepart" ? (
        <>
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
          <Card title="Rekap Barang Bekas" subtitle="Ringkasan barang non-sparepart / material">
            <div className="card-body">
              <UsedGoodsStatsGrid stats={stats.usedGoods} compact />
            </div>
          </Card>
        </>
      ) : (
        <>
          <UsedGoodsStatsGrid stats={stats.usedGoods} />
          <div className="grid-2">
            <Card
              title="Data Barang Bekas Terbaru"
              subtitle={`${usedGoods.length} item tercatat`}
              action={
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => onNavigate("barangbekas")}>
                  Semua
                </button>
              }
            >
              <DataTable columns={usedGoodsRecentColumns()} data={usedGoods.slice(0, 8)} getRowKey={(row) => row.id} onRowClick={onOpenUsedGoods} />
            </Card>
            <Card title="Kondisi Barang Bekas">
              <ProgressRow label="LAYAK JUAL" value={stats.usedGoods.saleable} max={stats.usedGoods.total} color="var(--teal)" />
              <ProgressRow label="TIDAK LAYAK" value={stats.usedGoods.notSaleable} max={stats.usedGoods.total} color="var(--red2)" />
              <div className="compact-panel center">
                <div className="compact-subtitle">Total Qty</div>
                <div className="compact-value">{formatNumber(stats.usedGoods.totalQty)}</div>
              </div>
            </Card>
          </div>
          <div className="grid-3">
            <UsedGoodsChartCard title="Per Kategori Barang Bekas" entries={usedGoodsGroupEntries(usedGoods, (item) => item.categoryLabel)} />
            <UsedGoodsChartCard title="Per Cabang Barang Bekas" entries={usedGoodsGroupEntries(usedGoods, (item) => item.branchName)} color="var(--purple)" />
            <UsedGoodsChartCard title="Per Satuan Barang Bekas" entries={usedGoodsGroupEntries(usedGoods, (item) => item.unitLabel)} color="var(--amber2)" />
          </div>
        </>
      )}
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

function BarangBekasPage({
  branches,
  filters,
  onFiltersChange,
  data,
  stats,
  onOpen,
  onAdd,
  onDelete,
  onExport
}: {
  branches: BranchDTO[];
  filters: UsedGoodsFilterState;
  onFiltersChange: (filters: UsedGoodsFilterState) => void;
  data: UsedGoodsDTO[];
  stats: DashboardStats["usedGoods"];
  onOpen: (item: UsedGoodsDTO) => void;
  onAdd: () => void;
  onDelete: (item: UsedGoodsDTO) => void;
  onExport: () => void;
}) {
  return (
    <div className="page-stack">
      <PageHead
        title="Pendataan Barang Bekas"
        subtitle={`INDOPAKET 2026 - ${data.length} record - Non-sparepart / material bekas operasional`}
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
            <button className="btn btn-amber" type="button" onClick={onAdd}>
              <Plus size={15} />
              Input Barang Bekas
            </button>
          </>
        }
      />
      <UsedGoodsStatsGrid stats={stats} />
      <UsedGoodsFilterBar value={filters} branches={branches} count={data.length} onChange={onFiltersChange} />
      <Card>
        <DataTable columns={usedGoodsColumns(onOpen, onDelete)} data={data} getRowKey={(row) => row.id} onRowClick={onOpen} />
      </Card>
    </div>
  );
}

function InventoriPage({ data, usedGoods, stats }: { data: SparepartDTO[]; usedGoods: UsedGoodsDTO[]; stats: DashboardStats }) {
  const [tab, setTab] = useState<"sparepart" | "usedGoods">("sparepart");
  const categoryRows = groupEntries(data, (item) => item.categoryLabel);
  const branchRows = groupEntries(data, (item) => item.branchName);
  const vehicleRows = groupEntries(data, (item) => item.vehicleTypeLabel);
  const usedGoodsCategoryRows = usedGoodsGroupEntries(usedGoods, (item) => item.categoryLabel);
  const usedGoodsBranchRows = usedGoodsGroupEntries(usedGoods, (item) => item.branchName);
  const usedGoodsUnitRows = usedGoodsGroupEntries(usedGoods, (item) => item.unitLabel);

  return (
    <div className="page-stack">
      <PageHead title="Inventori Sparepart" subtitle="Ringkasan stok per kategori, cabang, dan kondisi" />
      <div className="tabs">
        <button className={tab === "sparepart" ? "tab-btn active" : "tab-btn"} type="button" onClick={() => setTab("sparepart")}>
          Sparepart
        </button>
        <button className={tab === "usedGoods" ? "tab-btn active" : "tab-btn"} type="button" onClick={() => setTab("usedGoods")}>
          Barang Bekas
        </button>
      </div>
      {tab === "sparepart" ? (
        <>
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
        </>
      ) : (
        <>
          <UsedGoodsStatsGrid stats={stats.usedGoods} />
          <div className="grid-2">
            <Card title="Stok per Kategori Barang Bekas">
              <DataTable columns={usedGoodsInventoryColumns()} data={usedGoodsCategoryRows} getRowKey={(row) => row.label} />
            </Card>
            <Card title="Stok per Cabang Barang Bekas">
              <DataTable columns={usedGoodsBranchStockColumns()} data={usedGoodsBranchRows} getRowKey={(row) => row.label} />
            </Card>
          </div>
          <Card title="Ringkasan Satuan Barang Bekas">
            <DataTable columns={usedGoodsUnitColumns()} data={usedGoodsUnitRows} getRowKey={(row) => row.label} />
          </Card>
        </>
      )}
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
  usedGoods,
  onOpen,
  onOpenUsedGoods
}: {
  branches: BranchDTO[];
  data: SparepartDTO[];
  usedGoods: UsedGoodsDTO[];
  onOpen: (part: SparepartDTO) => void;
  onOpenUsedGoods: (item: UsedGoodsDTO) => void;
}) {
  const [tab, setTab] = useState<"sparepart" | "usedGoods">("sparepart");

  return (
    <div className="page-stack">
      <PageHead title="Data per Cabang" subtitle={`${branches.length} cabang / lokasi aktif`} />
      <div className="tabs">
        <button className={tab === "sparepart" ? "tab-btn active" : "tab-btn"} type="button" onClick={() => setTab("sparepart")}>
          Sparepart
        </button>
        <button className={tab === "usedGoods" ? "tab-btn active" : "tab-btn"} type="button" onClick={() => setTab("usedGoods")}>
          Barang Bekas
        </button>
      </div>
      {tab === "sparepart"
        ? branches.map((branch) => {
            const parts = data.filter((item) => item.branchId === branch.id);
            if (!parts.length) return null;
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
          })
        : branches.map((branch) => {
            const items = usedGoods.filter((item) => item.branchId === branch.id);
            if (!items.length) return null;
            const rows = usedGoodsGroupEntries(items, (item) => item.categoryLabel);
            const dominant = rows[0]?.label || "-";
            const saleable = items.filter((item) => item.condition === "LAYAK_JUAL").length;
            const notSaleable = items.filter((item) => item.condition === "TIDAK_LAYAK").length;
            const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
            const totalWeight = items.reduce((sum, item) => sum + (item.estimatedWeightKg || 0), 0);
            return (
              <Card
                key={branch.id}
                className="branch-card"
                title={branch.name}
                subtitle={`${items.length} item - qty ${formatNumber(totalQty)} - berat ${formatNumber(totalWeight)} kg - kategori dominan ${dominant}`}
                action={
                  <div className="badge-row">
                    <Badge tone="saleable">{saleable} Layak</Badge>
                    <Badge tone="damaged">{notSaleable} Tidak Layak</Badge>
                  </div>
                }
              >
                <DataTable columns={usedGoodsBranchColumns()} data={items} getRowKey={(row) => row.id} onRowClick={onOpenUsedGoods} />
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
                    <div className="mini-label">Ringkasan</div>
                    <div className="badge-row">
                      <Badge tone="amber">Total qty: {formatNumber(totalQty)}</Badge>
                      <Badge tone="vehicle">Berat: {formatNumber(totalWeight)} kg</Badge>
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

function InputChooserModal({
  open,
  value,
  onChange,
  onClose,
  onSubmit
}: {
  open: boolean;
  value: "sparepart" | "usedGoods" | null;
  onChange: (value: "sparepart" | "usedGoods") => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal
      open={open}
      title="Input Barang Baru"
      subtitle="Pilih jenis barang yang akan diinput"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-primary" type="button" onClick={onSubmit} disabled={!value}>
            Lanjut
          </button>
        </>
      }
    >
      <div className="type-chooser">
        <button className={value === "sparepart" ? "type-card active" : "type-card"} type="button" onClick={() => onChange("sparepart")}>
          <span className="type-card-icon">
            <Package size={18} />
          </span>
          <span className="type-card-title">Sparepart Ex-Service</span>
          <span className="type-card-desc">Komponen kendaraan yang dilepas saat servis. Memerlukan No. PJPP, nopol, dan kode jenis kendaraan.</span>
        </button>
        <button className={value === "usedGoods" ? "type-card active" : "type-card"} type="button" onClick={() => onChange("usedGoods")}>
          <span className="type-card-icon" style={{ background: "var(--amber3)", color: "var(--amber)" }}>
            <Archive size={18} />
          </span>
          <span className="type-card-title">Barang Bekas / Material</span>
          <span className="type-card-desc">Barang non-sparepart seperti kardus, palet, plastik, besi, kertas arsip, elektronik bekas, dan material lain.</span>
        </button>
      </div>
    </Modal>
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

function UsedGoodsModal({
  open,
  branches,
  form,
  error,
  pending,
  onChange,
  onClose,
  onSubmit
}: {
  open: boolean;
  branches: BranchDTO[];
  form: UsedGoodsForm;
  error: string;
  pending: boolean;
  onChange: (form: UsedGoodsForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  function set<K extends keyof UsedGoodsForm>(key: K, value: UsedGoodsForm[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <Modal
      open={open}
      title="Input Barang Bekas / Material"
      subtitle="Pendataan barang non-sparepart yang sudah tidak terpakai"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-amber" type="button" onClick={onSubmit} disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan Barang Bekas"}
          </button>
        </>
      }
      wide
    >
      <div className="form-section">
        <div className="form-section-title">Identitas & Sumber Barang</div>
        <div className="form-row two">
          <Field label="Tanggal Input" required>
            <input className="form-control" type="date" value={form.inputDate} onChange={(event) => set("inputDate", event.target.value)} />
          </Field>
          <Field label="Cabang / Lokasi Asal" required>
            <select className="form-control" value={form.branchId} onChange={(event) => set("branchId", event.target.value)}>
              <option value="">Pilih Cabang / Lokasi</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="form-row one">
          <Field label="Nama / Deskripsi Barang" required>
            <input className="form-control" value={form.name} onChange={(event) => set("name", event.target.value)} placeholder="Contoh: Kardus bekas pengiriman, Palet kayu, Paku bekas..." />
          </Field>
        </div>
      </div>
      <div className="form-section">
        <div className="form-section-title">Klasifikasi Barang</div>
        <div className="form-row three">
          <Field label="Kategori" required>
            <select className="form-control" value={form.category} onChange={(event) => set("category", event.target.value as UsedGoodsCategory)}>
              {usedGoodsCategoryOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Kondisi" required>
            <select className="form-control" value={form.condition} onChange={(event) => set("condition", event.target.value as UsedGoodsCondition)}>
              {usedGoodsConditionOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Lokasi Penyimpanan">
            <input className="form-control" value={form.storageLocation} onChange={(event) => set("storageLocation", event.target.value)} placeholder="Gudang / area simpan" />
          </Field>
        </div>
      </div>
      <div className="form-section">
        <div className="form-section-title">Kuantitas & Berat</div>
        <div className="form-row three">
          <Field label="Jumlah (Qty)" required>
            <input className="form-control" type="number" min="1" value={form.qty} onChange={(event) => set("qty", event.target.value)} />
          </Field>
          <Field label="Satuan" required>
            <select className="form-control" value={form.unit} onChange={(event) => set("unit", event.target.value as UsedGoodsUnit)}>
              {usedGoodsUnitOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estimasi Berat (kg)">
            <input className="form-control" type="number" min="0" step="0.1" value={form.estimatedWeightKg} onChange={(event) => set("estimatedWeightKg", event.target.value)} placeholder="0.0" />
          </Field>
        </div>
        <div className="form-row two">
          <Field label="Estimasi Harga Jual (Rp)">
            <input className="form-control" type="number" min="0" value={form.estimatedPrice} onChange={(event) => set("estimatedPrice", event.target.value)} placeholder="0" />
          </Field>
          <Field label="PIC / Penanggung Jawab">
            <input className="form-control" value={form.pic} onChange={(event) => set("pic", event.target.value)} placeholder="Nama PIC / staff" />
          </Field>
        </div>
      </div>
      <div className="form-section">
        <div className="form-section-title">Keterangan Tambahan</div>
        <div className="form-row one">
          <Field label="Keterangan">
            <textarea className="form-control" value={form.notes} onChange={(event) => set("notes", event.target.value)} placeholder="Catatan kondisi, riwayat penggunaan, atau catatan penting lainnya..." />
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

function UsedGoodsDetailModal({
  item,
  onClose,
  onDelete
}: {
  item: UsedGoodsDTO | null;
  onClose: () => void;
  onDelete: (item: UsedGoodsDTO) => void;
}) {
  return (
    <Modal
      open={Boolean(item)}
      title={item?.name || "Detail Barang Bekas"}
      subtitle={item?.code || "-"}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Tutup
          </button>
          {item ? (
            <button className="btn btn-danger btn-sm" type="button" onClick={() => onDelete(item)}>
              <Trash2 size={14} />
              Hapus
            </button>
          ) : null}
        </>
      }
    >
      {item ? (
        <div className="info-grid">
          <InfoBlock label="Kode Barang" value={<span className="mono-blue">{item.code}</span>} />
          <InfoBlock label="Cabang" value={<Badge tone={branchTone(item.branchName)}>{item.branchName}</Badge>} />
          <InfoBlock label="Tanggal Input" value={formatDate(item.inputDate)} />
          <InfoBlock label="Kategori" value={<Badge>{item.categoryLabel}</Badge>} />
          <InfoBlock label="Qty" value={`${formatNumber(item.qty)} ${item.unitLabel}`} />
          <InfoBlock label="Est. Berat" value={item.estimatedWeightKg === null ? "-" : `${formatNumber(item.estimatedWeightKg)} kg`} />
          <InfoBlock label="Est. Harga" value={formatCurrency(item.estimatedPrice)} />
          <InfoBlock label="Kondisi" value={<UsedGoodsConditionBadge item={item} />} />
          <InfoBlock label="Lokasi" value={item.storageLocation || "-"} />
          <InfoBlock label="PIC" value={item.pic || "-"} />
          <InfoBlock label="Keterangan" value={item.notes || "Tidak ada keterangan tambahan."} />
        </div>
      ) : null}
    </Modal>
  );
}

function InfoBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="info-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
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

function UsedGoodsStatsGrid({ stats, compact = false }: { stats: DashboardStats["usedGoods"]; compact?: boolean }) {
  return (
    <div className={compact ? "compact-grid" : "stats stats-5"}>
      <StatCard label="Total Barang Bekas" value={stats.total} meta="item terdaftar" icon={Archive} tone="amber" />
      <StatCard label="Total Qty" value={formatNumber(stats.totalQty)} meta="akumulasi satuan" icon={Package} tone="blue" />
      <StatCard label="Layak Jual" value={stats.saleable} meta="siap dijual" icon={CheckCircle2} tone="teal" />
      <StatCard label="Tidak Layak" value={stats.notSaleable} meta="perlu sortir" icon={X} tone="red" />
      <StatCard label="Est. Berat" value={`${formatNumber(stats.totalWeightKg)} kg`} meta="total estimasi" icon={Truck} tone="purple" />
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

function UsedGoodsChartCard({
  title,
  entries,
  color
}: {
  title: string;
  entries: UsedGoodsGroupRow[];
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

function UsedGoodsConditionBadge({ item }: { item: UsedGoodsDTO }) {
  return (
    <Badge tone={item.condition === "LAYAK_JUAL" ? "saleable" : "damaged"} dot>
      {item.conditionLabel}
    </Badge>
  );
}

function UsedGoodsFilterBar({
  value,
  branches,
  count,
  onChange
}: {
  value: UsedGoodsFilterState;
  branches: BranchDTO[];
  count: number;
  onChange: (value: UsedGoodsFilterState) => void;
}) {
  return (
    <div className="filter-bar">
      <select className="filter-control" value={value.condition} onChange={(event) => onChange({ ...value, condition: event.target.value as UsedGoodsFilterState["condition"] })}>
        <option value="">Semua Kondisi</option>
        {usedGoodsConditionOptions.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <select className="filter-control" value={value.category} onChange={(event) => onChange({ ...value, category: event.target.value as UsedGoodsFilterState["category"] })}>
        <option value="">Semua Kategori</option>
        {usedGoodsCategoryOptions.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <select className="filter-control" value={value.branchId} onChange={(event) => onChange({ ...value, branchId: event.target.value })}>
        <option value="">Semua Cabang</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>
      <input
        className="filter-input"
        placeholder="Cari nama barang..."
        value={value.query}
        onChange={(event) => onChange({ ...value, query: event.target.value })}
      />
      <span className="filter-count">{count} data</span>
    </div>
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

function usedGoodsRecentColumns(): Column<UsedGoodsDTO>[] {
  return [
    { key: "code", header: "Kode", cell: (item) => <span className="mono-blue">{item.code}</span> },
    { key: "name", header: "Nama Barang", cell: (item) => <span className="td-bold">{item.name}</span> },
    { key: "category", header: "Kategori", cell: (item) => <Badge>{item.categoryLabel}</Badge> },
    { key: "qty", header: "Qty", cell: (item) => `${formatNumber(item.qty)} ${item.unitLabel}` },
    { key: "condition", header: "Kondisi", cell: (item) => <UsedGoodsConditionBadge item={item} /> },
    { key: "branch", header: "Cabang", cell: (item) => <Badge tone={branchTone(item.branchName)}>{item.branchName}</Badge> }
  ];
}

function usedGoodsColumns(onOpen: (item: UsedGoodsDTO) => void, onDelete: (item: UsedGoodsDTO) => void): Column<UsedGoodsDTO>[] {
  return [
    { key: "no", header: "No", cell: (_item, index) => <span className="td-muted">{index + 1}</span> },
    { key: "branch", header: "Cabang", cell: (item) => <Badge tone={branchTone(item.branchName)}>{item.branchName}</Badge> },
    { key: "date", header: "Tgl Input", cell: (item) => <span className="td-muted">{formatDate(item.inputDate)}</span> },
    { key: "name", header: "Nama Barang", cell: (item) => <span className="td-bold">{item.name}</span> },
    { key: "category", header: "Kategori", cell: (item) => <Badge>{item.categoryLabel}</Badge> },
    { key: "qty", header: "Qty", cell: (item) => <strong>{formatNumber(item.qty)}</strong> },
    { key: "unit", header: "Satuan", cell: (item) => <Badge tone="vehicle">{item.unitLabel}</Badge> },
    { key: "weight", header: "Est. Berat (kg)", cell: (item) => <span className="td-muted">{item.estimatedWeightKg === null ? "-" : formatNumber(item.estimatedWeightKg)}</span> },
    { key: "condition", header: "Kondisi", cell: (item) => <UsedGoodsConditionBadge item={item} /> },
    { key: "location", header: "Lokasi", cell: (item) => <span className="td-muted">{item.storageLocation || "-"}</span> },
    {
      key: "actions",
      header: "Aksi",
      cell: (item) => (
        <div className="badge-row" onClick={(event) => event.stopPropagation()}>
          <button className="btn btn-ghost btn-xs" type="button" onClick={() => onOpen(item)}>
            Detail
          </button>
          <button className="btn btn-danger btn-xs" type="button" onClick={() => onDelete(item)} title="Hapus barang bekas">
            <Trash2 size={12} />
          </button>
        </div>
      )
    }
  ];
}

function usedGoodsBranchColumns(): Column<UsedGoodsDTO>[] {
  return [
    { key: "code", header: "Kode Barang", cell: (item) => <span className="mono-blue">{item.code}</span> },
    { key: "date", header: "Tgl Input", cell: (item) => <span className="td-muted">{formatDate(item.inputDate)}</span> },
    { key: "name", header: "Nama Barang", cell: (item) => <span className="td-bold">{item.name}</span> },
    { key: "category", header: "Kategori", cell: (item) => <Badge>{item.categoryLabel}</Badge> },
    { key: "qty", header: "Qty", cell: (item) => `${formatNumber(item.qty)} ${item.unitLabel}` },
    { key: "weight", header: "Est. Berat", cell: (item) => (item.estimatedWeightKg === null ? "-" : `${formatNumber(item.estimatedWeightKg)} kg`) },
    { key: "condition", header: "Kondisi", cell: (item) => <UsedGoodsConditionBadge item={item} /> }
  ];
}

function usedGoodsInventoryColumns(): Column<UsedGoodsGroupRow>[] {
  return [
    { key: "category", header: "Kategori", cell: (row) => <span className="td-bold">{row.label}</span> },
    { key: "total", header: "Total Item", cell: (row) => <strong>{row.total}</strong> },
    { key: "qty", header: "Total Qty", cell: (row) => <strong>{formatNumber(row.totalQty)}</strong> },
    { key: "saleable", header: "Layak Jual", cell: (row) => <Badge tone="saleable">{row.saleable}</Badge> },
    { key: "notSaleable", header: "Tidak Layak", cell: (row) => <Badge tone="damaged">{row.notSaleable}</Badge> },
    { key: "weight", header: "Estimasi Berat Kg", cell: (row) => <span className="td-muted">{formatNumber(row.totalWeightKg)}</span> }
  ];
}

function usedGoodsBranchStockColumns(): Column<UsedGoodsGroupRow>[] {
  return [
    { key: "branch", header: "Cabang", cell: (row) => <Badge tone={branchTone(row.label)}>{row.label}</Badge> },
    { key: "total", header: "Total Item", cell: (row) => <strong>{row.total}</strong> },
    { key: "qty", header: "Total Qty", cell: (row) => <strong>{formatNumber(row.totalQty)}</strong> },
    { key: "saleable", header: "Layak Jual", cell: (row) => <Badge tone="saleable">{row.saleable}</Badge> },
    { key: "notSaleable", header: "Tidak Layak", cell: (row) => <Badge tone="damaged">{row.notSaleable}</Badge> }
  ];
}

function usedGoodsUnitColumns(): Column<UsedGoodsGroupRow>[] {
  return [
    { key: "unit", header: "Satuan", cell: (row) => <Badge tone="vehicle">{row.label}</Badge> },
    { key: "records", header: "Jumlah Record", cell: (row) => <strong>{row.total}</strong> },
    { key: "qty", header: "Total Qty", cell: (row) => <strong>{formatNumber(row.totalQty)}</strong> }
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

type UsedGoodsGroupRow = {
  label: string;
  total: number;
  totalQty: number;
  saleable: number;
  notSaleable: number;
  totalWeightKg: number;
  items: UsedGoodsDTO[];
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

function usedGoodsGroupEntries(data: UsedGoodsDTO[], selector: (item: UsedGoodsDTO) => string): UsedGoodsGroupRow[] {
  return Object.entries(groupBy(data, selector))
    .map(([label, items]) => ({
      label,
      total: items.length,
      totalQty: items.reduce((sum, item) => sum + item.qty, 0),
      saleable: items.filter((item) => item.condition === "LAYAK_JUAL").length,
      notSaleable: items.filter((item) => item.condition === "TIDAK_LAYAK").length,
      totalWeightKg: items.reduce((sum, item) => sum + (item.estimatedWeightKg || 0), 0),
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

function computeStats(data: SparepartDTO[], usedGoods: UsedGoodsDTO[]): DashboardStats {
  return {
    total: data.length,
    saleable: data.filter((part) => part.condition === "LAYAK_JUAL").length,
    damaged: data.filter((part) => part.condition === "RUSAK").length,
    activeBranches: new Set(data.map((part) => part.branchId)).size,
    uniquePlates: new Set(data.map((part) => part.plateNumber.trim())).size,
    uniquePjpp: new Set(data.map((part) => part.pjpp.trim())).size,
    usedGoods: calculateUsedGoodsStats(usedGoods)
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

function filterUsedGoods(data: UsedGoodsDTO[], filters: UsedGoodsFilterState) {
  const query = filters.query.trim().toLowerCase();
  return data.filter((item) => {
    if (filters.condition && item.condition !== filters.condition) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.branchId && item.branchId !== filters.branchId) return false;
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      item.categoryLabel.toLowerCase().includes(query) ||
      item.branchName.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query)
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

function sortUsedGoods(data: UsedGoodsDTO[]) {
  return [...data].sort((a, b) => {
    const aDate = Date.parse(a.inputDate);
    const bDate = Date.parse(b.inputDate);
    return bDate - aDate || a.name.localeCompare(b.name);
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2
  }).format(value);
}
