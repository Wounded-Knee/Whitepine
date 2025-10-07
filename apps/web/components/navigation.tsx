"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButton } from "@/components/auth-button"

const baseNavigation = [
  {
    name: "Dashboard",
    href: "/",
  },
  {
    name: "About",
    href: "/marketing/about-us",
  },
  {
    name: "Instruments of Power",
    href: "/instruments-of-power",
    children: [
      {
        name: "Economic Veto",
        href: "/instruments-of-power/economic-veto",
      },
    ],
  },
]

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navigation = React.useMemo(() => {
    const nav = [...baseNavigation]
    
    // Only add demo navigation items if user is logged in
    if (session) {
      nav.push({
        name: "Nodes",
        href: "/demo-nodes",
      })
      nav.push({
        name: "Tree",
        href: "/demo-tree",
      })
    }
    
    return nav
  }, [session])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-6">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              Whitepine
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            {navigation.map((item) => (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href as any}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === item.href || (item.children && item.children.some((child: any) => pathname === child.href))
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  {item.name}
                  {item.children && item.children.length > 0 && (
                    <span className="ml-1">▾</span>
                  )}
                </Link>
                {item.children && item.children.length > 0 && (
                  <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-50">
                    <div className="bg-background border rounded-md shadow-lg py-2 min-w-[200px]">
                      {item.children.map((child: any) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block px-4 py-2 text-sm transition-colors hover:bg-accent",
                            pathname === child.href
                              ? "bg-accent text-accent-foreground"
                              : "text-foreground/60 hover:text-foreground"
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
        
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <svg
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
              >
                <path
                  d="M3 5H11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M3 12H16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M3 19H21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col space-y-4">
              <Link 
                className="flex items-center space-x-2" 
                href="/"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="font-bold">Whitepine</span>
              </Link>
              <nav className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <div key={item.href}>
                    <Link
                      href={item.href as any}
                      className={cn(
                        "block px-3 py-2 text-sm font-medium transition-colors hover:text-foreground/80",
                        pathname === item.href
                          ? "text-foreground"
                          : "text-foreground/60"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                    {item.children && item.children.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child: any) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block px-3 py-2 text-sm transition-colors hover:text-foreground/80",
                              pathname === child.href
                                ? "text-foreground"
                                : "text-foreground/60"
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              <div className="pt-4 space-y-4">
                <ThemeToggle />
                <AuthButton fullWidth />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link className="mr-6 flex items-center space-x-2 md:hidden" href="/">
              <span className="font-bold">Whitepine</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  )
}
