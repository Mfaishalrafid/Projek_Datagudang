import type { BranchDTO } from "@/lib/types";
import { categoryOptions, conditionOptions, vehicleTypeOptions } from "@/data/options";
import type { Category, Condition, VehicleType } from "@prisma/client";

export type FilterState = {
  query: string;
  condition: "" | Condition;
  category: "" | Category;
  branchId: string;
  vehicleType: "" | VehicleType;
};

export function FilterBar({
  value,
  branches,
  count,
  onChange
}: {
  value: FilterState;
  branches: BranchDTO[];
  count: number;
  onChange: (value: FilterState) => void;
}) {
  return (
    <div className="filter-bar">
      <select className="filter-control" value={value.condition} onChange={(event) => onChange({ ...value, condition: event.target.value as FilterState["condition"] })}>
        <option value="">Semua Kondisi</option>
        {conditionOptions.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <select className="filter-control" value={value.category} onChange={(event) => onChange({ ...value, category: event.target.value as FilterState["category"] })}>
        <option value="">Semua Kategori</option>
        {categoryOptions.map((item) => (
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
      <select className="filter-control" value={value.vehicleType} onChange={(event) => onChange({ ...value, vehicleType: event.target.value as FilterState["vehicleType"] })}>
        <option value="">Semua Jenis</option>
        {vehicleTypeOptions.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <input
        className="filter-input"
        placeholder="Cari nama / PJPP / nopol..."
        value={value.query}
        onChange={(event) => onChange({ ...value, query: event.target.value })}
      />
      <span className="filter-count">{count} data</span>
    </div>
  );
}
