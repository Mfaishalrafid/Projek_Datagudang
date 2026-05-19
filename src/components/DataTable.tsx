import clsx from "clsx";
import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  emptyTitle = "Data tidak ditemukan",
  emptySubtitle
}: {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((row, index) => (
              <tr
                key={getRowKey(row)}
                className={clsx(onRowClick && "clickable-row")}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.cell(row, index)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <div className="empty-state">
                  <div className="empty-title">{emptyTitle}</div>
                  {emptySubtitle ? <div className="empty-subtitle">{emptySubtitle}</div> : null}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
