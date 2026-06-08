export type ModuleTabKey = "sparepart" | "usedGoods" | "sga";

const moduleTabs: Array<{ key: ModuleTabKey; label: string }> = [
  { key: "sparepart", label: "Sparepart" },
  { key: "usedGoods", label: "Barang Bekas" },
  { key: "sga", label: "SGA" }
];

export function ModuleTabs({
  value,
  onChange
}: {
  value: ModuleTabKey;
  onChange: (value: ModuleTabKey) => void;
}) {
  return (
    <div className="tabs">
      {moduleTabs.map((tab) => (
        <button
          className={value === tab.key ? "tab-btn active" : "tab-btn"}
          type="button"
          onClick={() => onChange(tab.key)}
          key={tab.key}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
