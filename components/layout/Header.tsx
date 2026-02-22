// components/layout/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Destinations", href: "/destinations" },
  { label: "Categories", href: "/categories" },
  { label: "Partners", href: "/partners" },
  { label: "Company", href: "/company" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="flex justify-between items-center px-4 md:px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="text-2xl md:text-3xl font-serif text-foreground tracking-tight z-50">
          NOMA
        </Link>

        {/* Center Nav (Desktop only) */}
        <nav className="hidden md:flex">
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm uppercase tracking-widest text-foreground/80 hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-5 z-50">
          <button
            aria-label="Search"
            className="text-foreground/70 hover:text-foreground transition-colors p-2 md:p-0"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="#"
            className="hidden lg:inline-block text-sm uppercase tracking-widest hover:text-foreground/70 transition-colors"
          >
            Book with NOMA
          </Link>
          <Link
            href="#"
            className="hidden sm:inline-block rounded-none bg-foreground text-background px-6 py-3 text-sm uppercase tracking-widest hover:bg-foreground/90 transition-colors"
          >
            Advise
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground/70 hover:text-foreground p-2 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-lg">
          <nav className="flex flex-col py-4 px-6 gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm uppercase tracking-widest text-foreground/80 hover:text-foreground transition-colors py-3 border-b border-border/50 last:border-0"
              >
                {link.label}
              </Link>
            ))}
            
            <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-border/50">
              <Link
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm uppercase tracking-widest text-foreground/80 hover:text-foreground transition-colors py-2"
              >
                Book with NOMA
              </Link>
              <Link
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="sm:hidden text-center rounded-none bg-foreground text-background px-6 py-4 text-sm uppercase tracking-widest hover:bg-foreground/90 transition-colors"
              >
                Advise
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}