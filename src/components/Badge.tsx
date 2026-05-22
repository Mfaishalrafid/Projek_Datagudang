import clsx from "clsx";
import type { ReactNode } from "react";

type BadgeTone =
  | "saleable"
  | "damaged"
  | "category"
  | "branch-rangkas"
  | "branch-ciputat"
  | "branch-cikokol"
  | "vehicle"
  | "amber"
  | "approval"
  | "sold"
  | "cancelled";

const toneClass: Record<BadgeTone, string> = {
  saleable: "badge-saleable",
  damaged: "badge-damaged",
  category: "badge-category",
  "branch-rangkas": "badge-branch-rangkas",
  "branch-ciputat": "badge-branch-ciputat",
  "branch-cikokol": "badge-branch-cikokol",
  vehicle: "badge-vehicle",
  amber: "badge-amber",
  approval: "badge-approval",
  sold: "badge-sold",
  cancelled: "badge-damaged"
};

export function branchTone(branchName: string): BadgeTone {
  if (branchName.includes("RANGKAS")) return "branch-rangkas";
  if (branchName.includes("CIPUTAT")) return "branch-ciputat";
  if (branchName.includes("CIKOKOL")) return "branch-cikokol";
  return "category";
}

export function Badge({
  children,
  tone = "category",
  dot = false,
  className
}: {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span className={clsx("badge", toneClass[tone], className)}>
      {dot ? <span className="badge-dot" /> : null}
      {children}
    </span>
  );
}
