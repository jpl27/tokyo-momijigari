/* Shared title bar and menus for the Tokyo Momijigari site (renamed from "A History of Tokyo" 2026-10-25).
   Edit menus HERE only. Each page has <div id="site-header"></div> followed by
   <script src="site-menu.js"></script>. Two levels deep, never deeper.
   Copied from the Japan site's site-menu.js (2026-10-25). All styles are scoped
   to #site-header and "sm-" classes so they never touch a page's own styles.
   The full-screen map pages (COMPACT) get one slim bar with a "Menu" button,
   so the header does not take the phone screen from the map. */
(function(){
  var TITLE="Tokyo Momijigari";
  var SMALL="Private study site · started 24 October 2026";
  var MENUS=[
    {label:"Momijigari",items:[
      ["Tokyo in Colour","foliage.html"],
      ["The leaves","leaves.html"]]},
    {label:"Tokyo background",items:[
      ["The land","primer-land.html"],
      ["People and power to 1590","primer-people.html"],
      ["Growth of the city","growth.html"],
      ["Population 1720–2025","stats.html"],
      ["Walking map: Tokyo in Five Faces","five-faces.html"]]}
  ];
  var COMPACT=["five-faces.html","foliage.html","growth.html"];

  var F="Georgia,'Times New Roman',Times,serif";
  var CSS=
   /* ---- full header (reading pages) ---- */
   "#site-header{position:sticky;top:0;z-index:40}"+
   "#site-header .sm-top{background:#fff;color:#111;border-bottom:2px solid #111;font-family:"+F+";font-size:16px;line-height:1.4}"+
   "#site-header .sm-bar{max-width:1100px;margin:0 auto;padding:12px 16px 0}"+
   "#site-header .sm-title{margin:0;font-size:1.25rem;line-height:1.3;font-weight:bold}"+
   "#site-header .sm-title a{text-decoration:none;color:#111}"+
   "#site-header .sm-title small{display:block;font-weight:normal;font-size:.8rem;color:#444}"+
   "#site-header nav.sm-menus{position:relative;max-width:1100px;margin:0 auto;padding:0 16px}"+
   "#site-header nav.sm-menus>ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:0 4px}"+
   "#site-header li{margin:0}#site-header .sm-menu{position:relative}"+
   "#site-header .sm-menu>button,#site-header .sm-menu>a.sm-link{font:inherit;font-size:.95rem;background:none;border:0;color:#111;padding:10px 12px;cursor:pointer;display:block;text-decoration:none}"+
   "#site-header .sm-menu>button::after{content:' \\25BE';font-size:.8em}"+
   "#site-header .sm-menu>button:hover,#site-header .sm-menu>button:focus-visible,#site-header .sm-menu.open>button,#site-header .sm-menu>a.sm-link:hover{background:#f4f4f4}"+
   "#site-header .sm-menu.current>button,#site-header .sm-menu.current>a.sm-link{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:4px}"+
   "#site-header .sm-sub{display:none;position:absolute;left:0;top:100%;min-width:250px;list-style:none;margin:0;padding:6px 0;background:#fff;border:1px solid #111;box-shadow:0 4px 12px rgba(0,0,0,.12)}"+
   "#site-header .sm-sub a{display:block;padding:8px 16px;text-decoration:none;font-size:.95rem;color:#111}"+
   "#site-header .sm-sub a:hover,#site-header .sm-sub a:focus{background:#f4f4f4;text-decoration:underline}"+
   "#site-header .sm-sub a[aria-current=page]{font-weight:bold;border-left:4px solid #111;padding-left:12px}"+
   "#site-header .sm-menu.open>.sm-sub{display:block}"+
   "@media (hover:hover) and (pointer:fine){#site-header .sm-menu:hover>.sm-sub{display:block}#site-header .sm-menu.nohover:not(.open)>.sm-sub{display:none}}"+
   "@media (max-width:700px){#site-header .sm-bar{padding-top:8px}#site-header .sm-title{font-size:1.05rem}#site-header .sm-title small{font-size:.72rem}#site-header .sm-menu{position:static}"+
   "#site-header .sm-menu>button,#site-header .sm-menu>a.sm-link{padding:8px 7px;font-size:.88rem}#site-header .sm-sub{left:16px;right:16px;min-width:0}}"+
   "@media print{#site-header{position:static}#site-header .sm-sub{display:none!important}}"+
   /* ---- compact bar (full-screen map pages) ---- */
   "body.sm-compact-page{display:flex;flex-direction:column;height:100vh;height:100dvh}"+
   "body.sm-compact-page>#site-header{position:relative;flex:0 0 auto;z-index:40}"+
   "body.sm-compact-page>#app{flex:1 1 auto;min-height:0;height:auto}"+
   /* the slim bar now takes the notch inset, so the map's own top items need not */
   "body.sm-compact-page #title{top:8px}body.sm-compact-page .maplibregl-ctrl-top-right{top:0}"+
   "#site-header .sm-cbar{display:flex;align-items:center;justify-content:space-between;gap:8px;height:calc(40px + env(safe-area-inset-top));"+
     "padding:env(safe-area-inset-top) calc(6px + env(safe-area-inset-right)) 0 calc(12px + env(safe-area-inset-left));background:#16181d;color:#f3f3f1;border-bottom:1px solid #3a3e46;font-family:"+F+"}"+
   "#site-header .sm-cbar>a{color:#f3f3f1;text-decoration:none;font-weight:bold;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;line-height:40px}"+
   "#site-header .sm-cbtn{flex:0 0 auto;height:34px;min-width:44px;padding:0 12px;border:1px solid #5a5f69;border-radius:8px;background:#23262d;color:#f3f3f1;font:600 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;cursor:pointer}"+
   "#site-header .sm-cbtn::after{content:' \\25BE';font-size:.8em}"+
   "#site-header .sm-cbtn[aria-expanded=true]{background:#f3f3f1;color:#16181d}"+
   "#site-header .sm-cbtn:focus-visible{outline:3px solid #ffd27a;outline-offset:1px}"+
   "#site-header .sm-panel{display:none;position:absolute;top:100%;right:0;width:min(100vw,340px);max-height:calc(100vh - 60px);max-height:calc(100dvh - 60px);overflow-y:auto;"+
     "background:#fff;color:#111;border:1px solid #111;box-shadow:0 6px 18px rgba(0,0,0,.3);padding:6px 0 10px;font-family:"+F+";font-size:16px;line-height:1.35}"+
   "#site-header .sm-panel.open{display:block}"+
   "#site-header .sm-panel p{margin:4px 16px 6px;font-size:12.5px;color:#444}"+
   "#site-header .sm-panel h2{margin:10px 16px 2px;font-size:12.5px;font-weight:bold;text-transform:uppercase;letter-spacing:.05em;color:#444}"+
   "#site-header .sm-panel ul{list-style:none;margin:0;padding:0}"+
   "#site-header .sm-panel a{display:block;padding:10px 16px;color:#111;text-decoration:none;min-height:44px}"+
   "#site-header .sm-panel a:hover,#site-header .sm-panel a:focus{background:#f4f4f4;text-decoration:underline}"+
   "#site-header .sm-panel a[aria-current=page]{font-weight:bold;border-left:4px solid #111;padding-left:12px}"+
   "#site-header .sm-panel a.sm-top-a{border-top:1px solid #ddd;margin-top:6px}"+
   "@media (max-width:700px){#site-header .sm-panel{left:0;right:0;width:auto}}";

  function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;");}
  var here=decodeURIComponent((location.pathname.split("/").pop()||"index.html"));
  if(!/\.html?$/.test(here)) here="index.html";
  function cur(href){return href===here?' aria-current="page"':'';}

  var st=document.createElement("style"); st.textContent=CSS; document.head.appendChild(st);
  var slot=document.getElementById("site-header");
  if(!slot) return;
  var compact=COMPACT.indexOf(here)>=0;

  if(compact){
    document.body.classList.add("sm-compact-page");
    var p='<p>'+esc(SMALL)+'</p><ul><li><a href="index.html"'+cur("index.html")+'>Home: what this site is</a></li></ul>';
    MENUS.forEach(function(m){
      if(m.href){ p+='<ul><li><a class="sm-top-a" href="'+m.href+'"'+cur(m.href)+'>'+esc(m.label)+'</a></li></ul>'; return; }
      p+='<h2>'+esc(m.label)+'</h2><ul>';
      m.items.forEach(function(it){ p+='<li><a href="'+it[1]+'"'+cur(it[1])+'>'+esc(it[0])+'</a></li>'; });
      p+='</ul>';
    });
    slot.innerHTML='<nav class="sm-cbar" aria-label="Site menu"><a href="index.html">'+esc(TITLE)+'</a>'+
      '<button type="button" class="sm-cbtn" aria-expanded="false" aria-controls="sm-panel">Menu</button></nav>'+
      '<div class="sm-panel" id="sm-panel">'+p+'</div>';
    var btn=slot.querySelector(".sm-cbtn"), panel=slot.querySelector(".sm-panel");
    function setOpen(o){ panel.classList.toggle("open",o); btn.setAttribute("aria-expanded",o?"true":"false"); }
    btn.addEventListener("click",function(e){ e.stopPropagation(); setOpen(!panel.classList.contains("open")); });
    document.addEventListener("click",function(e){ if(!e.target.closest("#site-header")) setOpen(false); });
    document.addEventListener("keydown",function(e){ if(e.key==="Escape") setOpen(false); });
    return;
  }

  var h='<header class="sm-top"><div class="sm-bar"><p class="sm-title"><a href="index.html">'+esc(TITLE)+'</a>'+
        '<small>'+esc(SMALL)+'</small></p></div>'+
        '<nav class="sm-menus" aria-label="Site menus"><ul>';
  MENUS.forEach(function(m,i){
    if(m.href){
      var c=(here===m.href);
      h+='<li class="sm-menu'+(c?' current':'')+'"><a class="sm-link" href="'+m.href+'"'+(c?' aria-current="page"':'')+'>'+esc(m.label)+'</a></li>';
      return;
    }
    var inGroup=m.items.some(function(it){return it[1]===here;});
    h+='<li class="sm-menu'+(inGroup?' current':'')+'"><button type="button" aria-expanded="false" aria-controls="sm-m'+i+'">'+esc(m.label)+'</button><ul class="sm-sub" id="sm-m'+i+'">';
    m.items.forEach(function(it){ h+='<li><a href="'+it[1]+'"'+cur(it[1])+'>'+esc(it[0])+'</a></li>'; });
    h+='</ul></li>';
  });
  h+='</ul></nav></header>';
  slot.innerHTML=h;
  var menus=slot.querySelectorAll(".sm-menu");
  function closeAll(except){
    Array.prototype.forEach.call(menus,function(m){ if(m!==except){ m.classList.remove("open"); var b=m.querySelector("button"); if(b) b.setAttribute("aria-expanded","false"); } });
  }
  Array.prototype.forEach.call(menus,function(m){
    var b=m.querySelector("button"); if(!b) return;
    b.addEventListener("click",function(e){ e.stopPropagation(); var o=m.classList.toggle("open"); b.setAttribute("aria-expanded",o?"true":"false"); closeAll(m); });
    Array.prototype.forEach.call(m.querySelectorAll(".sm-sub a"),function(a){ a.addEventListener("click",function(){ closeAll(); m.classList.add("nohover"); }); });
    m.addEventListener("mouseleave",function(){ m.classList.remove("nohover"); });
  });
  document.addEventListener("click",function(e){ if(!e.target.closest(".sm-menu")) closeAll(); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape") closeAll(); });
})();
