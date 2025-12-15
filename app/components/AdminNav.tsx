"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Icon({
  name,
  className,
}: {
  name: "home" | "apps" | "messages";
  className?: string;
}) {
  const cls = className ?? "w-5 h-5";
  if (name === "home") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "apps") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 3h7l3 3v15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M14 3v3h3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 11h6.5M8.5 14.5h6.5M8.5 18h4.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 15a4 4 0 0 1-4 4H8l-4 2V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8 8.5h8M8 12h8M8 15.5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AdminNav() {
  const pathname = usePathname() ?? "/";

  const items = [
    { href: "/dashboard", label: "Home", icon: "home" as const },
    { href: "/applications", label: "Applications", icon: "apps" as const },
    { href: "/messages", label: "Messages", icon: "messages" as const },
  ];

  return (
    <>
      {/* Desktop / tablet: inline nav */}
      <nav className="hidden sm:flex items-center gap-2 mt-4">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                "border border-white/20 hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30",
                active ? "bg-white/15" : "bg-transparent",
              ].join(" ")}
            >
              <Icon name={item.icon} className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile: fixed bottom icon nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-2">
          <div className="grid grid-cols-3">
            {items.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex flex-col items-center justify-center gap-1 py-3",
                    "text-xs font-medium transition",
                    active ? "text-[#005C89]" : "text-gray-600",
                  ].join(" ")}
                >
                  <Icon
                    name={item.icon}
                    className={active ? "w-5 h-5" : "w-5 h-5"}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}


