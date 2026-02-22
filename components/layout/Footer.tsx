// components/layout/Footer.tsx
import Link from "next/link";

// Moved the link structures locally to guarantee proper href wiring for your pages
const FOOTER_SECTIONS = {
  destinations: [
    { label: "All Destinations", href: "/destinations" },
    { label: "Europe", href: "/destinations" },
    { label: "Asia", href: "/destinations" },
    { label: "Africa", href: "/destinations" },
    { label: "The Americas", href: "/destinations" },
  ],
  company: [
    { label: "About NOMA", href: "/company" },
    { label: "Preferred Partners", href: "/partners" },
    { label: "Travel Categories", href: "/categories" },
    { label: "Careers", href: "/company" },
  ],
  support: [
    { label: "Contact Us", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Booking Terms", href: "#" },
    { label: "Accessibility", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-foreground text-background pt-16 pb-8 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Destinations */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-6">
              Destinations
            </h3>
            <ul className="space-y-3">
              {FOOTER_SECTIONS.destinations.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-6">
              Company
            </h3>
            <ul className="space-y-3">
              {FOOTER_SECTIONS.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-6">
              Support
            </h3>
            <ul className="space-y-3">
              {FOOTER_SECTIONS.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-6">
              Stay Inspired
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe for curated travel guides and exclusive offers.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border-b border-gray-600 text-white placeholder:text-gray-500 py-2 w-full focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="text-sm text-gray-400 hover:text-white transition-colors text-left mt-1"
              >
                Subscribe →
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 border-t border-gray-800 pt-8">
          <p>© 2026 NOMA Travel Agency. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}