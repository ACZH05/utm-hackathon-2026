"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Box,
  Settings,
  FileText,
  Leaf,
  Activity
} from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Digital Twin", href: "/digital-twin", icon: Box },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Statistics", href: "/statistics", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform sm:translate-x-0 flex flex-col justify-between">
      <div>
        <div className="flex flex-col items-center justify-center pt-10 pb-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 mb-3 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Leaf className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-lg font-bold tracking-wider">FARM OPS</h2>
          <p className="text-xs text-sidebar-foreground/70">admin@agritwin.com</p>
        </div>

        <nav className="pl-6 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-6 py-4 rounded-l-[24px] text-sm font-medium transition-colors",
                  isActive
                    ? "bg-background text-sidebar mr-[-1px]"
                    : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-sidebar-foreground"
                )}
              >
                {isActive && (
                  <>
                    {/* Top concave corner using CSS shadow trick */}
                    <div className="absolute -top-6 right-0 w-6 h-6 bg-transparent rounded-br-[24px] shadow-[6px_6px_0_6px_var(--background)] pointer-events-none" />
                    {/* Bottom concave corner using CSS shadow trick */}
                    <div className="absolute -bottom-6 right-0 w-6 h-6 bg-transparent rounded-tr-[24px] shadow-[6px_-6px_0_6px_var(--background)] pointer-events-none" />
                  </>
                )}
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "")} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-6">
        <div className="bg-white/5 rounded-2xl p-4 relative overflow-hidden">
          {/* Decorative Plant Vector SVG */}
          <svg className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,22C12,22 12,16 16,12C20,8 22,4 22,4C22,4 18,6 14,10C10,14 12,22 12,22M12,22C12,22 12,16 8,12C4,8 2,4 2,4C2,4 6,6 10,10C14,14 12,22 12,22Z" />
          </svg>
          <h3 className="text-xs uppercase tracking-widest text-sidebar-foreground/50 mb-3 font-semibold relative z-10">System Status</h3>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium">All Systems Nominal</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
