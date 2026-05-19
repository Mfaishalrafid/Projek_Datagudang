import clsx from "clsx";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

export type ToastItem = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
};

export function ToastStack({ items }: { items: ToastItem[] }) {
  return (
    <div className="toast-wrap">
      {items.map((item) => {
        const Icon = iconMap[item.type] || AlertCircle;
        return (
          <div className={clsx("toast", `toast-${item.type}`)} key={item.id}>
            <Icon size={16} />
            <span>{item.message}</span>
          </div>
        );
      })}
    </div>
  );
}
