import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-500">
      {children}
    </div>
  );
}

export function LinkButton({
  href,
  children,
  variant = "default",
}: {
  href: string;
  children: ReactNode;
  variant?: "default" | "primary";
}) {
  return (
    <Link
      href={href}
      className={`btn ${variant === "primary" ? "btn-primary" : ""}`}
    >
      {children}
    </Link>
  );
}

const VISIBILITY_STYLES: Record<string, string> = {
  PUBLIC: "bg-green-100 text-green-800",
  INTERNAL: "bg-amber-100 text-amber-800",
};

export function VisibilityBadge({ visibility }: { visibility: string }) {
  return (
    <span className={`badge ${VISIBILITY_STYLES[visibility] ?? "bg-gray-100 text-gray-700"}`}>
      {visibility === "PUBLIC" ? "Public" : "Internal"}
    </span>
  );
}

export function Badge({
  children,
  className = "bg-gray-100 text-gray-700",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`badge ${className}`}>{children}</span>;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
