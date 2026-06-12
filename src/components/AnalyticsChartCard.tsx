import { Card } from "@/components/Card";
import { ProgressRow } from "@/components/ProgressBar";

const chartColors = ["var(--blue)", "var(--teal)", "var(--amber2)", "var(--red2)", "var(--purple)", "var(--orange)", "var(--green)"];

export function AnalyticsChartCard({
  title,
  entries,
  color
}: {
  title: string;
  entries: Array<{ label: string; total: number }>;
  color?: string;
}) {
  const max = Math.max(...entries.map((entry) => entry.total), 1);

  return (
    <Card title={title}>
      <div className="card-body progress-card-body">
        {entries.map((entry, index) => (
          <ProgressRow key={entry.label} label={entry.label} value={entry.total} max={max} color={color || chartColors[index % chartColors.length]} />
        ))}
      </div>
    </Card>
  );
}
