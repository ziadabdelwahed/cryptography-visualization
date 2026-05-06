"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROJECT, NAV_LINKS } from "@/config";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1.5" />
            <rect x="11" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            <rect x="1" y="11" width="8" height="8" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            <rect x="11" y="11" width="8" height="8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {PROJECT.shortName}
          <span>/ {PROJECT.developer}</span>
        </Link>

        {/* Links */}
        <div className="navbar-links">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${isActive ? " active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}