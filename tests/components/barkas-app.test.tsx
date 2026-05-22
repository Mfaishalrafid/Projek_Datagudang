import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BarkasApp } from "@/components/BarkasApp";
import { makeInitialData } from "../fixtures";

const actionMocks = vi.hoisted(() => ({
  createSaleOrder: vi.fn(),
  createSparepart: vi.fn(),
  createUsedGoods: vi.fn(),
  deleteSparepart: vi.fn(),
  deleteUsedGoods: vi.fn(),
  updateSaleOrderStatus: vi.fn(),
  updateSparepart: vi.fn()
}));

vi.mock("@/app/actions", () => actionMocks);

function renderApp() {
  return render(<BarkasApp initialData={makeInitialData()} />);
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

  it("shows used goods inventory tab summaries", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Inventori & Stok" }));
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
});
