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
            <a href="https://sparai.org/projects/f26/recrMjUJvwDNnEZlK/" target="_blank" rel="noopener">
              mentor
            </a>
            ,{" "}
            <a href="https://openreview.net/forum?id=TqreAmqOzE" target="_blank" rel="noopener">
              research
            </a>{" "}
            at{" "}
            <a href="https://sparai.org" target="_blank" rel="noopener">
              SPAR
            </a>
          </li>
          <li>
            organizing{" "}
            <a href="https://dcminiconf.com" target="_blank" rel="noopener">
              DCMC 2.0
            </a>
          </li>
          <li>
            prev. operations at{" "}
            <a href="https://secondlookresearch.com" target="_blank" rel="noopener">
              Second Look
            </a>
          </li>
        </ul>
        <p className="section-header">Writing</p>
        <ul className="sub-items">
          <li>
            <a href="https://www.lesswrong.com/posts/KxbeqePFBooJteoeC/what-is-openai-s-mission-advisory-council-1" target="_blank" rel="noopener">
              What is OpenAI's Mission Advisory Council?
            </a>
          </li>
          <li>
            <a href="https://www.lesswrong.com/posts/wiFv6LguphSxkzAnb/psa-we-can-do-better" target="_blank" rel="noopener">
              PSA: We can do better
            </a>
          </li>
          <li>
            <a href="https://www.lesswrong.com/posts/oKxc8maZGtnzgpNzx/rerunning-ai-safety-papers-on-every-frontier-release-would-1" target="_blank" rel="noopener">
              Rerunning AI safety papers on every frontier release would be pretty easy and valuable
            </a>
          </li>
          <li>
            <a href="https://www.lesswrong.com/posts/CfqLNt6jgb9xrixf4/arguments-for-and-against-me-dropping-out" target="_blank" rel="noopener">
              Arguments for and against (me) dropping out
            </a>
          </li>
          <li>
            <a href="https://www.lesswrong.com/posts/DgLGD3A5CZXH7hbzP/georgia-tech-ai-safety-initiative-retrospective-2025-2026" target="_blank" rel="noopener">
              Georgia Tech AI Safety Initiative Retrospective 2025-2026
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
