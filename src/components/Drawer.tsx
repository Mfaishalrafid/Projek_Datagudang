import clsx from "clsx";
import { Edit3, Printer, ShoppingCart, Trash2, X } from "lucide-react";
import { Badge, branchTone, type BadgeTone } from "@/components/Badge";
import { formatDate } from "@/lib/format";
import type { SparepartDTO } from "@/lib/types";
import type { ReactNode } from "react";

export function Drawer({
  sparepart,
  onClose,
  onSale,
  onEdit,
  onDelete,
  lockStatus,
  canSell = true,
  canDelete = true,
  onPrintLabel
}: {
  sparepart: SparepartDTO | null;
  onClose: () => void;
  onSale: (sparepart: SparepartDTO) => void;
  onEdit: (sparepart: SparepartDTO) => void;
  onDelete: (sparepart: SparepartDTO) => void;
  lockStatus?: {
    canEdit: boolean;
    canSell: boolean;
    label: string;
    tone: BadgeTone;
  } | null;
  canSell?: boolean;
  canDelete?: boolean;
  onPrintLabel: () => void;
}) {
  const open = Boolean(sparepart);
  const canEditItem = lockStatus?.canEdit ?? true;
  const canSellItem = lockStatus?.canSell ?? true;

  return (
    <>
      <div className={clsx("drawer-overlay", open && "open")} onClick={onClose} />
      <aside className={clsx("drawer", open && "open")}>
        {sparepart ? (
          <>
            <div className="drawer-head">
              <div>
                <div className="drawer-title">{sparepart.name}</div>
                <div className="drawer-subtitle">{sparepart.pjpp}</div>
              </div>
              <button className="icon-button drawer-x" onClick={onClose} type="button" title="Tutup drawer">
                <X size={16} />
              </button>
            </div>
            <div className="drawer-body">
              <section className="drawer-section">
                <div className="drawer-section-title">Informasi Lengkap</div>
                <div className="info-grid">
                  <Info label="No. PJPP" value={<span className="mono-blue">{sparepart.pjpp}</span>} />
                  <Info label="Tanggal Lepas" value={formatDate(sparepart.removedDate)} />
                  <Info label="Cabang" value={<Badge tone={branchTone(sparepart.branchName)}>{sparepart.branchName}</Badge>} />
                  <Info label="Kategori" value={<Badge>{sparepart.categoryLabel}</Badge>} />
                  <Info
                    label="Kondisi"
                    value={
                      <Badge tone={sparepart.condition === "LAYAK_JUAL" ? "saleable" : "damaged"} dot>
                        {sparepart.conditionLabel}
                      </Badge>
                    }
                  />
                  <Info label="Lokasi Simpan" value={sparepart.storageLocation} />
                </div>
              </section>
              <section className="drawer-section">
                <div className="drawer-section-title">Kendaraan</div>
                <div className="vehicle-box">
                  <span className="plate-chip plate-large">{sparepart.plateNumber}</span>
                  <div className="vehicle-meta">
                    <Badge tone="vehicle">{sparepart.vehicleCode}</Badge>
                    <strong>{sparepart.vehicleTypeLabel}</strong>
                  </div>
                </div>
              </section>
              <section className="drawer-section">
                <div className="drawer-section-title">Keterangan</div>
                <p className="drawer-note">{sparepart.notes || "Tidak ada keterangan tambahan."}</p>
              </section>
            </div>
            <div className="drawer-footer">
              {canSell && sparepart.condition === "LAYAK_JUAL" && canSellItem ? (
                <button className="btn btn-teal btn-sm" type="button" onClick={() => onSale(sparepart)}>
                  <ShoppingCart size={14} />
                  Buat Order Jual
                </button>
              ) : null}
              {!canEditItem && lockStatus ? (
                <Badge tone={lockStatus.tone} dot>{lockStatus.label}</Badge>
              ) : null}
              <button className="btn btn-ghost btn-sm" type="button" onClick={onPrintLabel}>
                <Printer size={14} />
                Print Label
              </button>
              {canEditItem ? (
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => onEdit(sparepart)}>
                  <Edit3 size={14} />
                  Edit
                </button>
              ) : null}
              {canDelete && canEditItem ? (
                <button className="btn btn-danger btn-sm" type="button" onClick={() => onDelete(sparepart)}>
                  <Trash2 size={14} />
                  Hapus
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="info-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
