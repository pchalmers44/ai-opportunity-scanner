import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  id?: string;
};

export function Section({ children, title, subtitle, className, id }: SectionProps) {
  return (
    <section id={id} className={`py-12 sm:py-16 ${className ?? ""}`}>
      {(title || subtitle) && (
        <header className="mb-8 space-y-2">
          {title ? (
            <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </header>
      )}
      {children}
    </section>
  );
}