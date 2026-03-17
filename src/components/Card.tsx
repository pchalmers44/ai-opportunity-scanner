import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 text-[color:var(--card-foreground)] shadow-sm shadow-zinc-950/5 transition-shadow hover:shadow-md hover:shadow-zinc-950/10 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}