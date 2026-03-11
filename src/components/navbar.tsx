"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Github,
  Menu,
  X,
  Rocket,
  FileText,
  Users,
  Home,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "#design", label: "Web Server", icon: Rocket },
  { href: "https://github.com/kevinhyj/EVA1", label: "Github", icon: FileText },
  { href: "#team", label: "Team", icon: Users },
  { href: "/eva2", label: "EVA2", icon: Users },
];

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLightSection, setIsLightSection] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleDesignClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const currentPath = window.location.pathname;
    const isHomePage = currentPath === "/" || currentPath === "";
    if (isHomePage) {
      // On home page, scroll to team section
      const designElement = document.getElementById("features");
      if (designElement) {
        designElement.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Fallback: scroll to bottom of page
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      }
    } else {
      // On other pages, navigate to home with hash
      window.location.href = "/#design";
    }
  }, []);
  const handleTeamClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const currentPath = window.location.pathname;
    const isHomePage = currentPath === "/" || currentPath === "";
    if (isHomePage) {
      // On home page, scroll to team section
      const scrollYBefore = window.scrollY;
      const teamElement = document.getElementById("team");
      if (teamElement) {
        teamElement.scrollIntoView({ behavior: "smooth", block: "start" });
        if (scrollYBefore < 1000) {
          setTimeout(() => {
            teamElement.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 2500);
        }
      } else {
        // Fallback: scroll to bottom of page
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
        if (scrollYBefore < 1000) {
          setTimeout(() => {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
          }, 2500);
        }
      }
    } else {
      // On other pages, navigate to home with hash
      window.location.href = "/#team";
    }
  }, []);

  const handleHomeClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const currentPath = window.location.pathname;

    if (currentPath === "/" || currentPath === "") {
      // Already on home page, scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Navigate to home page
      window.location.href = "/";
    }
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
    // Switch to light theme when scrolled past ~80% of hero (250vh * 0.8)
    setIsLightSection(latest > window.innerHeight * 2);
  });

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-colors duration-300",
        isScrolled ? "glass-nav py-3" : "py-5",
        isLightSection && isScrolled ? "theme-light" : ""
      )}
      style={{
        background: !isScrolled ? 'transparent' : undefined,
        borderBottom: !isScrolled ? 'none' : undefined,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/evaweb_logo.png"
              alt="EVA Logo"
              width={160}
              height={40}
              className="h-10 w-auto"
              style={isLightSection && isScrolled ? { filter: 'brightness(0.3)' } : undefined}
              priority
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            if (link.href === "#team") {
              return (
                <button
                  type="button"
                  key={link.href}
                  onClick={handleTeamClick}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 relative group cursor-pointer",
                    isLightSection && isScrolled
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </button>
              );
            }
            if (link.href === "#design") {
              return (
                <button
                  type="button"
                  key={link.href}
                  onClick={handleDesignClick}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 relative group cursor-pointer",
                    isLightSection && isScrolled
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </button>
              );
            }
            if (link.href === "/") {
              return (
                <button
                  type="button"
                  key={link.href}
                  onClick={handleHomeClick}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 relative group cursor-pointer",
                    pathname === link.href
                      ? "text-primary"
                      : isLightSection && isScrolled
                        ? "text-slate-600 hover:text-slate-900"
                        : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </button>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200 relative group",
                  pathname === link.href
                    ? "text-primary"
                    : isLightSection && isScrolled
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* GitHub Link 
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <Github className={cn(
              "w-5 h-5 transition-colors",
              isLightSection && isScrolled ? "text-slate-500 hover:text-slate-800" : "text-muted-foreground hover:text-foreground"
            )} />
          </Link>
          */}
          {/* Get Started Button */}
          <Link
            href="/design"
            className="relative px-5 py-2 rounded-full font-medium text-sm overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity" />
            <span className="relative text-white flex items-center gap-2">
              Get Started
              <Rocket className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-muted/50 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={cn("w-6 h-6", isLightSection && isScrolled ? "text-slate-700" : "")} />
          ) : (
            <Menu className={cn("w-6 h-6", isLightSection && isScrolled ? "text-slate-700" : "")} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "md:hidden absolute top-full left-0 right-0 glass-nav border-t border-border",
            isLightSection ? "theme-light" : ""
          )}
        >
          <nav className="flex flex-col py-4">
            {navLinks.map((link, i) => {
              if (link.href === "#design") {
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        handleDesignClick(e);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-6 py-3 text-base font-medium transition-colors w-full cursor-pointer",
                        "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </button>
                  </motion.div>
                );
              }
              if (link.href === "#team") {
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        handleTeamClick(e);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-6 py-3 text-base font-medium transition-colors w-full cursor-pointer",
                        "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </button>
                  </motion.div>
                );
              }
              if (link.href === "/") {
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        handleHomeClick(e);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-6 py-3 text-base font-medium transition-colors w-full cursor-pointer",
                        pathname === link.href
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </button>
                  </motion.div>
                );
              }
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 text-base font-medium transition-colors",
                      pathname === link.href
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navLinks.length * 0.1 }}
              className="px-6 pt-4"
            >
              <Link
                href="/design"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Rocket className="w-5 h-5" />
                Get Started
              </Link>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
