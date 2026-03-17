"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";
import { motion, useReducedMotion } from "./motion";

const links = [
  { label: "Home", href: "/" },
  { label: "Docs", href: "/#docs" },
  { label: "About", href: "/#about" },
] as const;

export function Navbar() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-white/70 backdrop-blur-md"
    >
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[color:var(--border)] bg-white shadow-sm shadow-zinc-950/5">
            <Image
              src="/betterscale-logo.png"
              alt="Betterscale logo"
              width={20}
              height={20}
              priority
            />
          </span>
          <span className="text-[color:var(--foreground)]">Betterscale Automation Scanner</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group relative rounded-lg px-3 py-2 text-sm text-[color:var(--muted)] transition-colors hover:bg-zinc-100 hover:text-[color:var(--foreground)]"
            >
              {l.label}
              <span className="pointer-events-none absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-[color:rgb(var(--brand-600))] transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>
      </Container>
    </motion.header>
  );
}