export function ProgressBar({
  value,
  max,
  color = "var(--blue)"
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const width = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${width}%`, background: color }} />
    </div>
  );
}

export function ProgressRow({
  label,
  value,
  max,
  color = "var(--blue)"
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  return (
    <div className="progress-row">
      <div className="progress-row-head">
        <span>{label}</span>
        <strong style={{ color }}>{value}</strong>
      </div>
      <ProgressBar value={value} max={max} color={color} />
    </div>
  );
}
