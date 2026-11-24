"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Script from "next/script";
import RockScene from "./RockScene";

declare global {
  interface Window {
    Cal?: {
      (...args: unknown[]): void;
      ns: Record<string, (...args: unknown[]) => void>;
    };
  }
}

const EMAIL = "harshul@gatech.edu";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // Fallback for browsers/contexts without the async clipboard API.
      const ta = document.createElement("textarea");
      ta.value = EMAIL;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <main>
        <h1>Harshul Basava</h1>
        <p className="email">
          harshul [at] gatech [dot] edu
          <span className="email-copy-wrap">
            <button
              type="button"
              className="email-copy"
              onClick={copyEmail}
              aria-label="Copy email address"
              title="Copy email"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.2-7.47 4.67a1 1 0 0 1-1.06 0L4 8.2V6l8 5 8-5v2.2z" />
              </svg>
            </button>
            <span className={`email-copied${copied ? " show" : ""}`} aria-hidden="true">
              Copied!
            </span>
            <span className="sr-only" aria-live="polite">
              {copied ? "Email copied to clipboard" : ""}
            </span>
          </span>
        </p>
      </main>

      <div className="headshot-container">
        <div className="headshot-wrap">
          <div className="headshot-frame">
            <Image
              className="headshot"
              src="/headshot.JPG"
              alt="Harshul Basava"
              fill
              sizes="300px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          {/* Draggable korok layer, anchored to the photo so it tracks the
              photo across monitor sizes / zoom. Positions are photo-relative. */}
          <RockScene />
        </div>
        <p className="headshot-note">
          [koroks lead to link
          <svg
            className="triforce-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <polygon points="12,2 7,11 17,11" />
            <polygon points="7,11 2,20 12,20" />
            <polygon points="17,11 12,20 22,20" />
          </svg>
          ]
        </p>
      </div>

      <Script src="https://app.cal.com/embed/embed.js" strategy="afterInteractive" />
      <Script id="cal-init" strategy="afterInteractive">
        {`
          (function (C, A, L) {
            let p = function (a, ar) { a.q.push(ar); };
            let d = C.document;
            C.Cal = C.Cal || function () {
              let cal = C.Cal;
              let ar = arguments;
              if (!cal.loaded) {
                cal.ns = {};
                cal.q = cal.q || [];
                cal.loaded = true;
              }
              if (ar[0] === L) {
                const api = function () { p(api, arguments); };
                const namespace = ar[1];
                api.q = api.q || [];
                if (typeof namespace === "string") {
                  cal.ns[namespace] = cal.ns[namespace] || api;
                  p(cal.ns[namespace], ar);
                  p(cal, ["initNamespace", namespace]);
                } else p(cal, ar);
                return;
              }
              p(cal, ar);
            };
          })(window, "https://app.cal.com/embed/embed.js", "init");
          Cal("init", "mtg", { origin: "https://app.cal.com" });
          Cal.ns.mtg("ui", { hideEventTypeDetails: false, layout: "month_view" });
        `}
      </Script>
    </>
  );
}
