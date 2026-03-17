import Link from "next/link";
import { Container } from "./Container";

const footerLinks = {
  Product: [
    { label: "Scanner", href: "/" },
    { label: "Examples", href: "/#examples" },
    { label: "Results", href: "/#results" },
  ],
  Resources: [
    { label: "Docs", href: "/#docs" },
    { label: "API", href: "/#docs" },
    { label: "Changelog", href: "/#docs" },
  ],
  Company: [
    { label: "About", href: "/#about" },
    { label: "Security", href: "/#about" },
    { label: "Privacy", href: "/#about" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-white/60">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-3">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="space-y-3">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">{section}</div>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} Automation Scanner. Internal use only.
        </div>
      </Container>
    </footer>
  );
}