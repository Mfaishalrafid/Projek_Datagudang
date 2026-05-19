import clsx from "clsx";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({
  open,
  title,
  subtitle,
  children,
  footer,
  onClose,
  wide = false
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className={clsx("modal-overlay", open && "open")} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={clsx("modal-panel", wide && "modal-wide")}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle ? <div className="modal-subtitle">{subtitle}</div> : null}
          </div>
          <button className="modal-close icon-button" onClick={onClose} type="button" title="Tutup">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
