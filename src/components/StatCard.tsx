import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "blue" | "teal" | "red" | "amber" | "purple" | "green";

export function StatCard({
  label,
  value,
  meta,
  icon: Icon,
  tone = "blue"
}: {
  label: string;
  value: ReactNode;
  meta?: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className={clsx("stat-card", `stat-${tone}`)}>
      <div className="stat-bar" />
      <div className="stat-icon">
        <Icon size={17} strokeWidth={2.4} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {meta ? <div className="stat-meta">{meta}</div> : null}
    </div>
  );
}
