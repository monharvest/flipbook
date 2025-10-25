(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,33709,e=>{"use strict";var t=e.i(64180),r=e.i(33175);function o(){let[e,o]=(0,r.useState)([]),[n,i]=(0,r.useState)([]),[a,l]=(0,r.useState)(!1),[s,c]=(0,r.useState)(!1);return(0,r.useEffect)(()=>{let e=e=>{try{let t=e?.reason||e,r=t&&(t.message||t.toString())||String(t);if(/Permissions check failed|addLinkAttributes is not a function/.test(r+(t?.stack||""))){console.warn("[DearFlip][unhandledRejection][benign]",r);try{e&&"function"==typeof e.preventDefault&&e.preventDefault()}catch(e){}try{e&&"function"==typeof e.stopImmediatePropagation&&e.stopImmediatePropagation()}catch(e){}"function"==typeof console.debug&&console.debug("[DearFlip][stack]",t?.stack||t)}else console.error("[DearFlip][unhandledRejection] reason:",t),t&&t.stack&&console.error("[DearFlip][unhandledRejection][stack]",t.stack)}catch(e){try{console.error("[DearFlip] failed to log unhandledRejection",e)}catch(e){}}},t=e=>{try{let t=e?.message||String(e);if(/Permissions check failed|addLinkAttributes is not a function/.test(t+(e?.error?.stack||""))){console.warn("[DearFlip][error][benign]",t);try{e&&"function"==typeof e.preventDefault&&e.preventDefault()}catch(e){}try{e&&"function"==typeof e.stopImmediatePropagation&&e.stopImmediatePropagation()}catch(e){}"function"==typeof console.debug&&console.debug("[DearFlip][error][stack]",e?.error?.stack||e)}else console.error("[DearFlip][error] message:",e?.message||e,e?.error||e),e?.error&&e.error.stack&&console.error("[DearFlip][error][stack]",e.error.stack)}catch(e){try{console.error("[DearFlip] failed to log error",e)}catch(e){}}};window.addEventListener("unhandledrejection",e,!0),window.addEventListener("error",t,!0);try{window.onunhandledrejection=e}catch(e){}try{window.onerror=function(e,r,o,n,i){try{t({message:e,error:i})}catch(e){}}}catch(e){}if("undefined"!=typeof document){let e=document.getElementById("df_manual_book");e&&(e.setAttribute("webgl","true"),e.setAttribute("backgroundcolor","gray"),e.setAttribute("source","/books/book.pdf"),e.setAttribute("pagespeed","1.2"),e.setAttribute("autoPlay","false"),e.setAttribute("pageMode","2"),e.setAttribute("singlePageMode","auto"),e.setAttribute("textureSize","2048"))}let r=["/dflip/js/libs/pdf.min.js","/dflip/js/libs/three.min.js","/dflip/js/libs/jquery.min.js","/dflip/js/dflip.min.js"],n=e=>new Promise((t,r)=>{if(document.querySelector(`script[src="${e}"]`))return console.log(`[DearFlip] script already present: ${e}`),i(t=>t.includes(e)?t:[...t,e]),t();let n=/three(\.min)?\.js$/.test(e),a=null;if(n)try{let e=document.createElement("script");e.type="text/javascript",e.text=`(function(){
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
})();`,document.body.appendChild(e),a=()=>{try{let e=document.createElement("script");e.type="text/javascript",e.text="(function(){try{if(window.__dfl_orig_defineProperty)Object.defineProperty=window.__dfl_orig_defineProperty,delete window.__dfl_orig_defineProperty;}catch(e){} })();",document.body.appendChild(e)}catch(e){}}}catch(e){a=null}let l=document.createElement("script");l.src=e,l.defer=!0,l.onload=()=>{console.log(`[DearFlip] loaded: ${e}`),i(t=>t.includes(e)?t:[...t,e]),o(t=>t.filter(t=>t!==e)),a&&a(),t()},l.onerror=t=>{console.error(`[DearFlip] failed to load: ${e}`,t),o(t=>t.includes(e)?t:[...t,e]),a&&a(),r(Error(`Failed to load ${e}`))},document.body.appendChild(l)});(async()=>{let e=null;try{try{let t=Object.defineProperty;window.__dfl_orig_defineProperty=t,Object.defineProperty=function(e,r,o){if("AudioContext"===r)try{let n=Object.getOwnPropertyDescriptor(e||{},r);if(!n||n.configurable)return t.call(Object,e,r,o);return e[r]}catch(t){return e[r]}return t.call(Object,e,r,o)},e=function(){try{window.__dfl_orig_defineProperty&&(Object.defineProperty=window.__dfl_orig_defineProperty,delete window.__dfl_orig_defineProperty)}catch(e){}}}catch(e){}let t=null;try{if("undefined"!=typeof navigator&&navigator.permissions&&"function"==typeof navigator.permissions.query){let e=navigator.permissions.query.bind(navigator.permissions);navigator.permissions.query=function(t){try{return e(t).catch(()=>({state:"denied"}))}catch(e){return Promise.resolve({state:"denied"})}},t=()=>{try{navigator.permissions.query=e}catch(e){}}}}catch(e){}for(let e of r)await n(e);let o=()=>{let e=window.df_manual_book;if(!e)return;let t=()=>{let t=window.innerWidth<=600;e.setPageMode?e.setPageMode(t?1:2):e.ui?.setPageMode&&e.ui.setPageMode(t?1:2),e.resize?.()},r=setInterval(()=>{(e.ui||e.target&&e.target.ui)&&(clearInterval(r),setTimeout(()=>{e.ui?.switchFullscreen?e.ui.switchFullscreen():e.container?.addClass&&e.container.addClass("df-fullscreen"),e.resize?.(),t(),window.addEventListener("resize",t),window.addEventListener("orientationchange",()=>setTimeout(t,300))},300))},150)};try{e&&e()}catch(e){}try{t&&t()}catch(e){}"complete"===document.readyState?o():window.addEventListener("load",o,{once:!0})}catch(t){try{e&&e()}catch(e){}console.error("Failed to load DearFlip scripts",t)}})();let a=()=>{try{c(!0)}catch(e){}try{window.removeEventListener("click",a)}catch(e){}};try{window.addEventListener("click",a,{once:!0})}catch(e){}return()=>{window.removeEventListener("unhandledrejection",e),window.removeEventListener("error",t);try{window.removeEventListener("click",a)}catch(e){}}},[]),(0,r.useEffect)(()=>{window.__dearflip_retry=()=>{let e=new Event("dearflip-retry");window.dispatchEvent(e)}},[]),(0,r.useEffect)(()=>{let t=()=>(()=>{let t=[...e];if(t.length)for(let e of(o([]),t))if(e.endsWith(".js")){let t=document.querySelector(`script[src="${e}"]`);t&&t.remove();let r=document.createElement("script");r.src=e,r.defer=!0,r.onload=()=>{console.log(`[DearFlip][retry] loaded ${e}`),i(t=>t.includes(e)?t:[...t,e]),o(t=>t.filter(t=>t!==e))},r.onerror=()=>{console.error(`[DearFlip][retry] failed ${e}`),o(t=>t.includes(e)?t:[...t,e])},document.body.appendChild(r)}else fetch(e,{method:"GET"}).then(t=>{t.ok?(i(t=>t.includes(e)?t:[...t,e]),o(t=>t.filter(t=>t!==e))):o(t=>t.includes(e)?t:[...t,e])}).catch(()=>{o(t=>t.includes(e)?t:[...t,e])})})();return window.addEventListener("dearflip-retry",t),()=>window.removeEventListener("dearflip-retry",t)},[e]),(0,r.useEffect)(()=>{try{let e="1"===new URLSearchParams(window.location.search).get("dfdiag"),t="undefined"!=typeof document?document.getElementById("df_manual_book"):null;if(!t)return;s||e?t.classList.add("df-show-controls"):t.classList.remove("df-show-controls")}catch(e){}},[s]),(0,t.jsxs)("div",{style:{height:"100vh",width:"100vw",boxSizing:"border-box",background:"transparent"},children:[(0,t.jsx)("link",{rel:"preload",href:"/dflip/css/dflip.min.css",as:"style"}),(0,t.jsx)("link",{rel:"preload",href:"/dflip/js/dflip.min.js",as:"script"}),(0,t.jsx)("link",{rel:"preload",href:"/dflip/fonts/themify.woff",as:"font",type:"font/woff",crossOrigin:"anonymous"}),(0,t.jsx)("link",{href:"/dflip/css/dflip.min.css",rel:"stylesheet"}),(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:`
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
      `}}),(0,t.jsx)("div",{className:"_df_book",id:"df_manual_book","aria-label":"Interactive 3D flipbook of my blog"})]})}function n(){return(0,t.jsx)("main",{style:{textAlign:"center"},children:(0,t.jsx)(o,{})})}e.s(["default",()=>n],33709)}]);