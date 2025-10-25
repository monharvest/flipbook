1:"$Sreact.fragment"
6:I[871,["/_next/static/chunks/f0029a94b871a58a.js"],"default"]
:HL["/_next/static/chunks/17194e7f97f3c1f6.css","style"]
2:Tb9f,
          (function(){
            function _df_benignFilter(text,stack){
              return /Permissions check failed|addLinkAttributes is not a function/.test((text||'') + (stack||''));
            }
            function _df_onUnhandled(ev){
              try{
                var reason = (ev && ev.reason) || ev;
                var text = (reason && (reason.message || String(reason))) || String(reason || '');
                if(_df_benignFilter(text, reason && reason.stack)){
                  try{ console.warn('[DearFlip][benign]', text); }catch(e){}
                  try{ ev && ev.preventDefault && ev.preventDefault(); }catch(e){}
                  try{ ev && ev.stopImmediatePropagation && ev.stopImmediatePropagation(); }catch(e){}
                  try{ console.debug && console.debug('[DearFlip][stack]', reason && reason.stack || reason); }catch(e){}
                }
              }catch(e){}
            }
            function _df_onError(ev){
              try{
                var text = (ev && ev.message) || String(ev || '');
                var stack = ev && ev.error && ev.error.stack || '';
                if(_df_benignFilter(text, stack)){
                  try{ console.warn('[DearFlip][error][benign]', text); }catch(e){}
                  try{ ev && ev.preventDefault && ev.preventDefault(); }catch(e){}
                  try{ ev && ev.stopImmediatePropagation && ev.stopImmediatePropagation(); }catch(e){}
                  try{ console.debug && console.debug('[DearFlip][error][stack]', stack || ev); }catch(e){}
                }
              }catch(e){}
            }
            try{
              if(window && window.addEventListener){
                window.addEventListener('unhandledrejection', _df_onUnhandled, true);
                window.addEventListener('error', _df_onError, true);
              }
              try{ window.onunhandledrejection = _df_onUnhandled; }catch(e){}
              try{ window.onerror = function(m,s,l,c,e){ try{ _df_onError({message:m,error:e}); }catch(_){} }; }catch(e){}
            }catch(e){}

            // Permissions API shim: ensure navigator.permissions.query doesn't produce
            // an unhandled rejection during vendor initialization. We replace it with
            // a safe wrapper that returns a resolved fallback on rejection.
            try{
              if(typeof navigator !== 'undefined' && navigator.permissions && typeof navigator.permissions.query === 'function'){
                var __df_orig_query = navigator.permissions.query.bind(navigator.permissions);
                navigator.permissions.query = function(descriptor){
                  try{
                    var p = __df_orig_query(descriptor);
                    return p && p.catch ? p.catch(function(){ return { state: 'denied' }; }) : p;
                  }catch(e){ return Promise.resolve({ state: 'denied' }); }
                };
              }
            }catch(e){}
          })();
        0:{"P":null,"b":"05nhKj-m2Ea8poXLcmdTT","c":["",""],"q":"","i":false,"f":[[["",{"children":["__PAGE__",{}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/chunks/17194e7f97f3c1f6.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":[["$","head",null,{"children":[["$","meta",null,{"name":"viewport","content":"width=device-width, initial-scale=1"}],["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$2"}}]]}],"$L3"]}]]}],{"children":["$L4",{},null,false,false]},null,false,false],"$L5",false]],"m":"$undefined","G":["$6",[]],"s":false,"S":true}
7:I[39373,["/_next/static/chunks/f0029a94b871a58a.js"],"default"]
8:I[23327,["/_next/static/chunks/f0029a94b871a58a.js"],"default"]
9:I[75563,["/_next/static/chunks/f0029a94b871a58a.js"],"ClientPageRoot"]
a:I[33709,["/_next/static/chunks/a363a9c4881e317c.js"],"default"]
d:I[51285,["/_next/static/chunks/f0029a94b871a58a.js"],"OutletBoundary"]
e:"$Sreact.suspense"
10:I[51285,["/_next/static/chunks/f0029a94b871a58a.js"],"ViewportBoundary"]
12:I[51285,["/_next/static/chunks/f0029a94b871a58a.js"],"MetadataBoundary"]
3:["$","body",null,{"children":["$","$L7",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L8",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]
4:["$","$1","c",{"children":[["$","$L9",null,{"Component":"$a","serverProvidedParams":{"searchParams":{},"params":{},"promises":["$@b","$@c"]}}],[["$","script","script-0",{"src":"/_next/static/chunks/a363a9c4881e317c.js","async":true,"nonce":"$undefined"}]],["$","$Ld",null,{"children":["$","$e",null,{"name":"Next.MetadataOutlet","children":"$@f"}]}]]}]
5:["$","$1","h",{"children":[null,["$","$L10",null,{"children":"$@11"}],["$","div",null,{"hidden":true,"children":["$","$L12",null,{"children":["$","$e",null,{"name":"Next.Metadata","children":"$@13"}]}]}],null]}]
b:{}
c:"$4:props:children:0:props:serverProvidedParams:params"
11:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
13:[["$","title","0",{"children":"Next.js"}],["$","meta","1",{"name":"description","content":"Generated by Next.js"}]]
f:null
