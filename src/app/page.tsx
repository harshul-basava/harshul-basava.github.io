"use client";

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

export default function Home() {
  return (
    <>
      <main>
        <h1>Harshul Basava</h1>
        <p className="email">harshul [at] gatech [dot] edu</p>
        <p>AI safety organizer at Georgia Tech.</p>
        <ul className="sub-items">
          <li>
            co-director at{" "}
            <a href="https://aisi.dev" target="_blank" rel="noopener">
              GT AISI
            </a>
          </li>
          <li>
            operations at{" "}
            <a href="https://secondlookresearch.com" target="_blank" rel="noopener">
              Second Look
            </a>
          </li>
          <li>
            research at{" "}
            <a href="https://sparai.org" target="_blank" rel="noopener">
              SPAR
            </a>
          </li>
        </ul>
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
