"use client";

import React, { useEffect, useState } from "react";

export default function DearFlipEmbed() {
  const [failed, setFailed] = useState([]);
  const [loaded, setLoaded] = useState([]);
  const [diagOpen, setDiagOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    // Attach global handlers to capture unhandled rejections/errors from the
    // in-page DearFlip scripts so we can surface full stacks in the dev log.
    const onUnhandled = (ev) => {
      try {
        const reason = ev?.reason || ev;
        const text = (reason && (reason.message || reason.toString())) || String(reason);
        // filter known benign/third-party messages so Turbopack doesn't surface them as dev-errors
        const benign = /Permissions check failed|addLinkAttributes is not a function/.test(text + (reason?.stack || ''));
        if (benign) {
          // keep as warn so it's visible but not surfaced as an error overlay
          console.warn('[DearFlip][unhandledRejection][benign]', text);
          try{ ev && typeof ev.preventDefault === 'function' && ev.preventDefault(); }catch(e){}
          try{ ev && typeof ev.stopImmediatePropagation === 'function' && ev.stopImmediatePropagation(); }catch(e){}
          // expose full stack to debug only
          if (typeof console.debug === 'function') console.debug('[DearFlip][stack]', reason?.stack || reason);
        } else {
          console.error('[DearFlip][unhandledRejection] reason:', reason);
          if (reason && reason.stack) console.error('[DearFlip][unhandledRejection][stack]', reason.stack);
        }
      } catch (e) {
        // avoid throwing from the handler itself
        try { console.error('[DearFlip] failed to log unhandledRejection', e); } catch (__) {}
      }
    };
    const onError = (ev) => {
      try {
        const text = ev?.message || String(ev);
        const benign = /Permissions check failed|addLinkAttributes is not a function/.test(text + (ev?.error?.stack || ''));
        if (benign) {
          console.warn('[DearFlip][error][benign]', text);
          try{ ev && typeof ev.preventDefault === 'function' && ev.preventDefault(); }catch(e){}
          try{ ev && typeof ev.stopImmediatePropagation === 'function' && ev.stopImmediatePropagation(); }catch(e){}
          if (typeof console.debug === 'function') console.debug('[DearFlip][error][stack]', ev?.error?.stack || ev);
        } else {
          console.error('[DearFlip][error] message:', ev?.message || ev, ev?.error || ev);
          if (ev?.error && ev.error.stack) console.error('[DearFlip][error][stack]', ev.error.stack);
        }
      } catch (e) {
        try { console.error('[DearFlip] failed to log error', e); } catch (__) {}
      }
    };
  // install capture-phase listeners early to try to intercept vendor-caused
  // unhandled rejections/errors before other tooling (Turbopack) can show overlays.
  window.addEventListener('unhandledrejection', onUnhandled, true);
  window.addEventListener('error', onError, true);
  // fallback assignments for environments that prefer the property hooks
  try { window.onunhandledrejection = onUnhandled; } catch (e) {}
  try { window.onerror = function(message, source, lineno, colno, err){ try { onError({ message, error: err }); } catch(e){} }; } catch (e) {}
    // ensure the flipbook container has the attributes DearFlip expects
    // (set via DOM API to avoid React boolean attribute warnings)
    if (typeof document !== "undefined") {
      const el = document.getElementById("df_manual_book");
      if (el) {
        el.setAttribute("webgl", "true");
        el.setAttribute("backgroundcolor", "gray");
        el.setAttribute("source", "/books/book.pdf");
        el.setAttribute("pagespeed", "1.2");
        el.setAttribute("autoPlay", "false");
        el.setAttribute("pageMode", "2");
        el.setAttribute("singlePageMode", "auto");
        el.setAttribute("textureSize", "2048");
      }
    }
    // Load scripts sequentially and then run init
    const scripts = [
      "/dflip/js/libs/pdf.min.js",
      "/dflip/js/libs/three.min.js",
      "/dflip/js/libs/jquery.min.js",
      "/dflip/js/dflip.min.js",
    ];

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        // don't load twice
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          console.log(`[DearFlip] script already present: ${src}`);
          setLoaded((s) => (s.includes(src) ? s : [...s, src]));
          return resolve();
        }

        // Special-case three.min.js: temporarily wrap Object.defineProperty to avoid
        // errors when libraries attempt to redefine AudioContext on non-configurable properties.
        const isThree = /three(\.min)?\.js$/.test(src);
        let restoreWrapper = null;

        if (isThree) {
          try {
            const pre = document.createElement('script');
            pre.type = 'text/javascript';
            pre.text = `(function(){
  try{
    var __dfl_orig=Object.defineProperty;
    window.__dfl_orig_defineProperty=__dfl_orig;
    Object.defineProperty=function(obj,prop,desc){
      if(prop==='AudioContext'){
        try{
          // only attempt if existing descriptor is configurable (or absent)
          var d=Object.getOwnPropertyDescriptor(obj||{},prop);
          if(!d||d.configurable){
            return __dfl_orig.call(Object,obj,prop,desc);
          }
          return obj[prop];
        }catch(e){
          return obj[prop];
        }
      }
      return __dfl_orig.call(Object,obj,prop,desc);
    };
  }catch(e){ /* ignore */ }
})();`;
            document.body.appendChild(pre);
            restoreWrapper = () => {
              try {
                const post = document.createElement('script');
                post.type = 'text/javascript';
                post.text = `(function(){try{if(window.__dfl_orig_defineProperty)Object.defineProperty=window.__dfl_orig_defineProperty,delete window.__dfl_orig_defineProperty;}catch(e){} })();`;
                document.body.appendChild(post);
              } catch (e) {
                /* ignore */
              }
            };
          } catch (e) {
            // proceed without wrapper if anything fails
            restoreWrapper = null;
          }
        }

        const s = document.createElement("script");
        s.src = src;
        s.defer = true;
        s.onload = () => {
          console.log(`[DearFlip] loaded: ${src}`);
          setLoaded((arr) => (arr.includes(src) ? arr : [...arr, src]));
          // remove from failed if previously failed
          setFailed((arr) => arr.filter((u) => u !== src));
          // restore original defineProperty if we wrapped it
          if (restoreWrapper) restoreWrapper();
          resolve();
        };
        s.onerror = (e) => {
          console.error(`[DearFlip] failed to load: ${src}`, e);
          setFailed((arr) => (arr.includes(src) ? arr : [...arr, src]));
          // try to restore even on error
          if (restoreWrapper) restoreWrapper();
          reject(new Error(`Failed to load ${src}`));
        };
        document.body.appendChild(s);
      });

    // helper to retry failed assets
    const retryFailed = async () => {
      const toRetry = [...failed];
      setFailed([]);
      for (const src of toRetry) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await loadScript(src);
        } catch (err) {
          console.error(`[DearFlip] retry failed for ${src}`, err);
        }
      }
    };

    (async () => {
      // install a broad defineProperty wrapper while we load DearFlip assets to
      // avoid 'Cannot redefine property: AudioContext' errors coming from
      // minified bundles that attempt to Object.defineProperty on the THREE namespace.
      let __dfl_restore = null;
      try {
        try {
          const orig = Object.defineProperty;
          window.__dfl_orig_defineProperty = orig;
          Object.defineProperty = function(obj, prop, desc){
            if (prop === 'AudioContext'){
              try{
                const d = Object.getOwnPropertyDescriptor(obj||{}, prop);
                if(!d || d.configurable) return orig.call(Object, obj, prop, desc);
                return obj[prop];
              }catch(e){return obj[prop];}
            }
            return orig.call(Object, obj, prop, desc);
          };
          __dfl_restore = function(){
            try{ if(window.__dfl_orig_defineProperty) Object.defineProperty = window.__dfl_orig_defineProperty, delete window.__dfl_orig_defineProperty;}catch(e){}
          };
        }catch(e){ /* ignore */ }

        // Temporarily wrap navigator.permissions.query to prevent environment-specific
        // 'Permissions check failed' rejections coming from vendor code.
        let __dfl_permissions_restore = null;
        try {
          if (typeof navigator !== 'undefined' && navigator.permissions && typeof navigator.permissions.query === 'function') {
            const origQuery = navigator.permissions.query.bind(navigator.permissions);
            // replace with a safe wrapper that swallows rejections
            navigator.permissions.query = function(descriptor) {
              try {
                const p = origQuery(descriptor);
                // ensure any rejection becomes a resolved state object to avoid unhandledRejection
                return p.catch(() => ({ state: 'denied' }));
              } catch (e) {
                return Promise.resolve({ state: 'denied' });
              }
            };
            __dfl_permissions_restore = () => {
              try { navigator.permissions.query = origQuery; } catch (e) { /* ignore */ }
            };
          }
        } catch (e) { /* ignore */ }

        for (const src of scripts) {
          // eslint-disable-next-line no-await-in-loop
          await loadScript(src);
        }

        // Init logic copied from index.html
        const init = () => {
          const book = window.df_manual_book;
          if (!book) return;

          const goFull = () => {
            if (book.ui?.switchFullscreen) book.ui.switchFullscreen();
            else if (book.container?.addClass) book.container.addClass("df-fullscreen");
            book.resize?.();
          };

          const applyPageMode = () => {
            const isSmall = window.innerWidth <= 600;
            if (book.setPageMode) book.setPageMode(isSmall ? 1 : 2);
            else if (book.ui?.setPageMode) book.ui.setPageMode(isSmall ? 1 : 2);
            book.resize?.();
          };

          const waitForBook = setInterval(() => {
            if (book.ui || (book.target && book.target.ui)) {
              clearInterval(waitForBook);
              setTimeout(() => {
                goFull();
                applyPageMode();
                window.addEventListener("resize", applyPageMode);
                window.addEventListener("orientationchange", () => setTimeout(applyPageMode, 300));
                // loading overlay intentionally removed; no DOM cleanup required here
              }, 300);
            }
          }, 150);
        };

        // restore the original defineProperty (we wrapped it during load)
        try{ if(__dfl_restore) __dfl_restore(); }catch(e){}
  try{ if(__dfl_permissions_restore) __dfl_permissions_restore(); }catch(e){}

        // if scripts provided df_manual_book automatically, run init on load
        // otherwise also attach a load listener
        if (document.readyState === "complete") init();
        else window.addEventListener("load", init, { once: true });
      } catch (err) {
        // ensure restore on error
        try{ if(__dfl_restore) __dfl_restore(); }catch(e){}
        console.error("Failed to load DearFlip scripts", err);
      }
    })();

    // show controls only after first user interaction (click/tap)
    const onFirstClick = () => {
      try { setShowControls(true); } catch (e) { /* ignore */ }
      try { window.removeEventListener('click', onFirstClick); } catch (e) {}
    };
    // listen for one user click anywhere on the page
    try { window.addEventListener('click', onFirstClick, { once: true }); } catch (e) {}

    return () => {
      window.removeEventListener('unhandledrejection', onUnhandled);
      window.removeEventListener('error', onError);
      try { window.removeEventListener('click', onFirstClick); } catch (e) {}
      // no-op cleanup; scripts remain loaded for SPA navigation
    };
  }, []);

  // expose a global retry for quick manual debugging from console
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__dearflip_retry = () => {
        const ev = new Event("dearflip-retry");
        window.dispatchEvent(ev);
      };
    }
  }, []);

  // retry handler available to UI and console-trigger
  const retryFailedAssets = () => {
    const toRetry = [...failed];
    if (!toRetry.length) return;
    // clear for UI while retrying
    setFailed([]);

    for (const src of toRetry) {
      if (src.endsWith('.js')) {
        // create a script and attach handlers
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          // if script already present but previously errored, remove and recreate
          existing.remove();
        }
        const s = document.createElement('script');
        s.src = src;
        s.defer = true;
        s.onload = () => {
          console.log(`[DearFlip][retry] loaded ${src}`);
          setLoaded((arr) => (arr.includes(src) ? arr : [...arr, src]));
          setFailed((arr) => arr.filter((u) => u !== src));
        };
        s.onerror = () => {
          console.error(`[DearFlip][retry] failed ${src}`);
          setFailed((arr) => (arr.includes(src) ? arr : [...arr, src]));
        };
        document.body.appendChild(s);
      } else {
        // for CSS / fonts: try fetch to check availability
        fetch(src, { method: 'GET' }).then((res) => {
          if (res.ok) {
            setLoaded((arr) => (arr.includes(src) ? arr : [...arr, src]));
            setFailed((arr) => arr.filter((u) => u !== src));
          } else {
            setFailed((arr) => (arr.includes(src) ? arr : [...arr, src]));
          }
        }).catch(() => {
          setFailed((arr) => (arr.includes(src) ? arr : [...arr, src]));
        });
      }
    }
  };

  // wire window event to trigger retry from console
  useEffect(() => {
    const handler = () => retryFailedAssets();
    window.addEventListener('dearflip-retry', handler);
    return () => window.removeEventListener('dearflip-retry', handler);
  }, [failed]);

  // Toggle a class on the DearFlip container to reveal vendor controls
  // only after the user has interacted (showControls) or when the
  // '?dfdiag=1' query param forces visibility.
  useEffect(() => {
    try {
      const forced = (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dfdiag') === '1');
      const el = (typeof document !== 'undefined') ? document.getElementById('df_manual_book') : null;
      if (!el) return;
      if (showControls || forced) el.classList.add('df-show-controls');
      else el.classList.remove('df-show-controls');
    } catch (e) {
      /* ignore DOM errors */
    }
  }, [showControls]);

  return (
    <div style={{ height: "100vh", width: "100vw", boxSizing: "border-box", background: "transparent" }}>
      {/* Inline styles and preload link equivalents */}
      <link rel="preload" href="/dflip/css/dflip.min.css" as="style" />
      <link rel="preload" href="/dflip/js/dflip.min.js" as="script" />
      <link rel="preload" href="/dflip/fonts/themify.woff" as="font" type="font/woff" crossOrigin="anonymous" />

      <link href="/dflip/css/dflip.min.css" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        @font-face {
          font-family: 'themify';
          src: url('/dflip/fonts/themify.woff') format('woff');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
  html, body { height: 100%; margin: 0; overflow: hidden; background: transparent; }
        body { display: flex; flex-direction: column; }
  #df_manual_book { flex: 1; width: 100%; height: 100%; background: gray; }
        /* Loading overlay removed - DearFlip UI will render without the dark fullscreen cover */

  /*
   Hide vendor-provided navigation/controls inside the DearFlip container
   by default. They'll be revealed after the user interacts (first click)
   or when the '?dfdiag=1' query param forces visibility.
   We target common class-name fragments used by vendor controls.
  */
        #df_manual_book [class*="control"],
        #df_manual_book [class*="nav"],
        #df_manual_book [class*="toolbar"],
        #df_manual_book [class*="pagination"],
        #df_manual_book [class*="footer"],
        #df_manual_book [class*="bottom"] {
          display: none !important;
        }

        /* Reveal when the container has the 'df-show-controls' class */
        #df_manual_book.df-show-controls [class*="control"],
        #df_manual_book.df-show-controls [class*="nav"],
        #df_manual_book.df-show-controls [class*="toolbar"],
        #df_manual_book.df-show-controls [class*="pagination"],
        #df_manual_book.df-show-controls [class*="footer"],
        #df_manual_book.df-show-controls [class*="bottom"] {
          display: initial !important;
        }
      ` }} />

      {/* Loading overlay removed intentionally so the flipbook shows immediately without a dark cover */}

      {/* Diagnostics panel to surface failed/loaded assets */}
      {/* Diagnostics panel: collapsed by default; toggle to open */}
      <div style={{ position: 'fixed', right: 12, top: 12, zIndex: 10001 }}>
        {/* DF toggle button intentionally removed per user request. */}
        <div
          id="dflip-diagnostics-panel"
          role="region"
          aria-hidden={!diagOpen && !(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dfdiag') === '1')}
          style={{
            marginTop: 8,
            width: 320,
            maxWidth: 'calc(100vw - 48px)',
            background: 'rgba(0,0,0,0.85)',
            color: '#fff',
            padding: 12,
            borderRadius: 8,
            fontSize: 12,
            transition: 'transform 200ms ease, opacity 200ms ease',
            transformOrigin: 'top right',
            transform: (diagOpen || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dfdiag') === '1')) ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
            opacity: (diagOpen || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dfdiag') === '1')) ? 1 : 0,
            pointerEvents: (diagOpen || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dfdiag') === '1')) ? 'auto' : 'none'
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>DearFlip diagnostics</div>
          <div style={{ marginBottom: 8 }}>
            <div>Loaded: <span style={{ color: '#6cf' }}>{loaded.length}</span></div>
            <div>Failed: <span style={{ color: '#f66' }}>{failed.length}</span></div>
          </div>
          {failed.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ marginBottom: 6 }}>Failed URLs:</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {failed.map((u) => (
                  <li key={u} style={{ wordBreak: 'break-all' }}>{u}</li>
                ))}
              </ul>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => retryFailedAssets()}
              style={{ background: '#0cf', border: 'none', padding: '6px 10px', borderRadius: 6 }}
            >
              Retry
            </button>
            <button
              onClick={() => {
                // copy failed list to clipboard for troubleshooting
                if (failed.length) navigator.clipboard?.writeText(failed.join('\n'));
              }}
              style={{ background: '#333', border: 'none', padding: '6px 10px', borderRadius: 6 }}
            >
              Copy
            </button>
          </div>
          <div style={{ marginTop: 8, opacity: 0.8, fontSize: 11 }}>
            Tip: open DevTools → Network to see 404s. Or run <code>__dearflip_retry()</code> in console.
          </div>
        </div>
      </div>

      <div
        className="_df_book"
        id="df_manual_book"
        aria-label="Interactive 3D flipbook of my blog"
      />
    </div>
  );
}
