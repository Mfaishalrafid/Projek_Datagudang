import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BarkasApp } from "@/components/BarkasApp";
import { branchUser, makeInitialData, spareparts, usedGoods } from "../fixtures";

const actionMocks = vi.hoisted(() => ({
  createSaleOrder: vi.fn(),
  createUsedGoodsSaleOrder: vi.fn(),
  createBranch: vi.fn(),
  createSparepart: vi.fn(),
  createUser: vi.fn(),
  createUsedGoods: vi.fn(),
  deleteSparepart: vi.fn(),
  deleteUsedGoods: vi.fn(),
  logoutAction: vi.fn(),
  resetUserPassword: vi.fn(),
  updateSaleOrderStatus: vi.fn(),
  updateUsedGoodsSaleOrderStatus: vi.fn(),
  updateBranch: vi.fn(),
  updateSparepart: vi.fn(),
  updateUsedGoods: vi.fn(),
  updateUser: vi.fn()
}));

vi.mock("@/app/actions", () => actionMocks);

function renderApp() {
  return render(<BarkasApp initialData={makeInitialData()} />);
}

function renderBranchApp() {
  return render(
    <BarkasApp
      initialData={makeInitialData({
        currentUser: branchUser,
        branches: makeInitialData().branches.filter((branch) => branch.id === branchUser.branchId),
        spareparts: [],
        usedGoods: makeInitialData().usedGoods.filter((item) => item.branchId === branchUser.branchId),
        saleOrders: [],
        users: [],
        stats: {
          total: 0,
          saleable: 0,
          damaged: 0,
          activeBranches: 0,
          uniquePlates: 0,
          uniquePjpp: 0,
          usedGoods: {
            total: 2,
            totalQty: 272,
            saleable: 1,
            notSaleable: 1,
            totalWeightKg: 1,
            activeBranches: 1
          }
        }
      })}
    />
  );
}

function renderEmployeeBranchApp() {
  const employeeUser = {
    ...branchUser,
    id: "user-karyawan-cabang",
    name: "Karyawan Cabang",
    email: "karyawan.cabang@barkas.local",
    role: "KARYAWAN_CABANG" as const
  };

  return render(
    <BarkasApp
      initialData={makeInitialData({
        currentUser: employeeUser,
        branches: makeInitialData().branches.filter((branch) => branch.id === employeeUser.branchId),
        spareparts: [],
        usedGoods: makeInitialData().usedGoods.filter((item) => item.branchId === employeeUser.branchId),
        saleOrders: [],
        users: [],
        stats: {
          total: 0,
          saleable: 0,
          damaged: 0,
          activeBranches: 0,
          uniquePlates: 0,
          uniquePjpp: 0,
          usedGoods: {
            total: 2,
            totalQty: 272,
            saleable: 1,
            notSaleable: 1,
            totalWeightKg: 1,
            activeBranches: 1
          }
        }
      })}
    />
  );
}

function content() {
  const element = document.querySelector(".content");
  if (!element) throw new Error("Content element not found");
  return within(element as HTMLElement);
}

function activeModal() {
  const element = document.querySelector(".modal-overlay.open");
  if (!element) throw new Error("Active modal not found");
  return within(element as HTMLElement);
}

function sidebarSections() {
  return [...document.querySelectorAll(".sidebar .sb-section")].map((element) => element.textContent);
}

async function openUsedGoodsPage(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Pendataan Barang Bekas/ }));
  return content();
}

describe("BarkasApp v3 UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actionMocks.deleteUsedGoods.mockResolvedValue({ id: "bb-kardus" });
  });

  it("shows dashboard tabs and used goods dashboard content", async () => {
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByText("Total Sparepart")).toBeInTheDocument();
    expect(content().queryByText("Rekap Barang Bekas")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Barang Bekas" }));

    expect(screen.getByText("Total Barang Bekas")).toBeInTheDocument();
    expect(screen.getByText("Data Barang Bekas Terbaru")).toBeInTheDocument();
    expect(screen.getByText("Kardus Bekas")).toBeInTheDocument();
    expect(screen.getByText("Per Kategori Barang Bekas")).toBeInTheDocument();
    expect(screen.getByText("Per Cabang Barang Bekas")).toBeInTheDocument();
    expect(content().getAllByText("Sirclo").length).toBeGreaterThan(0);
  });

  it("opens the input chooser and continues to the used goods modal", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: /^Input Barang$/ }));
    let modal = activeModal();
    expect(modal.getByText("Input Barang Baru")).toBeInTheDocument();

    const next = modal.getByRole("button", { name: "Lanjut" });
    expect(next).toBeDisabled();

    await user.click(modal.getByText("Barang Bekas / Material"));
    expect(next).toBeEnabled();
    await user.click(next);

    modal = activeModal();
    expect(modal.getByText("Input Barang Bekas / Material")).toBeInTheDocument();
  });

  it("opens the sparepart modal from the chooser", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: /^Input Barang$/ }));
    const modal = activeModal();

    await user.click(modal.getByText("Sparepart Ex-Service"));
    await user.click(modal.getByRole("button", { name: "Lanjut" }));

    expect(activeModal().getByText("Input Sparepart Ex-Service")).toBeInTheDocument();
  });

  it("filters and searches the used goods table", async () => {
    const user = userEvent.setup();
    renderApp();
    let page = await openUsedGoodsPage(user);

    expect(page.getByText("Kardus Bekas")).toBeInTheDocument();

    const search = page.getByPlaceholderText("Cari nama barang...");
    await user.type(search, "Paku");
    expect(page.getByText("Paku bekas")).toBeInTheDocument();
    expect(page.queryByText("Kardus Bekas")).not.toBeInTheDocument();

    await user.clear(search);
    const filters = page.getAllByRole("combobox");

    await user.selectOptions(filters[0], "TIDAK_LAYAK");
    page = content();
    expect(page.getByText("Plastik Sortir")).toBeInTheDocument();
    expect(page.queryByText("Paku bekas")).not.toBeInTheDocument();

    await user.selectOptions(filters[0], "");
    await user.selectOptions(filters[1], "KARDUS_KARTON");
    page = content();
    expect(page.getByText("Kardus Bekas")).toBeInTheDocument();
    expect(page.queryByText("Plastik Sortir")).not.toBeInTheDocument();

    await user.selectOptions(filters[1], "");
    await user.selectOptions(filters[2], "branch-cargo");
    page = content();
    expect(page.getByText("Paku bekas")).toBeInTheDocument();
    expect(page.queryByText("Kardus Bekas")).not.toBeInTheDocument();
  });

  it("opens used goods detail and deletes the selected row", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    renderApp();
    let page = await openUsedGoodsPage(user);

    await user.click(page.getAllByRole("button", { name: "Detail" })[0]);
    expect(activeModal().getByText("Kode Barang")).toBeInTheDocument();
    expect(activeModal().getAllByText("BB-20260521-0001").length).toBeGreaterThan(0);

    await user.click(activeModal().getByRole("button", { name: /Hapus/ }));

    await waitFor(() => expect(actionMocks.deleteUsedGoods).toHaveBeenCalledWith("bb-kardus"));
    page = content();
    await waitFor(() => expect(page.queryByText("Kardus Bekas")).not.toBeInTheDocument());

    confirmSpy.mockRestore();
  });

  it("shows used goods sale action only for saleable items and central roles", async () => {
    const user = userEvent.setup();
    renderApp();
    let page = await openUsedGoodsPage(user);

    expect(page.getAllByRole("button", { name: "Jual" })).toHaveLength(2);

    const search = page.getByPlaceholderText("Cari nama barang...");
    await user.type(search, "Plastik");
    page = content();
    expect(page.getByText("Plastik Sortir")).toBeInTheDocument();
    expect(page.queryByRole("button", { name: "Jual" })).not.toBeInTheDocument();
  });

  it("hides used goods sale action for cabang roles", async () => {
    const user = userEvent.setup();
    renderBranchApp();
    const page = await openUsedGoodsPage(user);

    expect(page.getByText("Kardus Bekas")).toBeInTheDocument();
    expect(page.queryByRole("button", { name: "Jual" })).not.toBeInTheDocument();
  });

  it("shows used goods inventory tab summaries", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: /Inventori/ }));
    let page = content();
    expect(page.getByText("Stok per Kategori")).toBeInTheDocument();

    await user.click(page.getByRole("button", { name: "Barang Bekas" }));
    page = content();
    expect(page.getByText("Stok per Kategori Barang Bekas")).toBeInTheDocument();
    expect(page.getByText("Stok per Cabang Barang Bekas")).toBeInTheDocument();
    expect(page.getByText("Ringkasan Satuan Barang Bekas")).toBeInTheDocument();
    expect(page.getByText("Kardus & Karton")).toBeInTheDocument();
    expect(page.getByText("pcs")).toBeInTheDocument();
  });

  it("shows used goods branch summaries without crashing on an empty branch", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Data per Cabang" }));
    let page = content();
    expect(page.getByText("SPI RANGKASBITUNG")).toBeInTheDocument();

    await user.click(page.getByRole("button", { name: "Barang Bekas" }));
    page = content();
    expect(page.getByText("Sirclo")).toBeInTheDocument();
    expect(page.getByText("GW Cargo TGR")).toBeInTheDocument();
    expect(page.queryByText("Cabang Kosong")).not.toBeInTheDocument();
  });

  it("routes global search to sparepart or used goods pages and handles empty results", async () => {
    const user = userEvent.setup();
    renderApp();
    const search = screen.getByPlaceholderText("Cari sparepart / barang bekas...");

    await user.type(search, "R3/RJPP");
    await user.keyboard("{Enter}");
    expect(content().getByText("Pendataan Sparepart Ex-Service")).toBeInTheDocument();
    expect(content().getByText("BAN LUAR R-15")).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "BB-20260502");
    await user.keyboard("{Enter}");
    expect(content().getByText("Pendataan Barang Bekas")).toBeInTheDocument();
    expect(content().getByText("Paku bekas")).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "data-yang-tidak-ada");
    await user.keyboard("{Enter}");
    expect(content().getByText("Data tidak ditemukan")).toBeInTheDocument();
  });

  it("renders central sidebar with Layak Jual and management menus", () => {
    renderApp();

    expect(screen.getByRole("button", { name: /Layak Jual/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pendataan Barang Bekas/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Manajemen Cabang/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Manajemen User/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Input Barang$/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Input Barang Baru/ })).not.toBeInTheDocument();
  });

  it("removes phone and address from add branch form", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: /Manajemen Cabang/ }));
    await user.click(content().getByRole("button", { name: /Tambah Cabang/ }));

    const modal = activeModal();
    expect(modal.getByText("Kode Cabang")).toBeInTheDocument();
    expect(modal.getByText("Nama Cabang")).toBeInTheDocument();
    expect(modal.getByText("Regional")).toBeInTheDocument();
    expect(modal.getByText("Kota")).toBeInTheDocument();
    expect(modal.getByText("Status")).toBeInTheDocument();
    expect(modal.queryByText("Telepon")).not.toBeInTheDocument();
    expect(modal.queryByText("Alamat")).not.toBeInTheDocument();
  });

  it("removes phone and address from edit branch form", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: /Manajemen Cabang/ }));
    await user.click(content().getAllByRole("button", { name: "Edit" })[0]);

    const modal = activeModal();
    expect(modal.getByText("Edit Cabang")).toBeInTheDocument();
    expect(modal.getByText("Kode Cabang")).toBeInTheDocument();
    expect(modal.getByText("Nama Cabang")).toBeInTheDocument();
    expect(modal.getByText("Regional")).toBeInTheDocument();
    expect(modal.getByText("Kota")).toBeInTheDocument();
    expect(modal.getByText("Status")).toBeInTheDocument();
    expect(modal.queryByText("Telepon")).not.toBeInTheDocument();
    expect(modal.queryByText("Alamat")).not.toBeInTheDocument();
  });

  it("places Pendataan Barang Bekas in main sidebar for ADMIN_CABANG", () => {
    renderBranchApp();

    expect(sidebarSections()).toContain("Menu Utama");
    expect(sidebarSections()).not.toContain("Barang Bekas");
    expect(screen.getByRole("button", { name: /Pendataan Barang Bekas/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Input Barang Baru/ })).not.toBeInTheDocument();
  });

  it("places Pendataan Barang Bekas in main sidebar for KARYAWAN_CABANG", () => {
    renderEmployeeBranchApp();

    expect(sidebarSections()).toContain("Menu Utama");
    expect(sidebarSections()).not.toContain("Barang Bekas");
    expect(screen.getByRole("button", { name: /Pendataan Barang Bekas/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Input Barang Baru/ })).not.toBeInTheDocument();
  });

  it("shows separate sparepart and used goods report tabs", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: /^Laporan$/ }));
    let page = content();

    expect(page.getByRole("button", { name: "Sparepart" })).toBeInTheDocument();
    expect(page.getByRole("button", { name: "Barang Bekas" })).toBeInTheDocument();
    expect(page.getByText("Total Sparepart")).toBeInTheDocument();
    expect(page.getByText("Tabel Lengkap - Semua 2 Data Sparepart")).toBeInTheDocument();

    await user.click(page.getByRole("button", { name: "Barang Bekas" }));
    page = content();
    expect(page.getByText("Total Barang Bekas")).toBeInTheDocument();
    expect(page.getByText("Rekap Barang Bekas per Kategori")).toBeInTheDocument();
    expect(page.getByText("Rekap Barang Bekas per Cabang")).toBeInTheDocument();
    expect(page.getByText("Tabel Lengkap - Semua 3 Data Barang Bekas")).toBeInTheDocument();
    expect(page.getByText("Kardus Bekas")).toBeInTheDocument();
  });

  it("toggles add user password visibility without submitting the form", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: /Manajemen User/ }));
    await user.click(content().getByRole("button", { name: /Tambah User/ }));

    const modal = activeModal();
    const password = modal.getByPlaceholderText("Minimal 6 karakter");
    expect(password).toHaveAttribute("type", "password");

    await user.click(modal.getByRole("button", { name: "Tampilkan password" }));
    expect(password).toHaveAttribute("type", "text");
    expect(actionMocks.createUser).not.toHaveBeenCalled();

    await user.click(modal.getByRole("button", { name: "Sembunyikan password" }));
    expect(password).toHaveAttribute("type", "password");
    expect(actionMocks.createUser).not.toHaveBeenCalled();
  });

  it("shows Layak Jual tabs for sparepart and used goods", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: /Layak Jual/ }));
    let page = content();
    expect(page.getByRole("button", { name: "Sparepart" })).toBeInTheDocument();
    expect(page.getByRole("button", { name: "Barang Bekas" })).toBeInTheDocument();
    expect(page.getByText("BAN LUAR R-15")).toBeInTheDocument();

    await user.click(page.getByRole("button", { name: "Barang Bekas" }));
    page = content();
    expect(page.getAllByText("Barang Bekas Layak Jual").length).toBeGreaterThan(0);
    expect(page.getByText("Kardus Bekas")).toBeInTheDocument();
    expect(page.getByText("Paku bekas")).toBeInTheDocument();
    expect(page.queryByText("Plastik Sortir")).not.toBeInTheDocument();
  });

  it("syncs pendataan sparepart sale action with order status", async () => {
    const user = userEvent.setup();
    render(
      <BarkasApp
        initialData={makeInitialData({
          spareparts: [
            { ...spareparts[0], id: "part-ready", pjpp: "PJPP-READY", name: "BAN READY" },
            { ...spareparts[0], id: "part-order", pjpp: "PJPP-ORDER", name: "BAN DALAM ORDER" },
            { ...spareparts[0], id: "part-sold", pjpp: "PJPP-SOLD", name: "BAN TERJUAL" }
          ],
          saleOrders: [
            {
              id: "order-active",
              sparepartId: "part-order",
              sparepartName: "BAN DALAM ORDER",
              sparepartPjpp: "PJPP-ORDER",
              branchName: "SPI RANGKASBITUNG",
              buyerName: "Pembeli A",
              buyerType: "PELANGGAN_UMUM",
              buyerTypeLabel: "Pelanggan Umum",
              price: 10000,
              saleDate: "2026-05-25T00:00:00.000Z",
              status: "APPROVAL",
              statusLabel: "Approval",
              createdAt: "2026-05-25T00:00:00.000Z",
              updatedAt: "2026-05-25T00:00:00.000Z"
            },
            {
              id: "order-sold",
              sparepartId: "part-sold",
              sparepartName: "BAN TERJUAL",
              sparepartPjpp: "PJPP-SOLD",
              branchName: "SPI RANGKASBITUNG",
              buyerName: "Pembeli B",
              buyerType: "PELANGGAN_UMUM",
              buyerTypeLabel: "Pelanggan Umum",
              price: 12000,
              saleDate: "2026-05-25T00:00:00.000Z",
              status: "TERJUAL",
              statusLabel: "Terjual",
              createdAt: "2026-05-25T00:00:00.000Z",
              updatedAt: "2026-05-25T00:00:00.000Z"
            }
          ]
        })}
      />
    );

    await user.click(screen.getByRole("button", { name: /Pendataan Sparepart/ }));
    const page = content();

    expect(page.getByText("BAN READY")).toBeInTheDocument();
    expect(page.getByRole("button", { name: "Jual" })).toBeInTheDocument();
    expect(page.getByText("BAN DALAM ORDER")).toBeInTheDocument();
    expect(page.getByText("Dalam Order")).toBeInTheDocument();
    expect(page.getByText("BAN TERJUAL")).toBeInTheDocument();
    expect(page.getByText("Terjual")).toBeInTheDocument();
  });

  it("syncs pendataan barang bekas sale action with available qty and orders", async () => {
    const user = userEvent.setup();
    render(
      <BarkasApp
        initialData={makeInitialData({
          usedGoods: [
            { ...usedGoods[0], id: "bb-sisa", code: "BB-SISA", name: "Kardus Sisa", qty: 10 },
            { ...usedGoods[1], id: "bb-habis", code: "BB-HABIS", name: "Paku Habis", qty: 5 },
            { ...usedGoods[0], id: "bb-order", code: "BB-ORDER", name: "Kardus Dalam Order", qty: 12 }
          ],
          usedGoodsSaleOrders: [
            {
              id: "bb-order-sold-partial",
              usedGoodsId: "bb-sisa",
              usedGoodsCode: "BB-SISA",
              usedGoodsName: "Kardus Sisa",
              categoryLabel: "Kardus & Karton",
              branchName: "Sirclo",
              qty: 4,
              unitLabel: "pcs",
              buyerName: "Pembeli Sisa",
              price: 40000,
              saleDate: "2026-05-25T00:00:00.000Z",
              status: "TERJUAL",
              statusLabel: "Terjual",
              notes: null,
              createdAt: "2026-05-25T00:00:00.000Z",
              updatedAt: "2026-05-25T00:00:00.000Z"
            } as any,
            {
              id: "bb-order-sold-full",
              usedGoodsId: "bb-habis",
              usedGoodsCode: "BB-HABIS",
              usedGoodsName: "Paku Habis",
              categoryLabel: "Besi & Logam",
              branchName: "GW Cargo TGR",
              qty: 5,
              unitLabel: "kg",
              buyerName: "Pembeli Habis",
              price: 50000,
              saleDate: "2026-05-25T00:00:00.000Z",
              status: "TERJUAL",
              statusLabel: "Terjual",
              notes: null,
              createdAt: "2026-05-25T00:00:00.000Z",
              updatedAt: "2026-05-25T00:00:00.000Z"
            } as any,
            {
              id: "bb-order-active",
              usedGoodsId: "bb-order",
              usedGoodsCode: "BB-ORDER",
              usedGoodsName: "Kardus Dalam Order",
              categoryLabel: "Kardus & Karton",
              branchName: "Sirclo",
              qty: 3,
              unitLabel: "pcs",
              buyerName: "Pembeli Order",
              price: 30000,
              saleDate: "2026-05-25T00:00:00.000Z",
              status: "APPROVAL",
              statusLabel: "Approval",
              notes: null,
              createdAt: "2026-05-25T00:00:00.000Z",
              updatedAt: "2026-05-25T00:00:00.000Z"
            } as any
          ]
        })}
      />
    );

    await user.click(screen.getByRole("button", { name: /Pendataan Barang Bekas/ }));
    const page = content();

    expect(page.getByText("Kardus Sisa")).toBeInTheDocument();
    expect(page.getByRole("button", { name: "Jual Sisa" })).toBeInTheDocument();
    expect(page.getByText("Paku Habis")).toBeInTheDocument();
    expect(page.getByText("Habis")).toBeInTheDocument();
    expect(page.getByText("Kardus Dalam Order")).toBeInTheDocument();
    expect(page.getByText("Dalam Order")).toBeInTheDocument();
  });

  it("allows editing unlocked sparepart from detail drawer", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: /Pendataan Sparepart/ }));
    await user.click(content().getByText("BAN LUAR R-15"));

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("hides edit for in-order and sold sparepart detail drawer", async () => {
    const user = userEvent.setup();
    render(
      <BarkasApp
        initialData={makeInitialData({
          spareparts: [
            { ...spareparts[0], id: "part-order", pjpp: "PJPP-ORDER", name: "BAN DALAM ORDER" },
            { ...spareparts[0], id: "part-sold", pjpp: "PJPP-SOLD", name: "BAN TERJUAL" }
          ],
          saleOrders: [
            {
              id: "order-active",
              sparepartId: "part-order",
              sparepartName: "BAN DALAM ORDER",
              sparepartPjpp: "PJPP-ORDER",
              branchName: "SPI RANGKASBITUNG",
              buyerName: "Pembeli A",
              buyerType: "PELANGGAN_UMUM",
              buyerTypeLabel: "Pelanggan Umum",
              price: 10000,
              saleDate: "2026-05-25T00:00:00.000Z",
              status: "APPROVAL",
              statusLabel: "Approval",
              createdAt: "2026-05-25T00:00:00.000Z",
              updatedAt: "2026-05-25T00:00:00.000Z"
            },
            {
              id: "order-sold",
              sparepartId: "part-sold",
              sparepartName: "BAN TERJUAL",
              sparepartPjpp: "PJPP-SOLD",
              branchName: "SPI RANGKASBITUNG",
              buyerName: "Pembeli B",
              buyerType: "PELANGGAN_UMUM",
              buyerTypeLabel: "Pelanggan Umum",
              price: 12000,
              saleDate: "2026-05-25T00:00:00.000Z",
              status: "TERJUAL",
              statusLabel: "Terjual",
              createdAt: "2026-05-25T00:00:00.000Z",
              updatedAt: "2026-05-25T00:00:00.000Z"
            }
          ]
        })}
      />
    );

    await user.click(screen.getByRole("button", { name: /Pendataan Sparepart/ }));
    await user.click(content().getByText("BAN TERJUAL"));

    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Terjual").length).toBeGreaterThan(0);
  });

  it("allows editing unlocked used goods from detail modal", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: /Pendataan Barang Bekas/ }));
    await user.click(content().getByText("Kardus Bekas"));
    await user.click(activeModal().getByRole("button", { name: "Edit" }));

    expect(activeModal().getByText("Edit Barang Bekas / Material")).toBeInTheDocument();
  });

  it("hides edit for used goods that already has a transaction", async () => {
    const user = userEvent.setup();
    render(
      <BarkasApp
        initialData={makeInitialData({
          usedGoods: [{ ...usedGoods[0], id: "bb-sisa", code: "BB-SISA", name: "Kardus Sisa", qty: 10 }],
          usedGoodsSaleOrders: [
            {
              id: "bb-order-sold-partial",
              usedGoodsId: "bb-sisa",
              usedGoodsCode: "BB-SISA",
              usedGoodsName: "Kardus Sisa",
              categoryLabel: "Kardus & Karton",
              branchName: "Sirclo",
              qty: 4,
              unitLabel: "pcs",
              buyerName: "Pembeli Sisa",
              price: 40000,
              saleDate: "2026-05-25T00:00:00.000Z",
              status: "TERJUAL",
              statusLabel: "Terjual",
              notes: null,
              createdAt: "2026-05-25T00:00:00.000Z",
              updatedAt: "2026-05-25T00:00:00.000Z"
            } as any
          ]
        })}
      />
    );

    await user.click(screen.getByRole("button", { name: /Pendataan Barang Bekas/ }));
    await user.click(content().getByText("Kardus Sisa"));

    expect(activeModal().queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(activeModal().getByText("Terkunci")).toBeInTheDocument();
  });

  it("syncs sparepart sale actions with pipeline order status", async () => {
    const user = userEvent.setup();
    render(
      <BarkasApp
        initialData={makeInitialData({
          spareparts: [
            { ...spareparts[0], id: "part-ready", pjpp: "PJPP-READY", name: "BAN READY" },
            { ...spareparts[0], id: "part-order", pjpp: "PJPP-ORDER", name: "BAN DALAM ORDER" },
            { ...spareparts[0], id: "part-sold", pjpp: "PJPP-SOLD", name: "BAN TERJUAL" }
          ],
          saleOrders: [
            {
              id: "order-active",
              sparepartId: "part-order",
              sparepartName: "BAN DALAM ORDER",
              sparepartPjpp: "PJPP-ORDER",
              branchName: "SPI RANGKASBITUNG",
              buyerName: "Pembeli A",
              buyerType: "PELANGGAN_UMUM",
              buyerTypeLabel: "Pelanggan Umum",
              price: 10000,
              saleDate: "2026-05-25T00:00:00.000Z",
              status: "APPROVAL",
              statusLabel: "Approval",
              createdAt: "2026-05-25T00:00:00.000Z",
              updatedAt: "2026-05-25T00:00:00.000Z"
            },
            {
              id: "order-sold",
              sparepartId: "part-sold",
              sparepartName: "BAN TERJUAL",
              sparepartPjpp: "PJPP-SOLD",
              branchName: "SPI RANGKASBITUNG",
              buyerName: "Pembeli B",
              buyerType: "PELANGGAN_UMUM",
              buyerTypeLabel: "Pelanggan Umum",
              price: 12000,
              saleDate: "2026-05-25T00:00:00.000Z",
              status: "TERJUAL",
              statusLabel: "Terjual",
              createdAt: "2026-05-25T00:00:00.000Z",
              updatedAt: "2026-05-25T00:00:00.000Z"
            }
          ]
        })}
      />
    );

    await user.click(screen.getByRole("button", { name: /Layak Jual/ }));
    const page = content();

    expect(page.getByText("BAN READY")).toBeInTheDocument();
    expect(page.getByRole("button", { name: "Jual" })).toBeInTheDocument();
    expect(page.getAllByText("BAN DALAM ORDER").length).toBeGreaterThan(0);
    expect(page.getByText("Dalam Order")).toBeInTheDocument();
    expect(page.getAllByText("BAN TERJUAL").length).toBeGreaterThan(0);
    expect(page.getAllByText("Terjual").length).toBeGreaterThan(0);
    expect(page.getByText("Pipeline Order Sparepart")).toBeInTheDocument();
    expect(page.getByText("Pembeli A - 25 Mei 2026")).toBeInTheDocument();
  });

  it("calculates used goods sale availability from active and sold order quantities", async () => {
    const user = userEvent.setup();
    render(
      <BarkasApp
        initialData={makeInitialData({
          usedGoods: [
            { ...usedGoods[0], id: "bb-sisa", code: "BB-SISA", name: "Kardus Sisa", qty: 10 },
            { ...usedGoods[1], id: "bb-habis", code: "BB-HABIS", name: "Paku Habis", qty: 5 },
            { ...usedGoods[0], id: "bb-order", code: "BB-ORDER", name: "Kardus Dalam Order", qty: 12 }
          ],
          usedGoodsSaleOrders: [
            {
              id: "bb-order-sold-partial",
              usedGoodsId: "bb-sisa",
              usedGoodsCode: "BB-SISA",
              usedGoodsName: "Kardus Sisa",
              categoryLabel: "Kardus & Karton",
              branchName: "Sirclo",
              qty: 4,
              unitLabel: "pcs",
              buyerName: "Pembeli Sisa",
              price: 40000,
              saleDate: "2026-05-25T00:00:00.000Z",
              status: "TERJUAL",
              statusLabel: "Terjual",
              notes: null,
              createdAt: "2026-05-25T00:00:00.000Z",
              updatedAt: "2026-05-25T00:00:00.000Z"
            } as any,
            {
              id: "bb-order-sold-full",
              usedGoodsId: "bb-habis",
              usedGoodsCode: "BB-HABIS",
              usedGoodsName: "Paku Habis",
              categoryLabel: "Besi & Logam",
              branchName: "GW Cargo TGR",
              qty: 5,
              unitLabel: "kg",
              buyerName: "Pembeli Habis",
              price: 50000,
              saleDate: "2026-05-25T00:00:00.000Z",
              status: "TERJUAL",
              statusLabel: "Terjual",
              notes: null,
              createdAt: "2026-05-25T00:00:00.000Z",
              updatedAt: "2026-05-25T00:00:00.000Z"
            } as any,
            {
              id: "bb-order-active",
              usedGoodsId: "bb-order",
              usedGoodsCode: "BB-ORDER",
              usedGoodsName: "Kardus Dalam Order",
              categoryLabel: "Kardus & Karton",
              branchName: "Sirclo",
              qty: 3,
              unitLabel: "pcs",
              buyerName: "Pembeli Order",
              price: 30000,
              saleDate: "2026-05-25T00:00:00.000Z",
              status: "APPROVAL",
              statusLabel: "Approval",
              notes: null,
              createdAt: "2026-05-25T00:00:00.000Z",
              updatedAt: "2026-05-25T00:00:00.000Z"
            } as any
          ]
        })}
      />
    );

    await user.click(screen.getByRole("button", { name: /Layak Jual/ }));
    await user.click(content().getByRole("button", { name: "Barang Bekas" }));
    const page = content();

    expect(page.getByText("Qty Awal")).toBeInTheDocument();
    expect(page.getByText("Qty Tersedia")).toBeInTheDocument();
    expect(page.getAllByText("Kardus Sisa").length).toBeGreaterThan(0);
    expect(page.getByRole("button", { name: "Jual Sisa" })).toBeInTheDocument();
    expect(page.getAllByText("Paku Habis").length).toBeGreaterThan(0);
    expect(page.getByText("Habis")).toBeInTheDocument();
    expect(page.getAllByText("Kardus Dalam Order").length).toBeGreaterThan(0);
    expect(page.getByText("Dalam Order")).toBeInTheDocument();
    expect(page.getByText("Order Barang Bekas")).toBeInTheDocument();
    expect(page.getByText(/Pembeli Order/)).toBeInTheDocument();
  });

  it("renders branch dashboard and hides Layak Jual for cabang roles", async () => {
    const user = userEvent.setup();
    renderBranchApp();

    expect(content().getByText("Dashboard Cabang")).toBeInTheDocument();
    expect(screen.getByText("Sirclo - data operasional cabang sendiri")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Layak Jual/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Input Barang$/ }));
    let modal = activeModal();
    await user.click(modal.getByText("Barang Bekas / Material"));
    await user.click(modal.getByRole("button", { name: "Lanjut" }));
    modal = activeModal();
    expect(modal.getByDisplayValue("Sirclo")).toHaveAttribute("readonly");
  });
});
