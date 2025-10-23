"use client";

import React, { useEffect, useState, useRef } from "react";
import HTMLFlipBook from "react-pageflip";

// Use page-flip library for realistic book flip animations
export default function FlipBook({ pdfFile = "/book.pdf" }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("flip"); // 'flip' or 'pdf'
  const containerRef = useRef(null);
  const bookRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });

  // ResizeObserver to keep flipbook full-page responsive
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = Math.max(600, el.clientWidth);
      const h = Math.max(400, el.clientHeight);
      setDimensions({ width: w, height: h });
    };

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // flipSize determines the actual width/height passed to HTMLFlipBook so spreads fit the container
  const [flipSize, setFlipSize] = useState({ width: 1000, height: 600 });
  // show/hide the thumbnail column when hovering the button section
  const [controlsVisible, setControlsVisible] = useState(false);
  // Consider mobile layout when container is narrow
  // Allow forcing mobile via query param for testing: ?mobile=1 or ?mobile=true
  let forceMobile = false;
  let debugMode = false;
  if (typeof window !== "undefined") {
    try {
      const p = new URLSearchParams(window.location.search);
      const mv = p.get("mobile");
      const dv = p.get("debug");
      if (dv === "1" || dv === "true") debugMode = true;
      if (mv === "1" || mv === "true") forceMobile = true;
    } catch (e) {
      /* ignore */
    }
  }

  // Use a stateful, robust mobile detector (matchMedia + innerWidth + UA) so
  // real mobile devices and browser-resize events reliably toggle mobile mode.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const detect = () => {
      const byMedia = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
      const byInner = window.innerWidth <= 768;
      const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
      const byUa = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(ua);
      setIsMobile(Boolean(forceMobile || byMedia || byInner || byUa));
    };

    detect();
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => detect();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, [forceMobile]);

  // When on a narrow/mobile viewport, automatically switch to the native PDF view
  // so mobile devices show the normal PDF instead of the flip UI.
  useEffect(() => {
    if (isMobile) {
      if (viewMode !== "pdf") setViewMode("pdf");
    } else {
      // when returning to a wider viewport, automatically switch back to flip mode
      if (viewMode !== "flip") setViewMode("flip");
    }
  }, [isMobile]);

  // Recalculate flipSize when pages load or container dimensions change
  useEffect(() => {
    if (!pages.length) return;
    const el = containerRef.current;
    if (!el) return;

    // create an Image to determine page aspect ratio
    const img = new Image();
    img.src = pages[0];
    img.onload = () => {
      const aspect = img.naturalWidth / img.naturalHeight || 1;
      const gutter = 24; // match spreadStyle gap
      const padding = 48; // outer padding

  const containerW = Math.max(200, el.clientWidth - padding * 2);
  const containerH = Math.max(200, el.clientHeight - padding * 2);

  // available width for both pages (subtract gutter)
  const availableW = Math.max(100, containerW - gutter);

  // maximum total width allowed by container height based on aspect ratio of two pages
  const maxTotalWidthByHeight = containerH * (aspect * 2);

  // choose the smaller width so the spread fits both width and height
  const totalWidth = Math.min(availableW, maxTotalWidthByHeight);
      const totalHeight = Math.min(containerH, totalWidth / (2 * aspect));

      setFlipSize({ width: Math.round(totalWidth), height: Math.round(totalHeight) });
    };
  }, [pages, dimensions]);

  // No imperative PageFlip init — we'll render using react-pageflip component
  useEffect(() => {
    // ensure a stable worker path for pdf.js: copy a worker into /public/pdf.worker.mjs
    // prefer built worker path; if not present, fallback to /pdf.worker.mjs which the project may supply
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/build/pdf");
        // set stable worker path for bundlers
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // keydown handler — control the page-flip instance
  useEffect(() => {
    const onKey = (e) => {
      if (viewMode !== "flip") return;
      // prevent page from scrolling when using arrow keys
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        // don't prevent when focus is on inputs
        const tag = (e.target && e.target.tagName) || "";
        const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(tag) || (e.target && e.target.isContentEditable);
        if (!isInput) e.preventDefault();
      }
      if (e.key === "ArrowLeft") boundedPrev();
      if (e.key === "ArrowRight") boundedNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // lock body scroll while the flipbook is active (flip view)
  // Preserve the original body overflow and restore it when appropriate.
  // Use both `viewMode` and `isMobile` in deps so we react when mobile detection changes.
  const originalBodyOverflow = useRef(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (originalBodyOverflow.current === null) {
      originalBodyOverflow.current = document.body.style.overflow || "";
    }

    // only lock body when flip view is active on non-mobile — PDF uses native scrolling
    if (viewMode === "flip" && !isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      // restore to the originally observed overflow value
      document.body.style.overflow = originalBodyOverflow.current;
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow.current;
    };
  }, [viewMode, isMobile]);

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      setPages([]);

      try {
        // dynamic import to avoid SSR/bundler issues
        const pdfjs = await import("pdfjs-dist/build/pdf");
        // Attempt to set the worker in the most compatible way:
        // 1) Try to dynamically import the worker entry (works with many bundlers)
        // 2) Fallback to a static file served from /public (public/pdf.worker.min.js)
        try {
          let workerSrc = null;
          try {
            const workerModule = await import(
              "pdfjs-dist/legacy/build/pdf.worker.entry"
            );
            // some bundlers export the worker URL as default, others as module
            workerSrc = workerModule?.default || workerModule;
          } catch (e) {
            // dynamic import of worker entry may fail on some bundlers (Turbopack).
            workerSrc = null;
          }

          if (workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
          } else {
            // prefer the minified worker filename that pdf.js commonly requests
            pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
          }
        } catch (err) {
          // last-resort: do nothing and let pdf.js attempt to use fake worker (may fail)
          console.warn("Could not configure pdfjs worker, falling back to default:", err);
        }

        const loadingTask = pdfjs.getDocument(pdfFile);
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const images = [];

        // target width/height to fit flipbook
        const targetWidth = 800;

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          const scale = targetWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = Math.round(scaledViewport.width);
          canvas.height = Math.round(scaledViewport.height);
          const ctx = canvas.getContext("2d");

          const renderTask = page.render({ canvasContext: ctx, viewport: scaledViewport });
          await renderTask.promise;

          const dataUrl = canvas.toDataURL("image/png");
          images.push(dataUrl);

          // small yield to keep UI responsive
          await new Promise((r) => setTimeout(r, 0));
          if (cancelled) break;
        }

        if (!cancelled) {
          setPages(images);
        }
      } catch (err) {
        console.error("Failed to load PDF:", err);
        if (!cancelled) setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [pdfFile]);

  if (loading) {
    return <div className="text-center mt-10">Loading PDF…</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">Error loading PDF: {error}</div>
    );
  }

  if (!pages.length) {
    return <div className="text-center mt-10">No pages found in PDF.</div>;
  }

  // create spreads (pairs of pages) so each flip shows two pages at once
  const spreads = [];
  for (let i = 0; i < pages.length; i += 2) {
    spreads.push([pages[i], pages[i + 1] || null]);
  }

  // (moved earlier) current spread index for manual paging is declared above

  // small view-mode toggle UI styles
  const toggleWrapper = isMobile
    ? {
        position: "absolute",
        left: "50%",
        top: 12,
        transform: "translateX(-50%)",
        zIndex: 80,
        display: "flex",
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
      }
    : {
        position: "absolute",
        left: 16,
        top: 50,
        bottom: 16,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        // keep the small buttons visible; thumbnails are revealed on hover
      };

  const toggleButton = (active) => ({
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid rgba(0,0,0,0.12)",
    background: active ? "#111" : "#fff",
    color: active ? "#fff" : "#111",
    cursor: "pointer",
    fontSize: 13,
  });

  const thumbColumn = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
    flex: 1,
    overflowY: "auto",
    padding: "6px",
    background: "rgba(255,255,255,0.95)",
    borderRadius: 8,
    // hidden by default; reveal when hovering the button section
    transition: "opacity 160ms ease, transform 160ms ease",
    opacity: controlsVisible ? 1 : 0,
    transform: controlsVisible ? "translateY(0)" : "translateY(-6px)",
    pointerEvents: controlsVisible ? "auto" : "none",
  };

  const mobileThumbOverlay = {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    top: "30%",
    zIndex: 120,
    background: "rgba(0,0,0,0.5)",
    display: controlsVisible ? "flex" : "none",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 12,
  };

  const mobileThumbPanel = {
    width: "100%",
    maxHeight: "70%",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 8,
    padding: 12,
    boxSizing: "border-box",
  };

  // styles for a book-like spread
  const outerStyle = {
    width: "100vw",
    height: "100vh",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  background: "#f3f4f6",
    padding: 0,
  };

  const spreadStyle = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    width: "100%",
    height: "100%",
    gap: "24px", // gutter between pages
    alignItems: "stretch",
  };

  const pageShell = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    borderRadius: 0,
    boxShadow: "none",
    overflow: "hidden",
    padding: 0,
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    display: "block",
  };

  // viewer dimensions: keep spread within 90% of viewport
  const viewerStyle = {
    display: "flex",
    flexDirection: "row",
    gap: "0px",
    width: "100vw",
    height: "100vh",
    alignItems: "stretch",
    justifyContent: "center",
  };

  // nav buttons removed — we rely on gestures and keyboard

  const prev = () => bookRef.current?.flipPrev?.() || bookRef.current?.pageFlip?.()?.flipPrev?.();
  const next = () => bookRef.current?.flipNext?.() || bookRef.current?.pageFlip?.()?.flipNext?.();

  // safe helpers to avoid flipping past bounds
  const getPageCount = () => {
    try {
      return bookRef.current?.getPageCount?.() ?? pages.length;
    } catch (e) {
      return pages.length;
    }
  };

  const getCurrentIndex = () => {
    try {
      return bookRef.current?.getCurrentPageIndex?.() ?? 0;
    } catch (e) {
      return 0;
    }
  };

  // bounded prev/next that stop at start/end
  const boundedPrev = () => {
    const idx = getCurrentIndex();
    if (idx <= 0) return;
    bookRef.current?.flipPrev?.();
  };

  const boundedNext = () => {
    const idx = getCurrentIndex();
    const count = getPageCount();
    if (idx >= count - 1) return;
    bookRef.current?.flipNext?.();
  };

  // (First-page button removed; use thumbnails to jump to pages)

  // jump to a specific page index
  const goToPage = (index) => {
    if (index == null) return;
    // ensure flip view
    if (viewMode !== "flip") setViewMode("flip");

    const tryDirect = () => {
      try {
        if (typeof bookRef.current?.flip === "function") {
          bookRef.current.flip(index);
          return true;
        }
        const pf = bookRef.current?.pageFlip?.();
        if (pf && typeof pf.flip === "function") {
          pf.flip(index);
          return true;
        }
        if (typeof bookRef.current?.flipToPage === "function") {
          bookRef.current.flipToPage(index);
          return true;
        }
      } catch (e) {}
      return false;
    };

    if (!tryDirect()) {
      // fallback: determine direction and step
      const cur = getCurrentIndex();
      const step = index < cur ? () => boundedPrev() : () => boundedNext();
      const attempts = Math.abs(index - cur) + 1;
      let i = 0;
      const runner = () => {
        if (i++ >= attempts) return;
        step();
        setTimeout(runner, 120);
      };
      runner();
    }
  };

  // removed duplicate current/key handler (declared earlier)

  return (
    <div style={{ position: "relative" }}>
      {/* small visual indicator when mobile mode is forced for testing */}
      {forceMobile && (
        <div style={{ position: "fixed", left: 12, top: 12, zIndex: 999, background: "#111", color: "#fff", padding: "6px 10px", borderRadius: 6, fontSize: 12 }}>
          MOBILE MODE (forced)
        </div>
      )}
      {/* debug overlay to show detected container width and computed isMobile when ?debug=1 */}
      {debugMode && (
        <div style={{ position: "fixed", right: 12, top: 12, zIndex: 999, background: "rgba(0,0,0,0.7)", color: "#fff", padding: "6px 10px", borderRadius: 6, fontSize: 12 }}>
          <div>containerW: {Math.round(dimensions.width)}</div>
          <div>isMobile: {String(isMobile)}</div>
          <div>flipW: {Math.round(flipSize.width)}</div>
        </div>
      )}
        {/* show controls only on non-mobile viewports */}
        {!isMobile && (
          <div style={toggleWrapper}>
            <div
              // keep buttons visible; reveal thumbnails while hovering this area (desktop)
              onMouseEnter={() => setControlsVisible(true)}
              onMouseLeave={() => setControlsVisible(false)}
              style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}
            >
              <button style={toggleButton(viewMode === "flip")} onClick={() => setViewMode("flip")}>Flip</button>
              <button style={toggleButton(viewMode === "pdf")} onClick={() => setViewMode("pdf")}>PDF</button>

              {/* vertical thumbnail column under the buttons (revealed on hover for desktop) */}
              <div style={thumbColumn}>
                {pages.map((src, idx) => (
                  <button key={idx} onClick={() => goToPage(idx)} style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer" }} title={`Page ${idx + 1}`}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <img src={src} alt={`thumb-${idx + 1}`} style={{ width: 56, height: 72, objectFit: "cover", display: "block", borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)" }} />
                      <div style={{ fontSize: 13, color: "#111", minWidth: 28, textAlign: "center" }}>{idx + 1}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* mobile thumbnails intentionally hidden — mobile shows native PDF only */}

      {(isMobile || viewMode === "pdf") ? (
        // native PDF viewer
        <div style={{ width: "100vw", height: "100vh" }}>
          <iframe
            src={pdfFile}
            title="PDF viewer"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>
      ) : (
        <div ref={containerRef} style={outerStyle}>
          <div style={viewerStyle}>
            <HTMLFlipBook
              ref={bookRef}
              width={Math.max(200, Math.round(isMobile ? flipSize.width : flipSize.width / 2))}
              height={flipSize.height}
              animationDuration={100}
              showCover={false}
              size="stretch"
              className="react-pageflip"
            >
              {pages.map((src, idx) => (
                <div key={idx} className="page" style={pageShell}>
                  <img src={src} alt={`page-${idx + 1}`} style={imgStyle} />
                </div>
              ))}
            </HTMLFlipBook>
          </div>
          {/* thumbnails moved to the left control column */}
        </div>
      )}
    </div>
  );
}
