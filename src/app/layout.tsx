import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import "./globals.css";

const geistSans = {
  variable: "font-sans",
  style: { fontFamily: "system-ui, sans-serif" },
};

const geistMono = {
  variable: "font-mono",
  style: { fontFamily: "monospace" },
};

export const metadata: Metadata = {
  title: "EVA - Evolutionary Versatile Architect",
  description:
    "Unified RNA Generative model for RNA design.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

// Initial loading SVG - pure HTML, no JS required
const InitialLoadingSVG = `
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
  <defs>
    <linearGradient id="initGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#03b2f1"/>
      <stop offset="100%" stop-color="#f87904"/>
    </linearGradient>
  </defs>
  <g class="ring">
    <path fill="url(#initGrad)" d="M15.5,62.5c-1.7-4.6-2.6-9.6-2.6-14.8C12.9,22.1,33.1,1.9,58.7,1.9c5.7,0,11.1,1.1,16,3.1c2.3-.4,5.1-.8,7.9-1C75.6,0,67.4-2.4,58.7-2.4C32.1-2.4,10.5,19.2,10.5,45.8c0,4.7.7,9.3,2,13.6c1.4.3,3.2.7,5,1.2z" transform="translate(-5, 5) scale(1.05)" opacity="0.8"/>
    <path fill="url(#initGrad)" d="M93.5,52.7c-2.9,20.9-20.9,37-42.6,37c-11.5,0-21.9-4.5-29.6-11.9c-2.2-.5-4.9-1.1-7.5-1.7c8.7,10.9,22.1,18,37.1,18c26.1,0,47.4-21.3,47.4-47.4c0-.1,0-.3,0-.4c-1.1,2-2.7,4.4-4.8,6.4z" transform="translate(-5, 5) scale(1.05)" opacity="0.8"/>
  </g>
  <path fill="url(#initGrad)" d="M93.2,29.1c3.5,4.7,3.4,12.8.1,17.8c-3.9,5.8-10,8.4-17.6,6.5c-7.2-1.8-14.1-4.5-21.1-6.9c-6.2-2.2-12.5-3.4-19-1.8c-7.7,2-12.8,8.2-13.6,16.1c-.1.6-.2,1.1-.3,1.9c-2.6-.7-5.1-1.3-7.6-2.2c-.5-.2-1-1.3-1-2c-.1-8.8,1.6-17.1,7.7-23.9c5.1-5.7,11.6-8.2,19.4-6.9c6.2,1,11.7,4,17.3,6.5c5.7,2.5,11.6,4.8,17.6,6.7c2.7.8,5.8.7,8.7.4c4.8-.5,8.1-4.3,8.9-9.7c.1-.7.2-1.4.3-2.5z" transform="translate(-5, 5) scale(1.05)"/>
  <path fill="url(#initGrad)" d="M-5.8,66.9c4.2-1.3,8.5-1.5,12.8-1.4c5.6.2,10.8,1.5,15.9,3.5c5,2,10,3.3,15.4,3.1c6-.3,10.7-3,13.9-7.8c2.2-3.3,3.8-6.9,5.9-10.7c2.7.8,5.7,1.7,8.7,2.8c.5.2,1,1.7.8,2.3c-2.2,6.4-5.7,11.9-10.4,16.8c-4.2,4.4-9.4,6.2-15,6.5c-3.1.2-6.4-1-9.4-2.1c-3.9-1.5-7.7-3.6-11.4-5.6c-8.3-4.4-17.1-6.7-26.4-7.3c-.3,0-.6-.1-.9-.1z" transform="translate(-5, 5) scale(1.05)" opacity="0.9"/>
  <path fill="url(#initGrad)" d="M96.3,15.3c-2-.4-3.9-.9-5.9-1.3c-11.7-2.5-20.8,4.8-20.1,16.1c0,.7,0,1.5,0,2.5c-1-.1-1.9,0-2.6-.3c-2.3-.9-4.7-1.9-6.9-3.1c-1.6-.9-2.3-2.2-2.1-4.3c1.1-12.7,12.1-20.6,24.3-17c4.2,1.2,8.1,3.7,12.1,5.6c.6.3,1.2.5,1.8.8c-.2.3-.5.6-.7.9z" transform="translate(-5, 5) scale(1.05)" opacity="0.85"/>
</svg>
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Inline script to hide loading after app loads - runs before React */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                var loader = document.getElementById('initial-loading');
                if (loader) {
                  setTimeout(function() {
                    loader.style.opacity = '0';
                    loader.style.pointerEvents = 'none';
                    // Do not remove the element to avoid hydration mismatch errors
                    // React expects this node to exist
                  }, 200);
                }
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Initial Loading - Pure HTML/CSS, shows before JS loads */}
        <div
          id="initial-loading"
          dangerouslySetInnerHTML={{
            __html: `
              <div class="initial-loading-icon">${InitialLoadingSVG}</div>
              <div class="initial-loading-text">Loading EVA...</div>
              <div class="initial-loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            `,
          }}
        />
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
