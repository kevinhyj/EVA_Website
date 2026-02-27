import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/evaweb_logo.png"
                alt="EVA Logo"
                width={140}
                height={35}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The first Generative Foundation Model for RNA design.
              Unifying the RNA world through advanced AI technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/design"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Web Server
                </Link>
              </li>
              {/*          
              <li>
                <Link
                  href="#technical"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Technical Report
                </Link>
              </li>
              */}
              <li>
                <Link
                  href="#team"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Citation Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Connect
            </h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              >
                <Github className="w-5 h-5 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              >
                <Twitter className="w-5 h-5 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              >
                <Mail className="w-5 h-5 text-muted-foreground" />
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              contact@eva.ai
            </p>
          </div>
        </div>

        {/* University Logos / Affiliations */}
        <div className="border-t border-border pt-8 mb-8">
          <p className="text-xs text-muted-foreground text-center mb-4">
            Developed by researchers from
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="px-4 py-2 rounded-lg bg-muted/30 text-sm text-muted-foreground">
              Xi&apos;an Jiaotong University
            </div>
            <div className="px-4 py-2 rounded-lg bg-muted/30 text-sm text-muted-foreground">
              Fudan University
            </div>
            <div className="px-4 py-2 rounded-lg bg-muted/30 text-sm text-muted-foreground">
              Shanghai AI Laboratory
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} EVA. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
