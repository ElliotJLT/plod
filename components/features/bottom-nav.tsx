"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sun, List } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    { name: "Today", href: "/", icon: Sun },
    { name: "Runs", href: "/runs", icon: List },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background">
      <div className="flex h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors"
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-accent" : "text-muted-foreground"
                }`}
                strokeWidth={1.5}
              />
              <span
                className={`text-xs ${
                  isActive ? "text-accent font-medium" : "text-muted-foreground"
                }`}
              >
                {tab.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
