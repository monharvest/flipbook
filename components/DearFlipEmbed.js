"use client";

import React, { useEffect, useState, useRef } from "react";

export default function DearFlipEmbed() {
  const [failed, setFailed] = useState([]);
  const [loaded, setLoaded] = useState([]);
  const [diagOpen, setDiagOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dearflipLoaded, setDearflipLoaded] = useState(false);
  const containerRef = useRef(null);

  // Set up global error handlers (runs once on mount)
  useEffect(() => {
    const onUnhandled = (ev) => {
      try {
        const reason = ev?.reason || ev;
        const text = (reason && (reason.message || reason.toString())) || String(reason);
        const benign = /Permissions check failed|addLinkAttributes is not a function/.test(text + (reason?.stack || ''));
        if (benign) {
          console.warn('[DearFlip][unhandledRejection][benign]', text);
          try{ ev && typeof ev.preventDefault === 'function' && ev.preventDefault(); }catch(e){}
          try{ ev && typeof ev.stopImmediatePropagation === 'function' && ev.stopImmediatePropagation(); }catch(e){}
          if (typeof console.debug === 'function') console.debug('[DearFlip][stack]', reason?.stack || reason);
        } else {
          console.error('[DearFlip][unhandledRejection] reason:', reason);
          if (reason && reason.stack) console.error('[DearFlip][unhandledRejection][stack]', reason.stack);
        }
      } catch (e) {
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

    window.addEventListener('unhandledrejection', onUnhandled, true);
    window.addEventListener('error', onError, true);
    try { window.onunhandledrejection = onUnhandled; } catch (e) {}
    try { window.onerror = function(message, source, lineno, colno, err){ try { onError({ message, error: err }); } catch(e){} }; } catch (e) {}

    // show controls only after first user interaction (click/tap)
    const onFirstClick = () => {
      try { setShowControls(true); } catch (e) { /* ignore */ }
      try { window.removeEventListener('click', onFirstClick); } catch (e) {}
    };
    try { window.addEventListener('click', onFirstClick, { once: true }); } catch (e) {}

    return () => {
      window.removeEventListener('unhandledrejection', onUnhandled);
      window.removeEventListener('error', onError);
      try { window.removeEventListener('click', onFirstClick); } catch (e) {}
    };
  }, []);

  // Lazy-load DearFlip only when component scrolls into view
  useEffect(() => {
    if (!containerRef.current || dearflipLoaded) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDearflipLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [dearflipLoaded]);

  // Load DearFlip scripts and initialize when dearflipLoaded becomes true
  useEffect(() => {
    if (!dearflipLoaded) return;

    // Ensure the flipbook container has the attributes DearFlip expects
    if (typeof document !== "undefined") {
      const el = document.getElementById("df_manual_book");
      if (el) {
        el.setAttribute("webgl", "true");
        el.setAttribute("backgroundcolor", "teal");
        el.setAttribute("source", "/books/book.pdf");
        el.setAttribute("pagespeed", "1.2");
        el.setAttribute("autoPlay", "false");
        el.setAttribute("pageMode", "2");
        el.setAttribute("singlePageMode", "auto");
        el.setAttribute("textureSize", "2048");
      }
    }

    const scripts = [
      "/dflip/js/libs/pdf.min.js",
      "/dflip/js/libs/three.min.js",
      "/dflip/js/libs/jquery.min.js",
      "/dflip/js/dflip.min.js",
    ];

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          console.log(`[DearFlip] script already present: ${src}`);
          setLoaded((s) => (s.includes(src) ? s : [...s, src]));
          return resolve();
        }

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
            restoreWrapper = null;
          }
        }

        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => {
          console.log(`[DearFlip] loaded: ${src}`);
          setLoaded((arr) => (arr.includes(src) ? arr : [...arr, src]));
          setFailed((arr) => arr.filter((u) => u !== src));
          if (restoreWrapper) restoreWrapper();
          resolve();
        };
        s.onerror = (e) => {
          console.error(`[DearFlip] failed to load: ${src}`, e);
          setFailed((arr) => (arr.includes(src) ? arr : [...arr, src]));
          if (restoreWrapper) restoreWrapper();
          reject(new Error(`Failed to load ${src}`));
        };
        document.body.appendChild(s);
      });

    (async () => {
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

        let __dfl_permissions_restore = null;
        try {
          if (typeof navigator !== 'undefined' && navigator.permissions && typeof navigator.permissions.query === 'function') {
            const origQuery = navigator.permissions.query.bind(navigator.permissions);
            navigator.permissions.query = function(descriptor) {
              try {
                const p = origQuery(descriptor);
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

        // Load scripts sequentially with yields to reduce blocking
        for (const src of scripts) {
          // eslint-disable-next-line no-await-in-loop
          await loadScript(src);
          // Yield to main thread between script loads
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 0));
        }

        // Init logic
        const init = () => {
          const book = window.df_manual_book;
          if (!book) return;

          const goFull = () => {
            if (book.ui?.switchFullscreen) book.ui.switchFullscreen();
            else if (book.container?.addClass) book.container.addClass("df-fullscreen");
            book.resize?.();
          };

          const applyPageMode = () => {
            try {
              const container = document.getElementById('df_manual_book');
              const width = container?.clientWidth || window.innerWidth;
              const isSmall = width <= 700;
              if (book.setPageMode) book.setPageMode(isSmall ? 1 : 2);
              else if (book.ui?.setPageMode) book.ui.setPageMode(isSmall ? 1 : 2);
              if (typeof book.resize === 'function') book.resize();
              setTimeout(() => { try { if (typeof book.resize === 'function') book.resize(); } catch(e){} }, 250);
            } catch (e) {
              try { if (book.resize) book.resize(); } catch (__) {}
            }
          };

          const waitForBook = setInterval(() => {
            if (book.ui || (book.target && book.target.ui)) {
              clearInterval(waitForBook);
              setTimeout(() => {
                goFull();
                applyPageMode();
                setIsLoading(false);
                window.addEventListener("resize", applyPageMode);
                window.addEventListener("orientationchange", () => setTimeout(applyPageMode, 300));
              }, 300);
            }
          }, 150);
        };

        try{ if(__dfl_restore) __dfl_restore(); }catch(e){}
        try{ if(__dfl_permissions_restore) __dfl_permissions_restore(); }catch(e){}

        function scheduleInit() {
          if (document.readyState === "complete") {
            try {
              init();
            } catch (e) {
              console.warn('DearFlip init error', e);
            }
          } else {
            requestAnimationFrame(() => {
              try {
                init();
              } catch (e) {
                console.warn('DearFlip init error', e);
              }
            });
          }
        }

        // Hide DearFlip's loading text
        const hideLoadingText = () => {
          const container = document.getElementById('df_manual_book');
          if (!container) return;
          
          const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            null,
            false
          );
          
          const nodesToRemove = [];
          let node;
          while (node = walker.nextNode()) {
            if (node.nodeType === 3) {
              if (/Loading|PDF/i.test(node.textContent)) {
                nodesToRemove.push(node);
              }
            } else if (node.nodeType === 1) {
              if (/loading|pdf/i.test(node.className || '')) {
                node.style.display = 'none';
              }
            }
          }
          
          nodesToRemove.forEach(n => n.remove());
        };
        
        setTimeout(hideLoadingText, 100);
        setTimeout(hideLoadingText, 500);
        setTimeout(hideLoadingText, 1000);
        
        try {
          const observer = new MutationObserver(() => {
            hideLoadingText();
          });
          observer.observe(document.getElementById('df_manual_book') || document.body, {
            childList: true,
            subtree: true,
            characterData: true
          });
        } catch (e) {}

        if (document.readyState === "complete") scheduleInit();
        else window.addEventListener("load", scheduleInit, { once: true });
      } catch (err) {
        try{ if(__dfl_restore) __dfl_restore(); }catch(e){}
        console.error("Failed to load DearFlip scripts", err);
      }
    })();
  }, [dearflipLoaded]);

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
    <div ref={containerRef} style={{ height: "100vh", width: "100vw", boxSizing: "border-box", background: "transparent", position: "relative" }}>
      {/* Only render DearFlip markup and scripts if component is visible */}
      {!dearflipLoaded && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'teal',
          fontSize: '14px',
          background: 'teal'
        }}>
          Scroll to load flipbook...
        </div>
      )}
      
      {dearflipLoaded && (
        <>
          {/* Preload critical resources for faster FCP/LCP */}
          <link rel="preconnect" href="/" />
          <link rel="dns-prefetch" href="/" />
      
      {/* Preload only the most critical CSS - defer others */}
      <link rel="preload" href="/dflip/css/dflip.min.css" as="style" />
      <link rel="preload" href="/dflip/fonts/themify.woff" as="font" type="font/woff" crossOrigin="anonymous" />
      
      {/* Load CSS asynchronously to prevent render blocking */}
      <link 
        href="/dflip/css/dflip.min.css" 
        rel="stylesheet" 
        media="print" 
        onLoad={(e) => { e.target.media = 'all'; e.target.onload = null; }} 
      />
      <noscript><link href="/dflip/css/dflip.min.css" rel="stylesheet" /></noscript>

      <style dangerouslySetInnerHTML={{ __html: `
        @font-face {
          font-family: 'themify';
          src: url('/dflip/fonts/themify.woff') format('woff');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
  html, body { 
    height: 100%; 
    margin: 0; 
    overflow: hidden; 
    background: gray;
    /* Prevent mobile address bar from causing CLS */
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
  }
        body { display: flex; flex-direction: column; }
  /* Ensure the DF container behaves correctly inside a flex column.
    Lock dimensions to prevent any layout shifts during content load. */
  #df_manual_book { 
    flex: 1; 
    width: 100% !important; 
    height: 100% !important; 
    min-height: 100vh !important;
    max-height: 100vh !important;
    background: gray;
    position: relative;
    /* CLS fixes: strict layout isolation */
    contain: strict;
    /* Prevent any overflow that could trigger reflow */
    overflow: hidden;
    /* Prevent elastic scrolling on iOS */
    overscroll-behavior: none;
    /* Prevent accidental text selection during touch interactions */
    user-select: none;
    -webkit-user-select: none;
    /* Enable GPU acceleration */
    transform: translate3d(0, 0, 0);
    -webkit-transform: translate3d(0, 0, 0);
    /* Force hardware acceleration */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  /* also target the wrapper class (used by vendor) */
  ._df_book { 
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    /* CLS fixes for mobile */
    contain: strict;
    overflow: hidden;
  }
        /* Loading overlay removed - DearFlip UI will render without the dark fullscreen cover */

  /* Hide DearFlip's default "Loading PDF..." text - all possible selectors */
  #df_manual_book .df-loading-text,
  #df_manual_book .df-loading,
  #df_manual_book [class*="loading-text"],
  #df_manual_book [class*="df-loading"],
  #df_manual_book .df-book-loading,
  #df_manual_book .df-container .df-loading,
  .df-loading-wrapper,
  .df-loading-text,
  .df-ui-loading,
  .df-loading-cover,
  #df_manual_book > div[style*="Loading"],
  #df_manual_book div:not([class]):not([id]) {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
  }

  /* Hide any text content containing "Loading" or "PDF" in the container */
  #df_manual_book::before,
  #df_manual_book::after {
    content: none !important;
    display: none !important;
  }

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

        /* Minimal loading indicator for FCP */
        .df-loader {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: df-spin 0.8s linear infinite;
          opacity: 1;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 10;
        }

        .df-loader.hidden {
          opacity: 0;
        }

        @keyframes df-spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      ` }} />

      {/* Minimal loading spinner - improves perceived performance */}
      {isLoading && <div className="df-loader" aria-label="Loading flipbook" />}

      {/* Cover overlay removed per user request */}

      <div
        className="_df_book"
        id="df_manual_book"
        aria-label="Interactive 3D flipbook of my blog"
      />
        </>
      )}
    </div>
  );
}
