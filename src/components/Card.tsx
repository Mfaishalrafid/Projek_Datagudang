import type { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  action,
  children,
  className
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className ? `card ${className}` : "card"}>
      {title || subtitle || action ? (
        <div className="card-head">
          <div>
            {title ? <div className="card-title">{title}</div> : null}
            {subtitle ? <div className="card-subtitle">{subtitle}</div> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
