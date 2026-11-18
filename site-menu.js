/* Shared menu bar for the Tokyo Momijigari site. One brown bar, same on every page (2026-11-18).
   Edit menus HERE only. Each page has <div id="site-header"></div> followed by
   <script src="site-menu.js"></script> (or "../site-menu.js" from a subfolder: the path prefix
   is worked out from that src). All styles are scoped to #site-header and "sm-" classes
   so they never touch a page's own styles.
   Full-screen map pages (COMPACT) also get body.sm-compact-page so the map fills the rest of the screen. */
(function(){
  var TITLE="Tokyo Momijigari";
  /* Top-level entries in order: a plain link has href, a drop-down has items. */
  var MENUS=[
    {label:"Tokyo atlas",href:"atlas.html"},
    {label:"Momijigari",items:[
      ["Tokyo Foliage","foliage.html"],
      ["The leaves","leaves.html"]]},
    {label:"Tokyo background",items:[
      ["The land","primer-land.html"],
      ["People and power to 1590","primer-people.html"],
      ["Growth of the city","growth.html"],
      ["Population 1720–2025","stats.html"],
      ["Walking map: Tokyo in Five Faces","five-faces.html"]]},
    {label:"Walks",items:[
      ["Wednesday evening: Sumida bridges","walk-sumida-bridges.html"],
      ["Thursday: five revolutions","walk-five-revolutions.html"],
      ["Six revolutions, the longer version","walk-six-revolutions.html"],
      ["Todai campus tour","walk-todai.html"],
      ["Morning walk: cotton, wool, day labourers","walk-red.html"],
      ["Morning walk: machine shops and towers","walk-blue.html"],
      ["Morning walk: paper, gunpowder, Shibusawa","walk-green.html"]]}
  ];
  var COMPACT=["five-faces.html","foliage.html","growth.html"];

  /* Path prefix from this script tag's own src ("../site-menu.js" gives "../"). */
  var me=document.currentScript, src=me?(me.getAttribute("src")||""):"";
  if(!src){ var ss=document.getElementsByTagName("script"); for(var k=0;k<ss.length;k++){ var s0=ss[k].getAttribute("src")||""; if(/(^|\/)site-menu\.js(\?|$)/.test(s0)){ src=s0; break; } } }
  var P=src.replace(/site-menu\.js.*$/,"");
  var depth=(P.match(/\.\.\//g)||[]).length;

  var F="Georgia,'Times New Roman',Times,serif";
  var BAR="#3E2723",CREAM="#F7EFE2",PANEL="#FBF5EA",INK="#2B1A14",HOVER="#EFE3D0",BORDER="#6D4C41";
  var H="44px";
  var CSS=
   "#site-header{position:sticky;top:0;z-index:40;font-family:"+F+"}"+
   "#site-header *{box-sizing:border-box}"+
   "html body #site-header{position:sticky!important;top:0}"+
   "#site-header .sm-bar{display:flex;align-items:stretch;justify-content:space-between;gap:8px;height:calc("+H+" + env(safe-area-inset-top));"+
     "padding:env(safe-area-inset-top) calc(8px + env(safe-area-inset-right)) 0 calc(14px + env(safe-area-inset-left));background:"+BAR+";color:"+CREAM+";border-bottom:1px solid #241512;font-size:16px;line-height:1.3}"+
   "#site-header .sm-title{display:flex;align-items:center;color:"+CREAM+";text-decoration:none;font-weight:bold;font-size:17px;white-space:nowrap;margin-right:10px;flex:0 0 auto}"+
   "#site-header .sm-title:hover,#site-header .sm-title:focus-visible{text-decoration:underline}"+
   "#site-header ul.sm-menus{list-style:none;margin:0 auto 0 0;padding:0;display:flex;align-items:stretch;flex:1 1 auto}"+
   "#site-header li{margin:0}#site-header .sm-menu{position:relative;display:flex}"+
   "#site-header .sm-menu>button,#site-header .sm-menu>a.sm-link{font:inherit;font-size:15px;background:none;border:0;color:"+CREAM+";padding:0 12px;cursor:pointer;display:flex;align-items:center;text-decoration:none}"+
   "#site-header .sm-menu>button::after{content:'\\00a0\\25BE';font-size:.8em}"+
   "#site-header .sm-menu>button:hover,#site-header .sm-menu>button:focus-visible,#site-header .sm-menu.open>button,#site-header .sm-menu>a.sm-link:hover,#site-header .sm-menu>a.sm-link:focus-visible{background:rgba(247,239,226,.14)}"+
   "#site-header .sm-menu.current>button,#site-header .sm-menu.current>a.sm-link{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:6px}"+
   "#site-header .sm-sub{display:none;position:absolute;left:0;top:100%;min-width:270px;list-style:none;margin:0;padding:6px 0;background:"+PANEL+";border:1px solid "+BORDER+";box-shadow:0 6px 16px rgba(36,21,18,.3)}"+
   "#site-header .sm-sub a{display:block;padding:9px 16px;text-decoration:none;font-size:15px;color:"+INK+"}"+
   "#site-header .sm-sub a:hover,#site-header .sm-sub a:focus{background:"+HOVER+"}"+
   "#site-header .sm-sub a[aria-current=page]{font-weight:bold;border-left:4px solid "+BORDER+";padding-left:12px}"+
   "#site-header .sm-menu.open>.sm-sub{display:block}"+
   "@media (hover:hover) and (pointer:fine){#site-header .sm-menu:hover>.sm-sub{display:block}#site-header .sm-menu.nohover:not(.open)>.sm-sub{display:none}}"+
   "#site-header .sm-mbtn{display:none;align-self:center;height:34px;min-width:44px;padding:0 12px;border:1px solid "+CREAM+";border-radius:8px;background:transparent;color:"+CREAM+";font:600 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;cursor:pointer}"+
   "#site-header .sm-mbtn::after{content:'\\00a0\\25BE';font-size:.8em}"+
   "#site-header .sm-mbtn[aria-expanded=true]{background:"+CREAM+";color:"+BAR+"}"+
   "#site-header .sm-mbtn:focus-visible,#site-header .sm-menu>button:focus-visible,#site-header .sm-menu>a:focus-visible,#site-header .sm-title:focus-visible{outline:3px solid #ffd27a;outline-offset:-2px}"+
   "#site-header .sm-panel{display:none;position:absolute;top:100%;left:0;right:0;max-height:calc(100vh - "+H+" - env(safe-area-inset-top));max-height:calc(100dvh - "+H+" - env(safe-area-inset-top));overflow-y:auto;"+
     "background:"+PANEL+";color:"+INK+";border-bottom:1px solid "+BORDER+";box-shadow:0 8px 18px rgba(36,21,18,.3);padding:6px 0 10px;font-size:16px;line-height:1.35}"+
   "#site-header .sm-panel.open{display:block}"+
   "#site-header .sm-panel h2{margin:10px 16px 2px;font-size:12.5px;font-weight:bold;text-transform:uppercase;letter-spacing:.05em;color:#6D4C41}"+
   "#site-header .sm-panel ul{list-style:none;margin:0;padding:0}"+
   "#site-header .sm-panel a{display:flex;align-items:center;padding:8px 16px;color:"+INK+";text-decoration:none;min-height:44px}"+
   "#site-header .sm-panel a:hover,#site-header .sm-panel a:focus{background:"+HOVER+"}"+
   "#site-header .sm-panel a[aria-current=page]{font-weight:bold;border-left:4px solid "+BORDER+";padding-left:12px}"+
   "@media (max-width:800px){#site-header ul.sm-menus{display:none}#site-header .sm-mbtn{display:block}#site-header .sm-title{margin-right:auto}}"+
   "@media (min-width:801px){#site-header .sm-panel{display:none!important}}"+
   /* full-screen map pages: bar in the flow, map fills the rest */
   "body.sm-compact-page{display:flex;flex-direction:column;height:100vh;height:100dvh}"+
   "body.sm-compact-page>#site-header,html body.sm-compact-page>#site-header{position:relative!important;flex:0 0 auto;z-index:40}"+
   "body.sm-compact-page>#app{flex:1 1 auto;min-height:0;height:auto}"+
   "body.sm-compact-page #title{top:8px}body.sm-compact-page .maplibregl-ctrl-top-right{top:0}"+
   "@media print{#site-header,html body #site-header{position:static!important}#site-header .sm-sub,#site-header .sm-panel{display:none!important}}";

  function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;");}
  var segs=decodeURIComponent(location.pathname).split("/");
  var here=segs.slice(Math.max(0,segs.length-1-depth)).join("/");
  if(!/\.html?$/.test(here)) here=(depth?segs.slice(Math.max(0,segs.length-1-depth),-1).join("/")+"/":"")+"index.html";
  if(here===""||/\/$/.test(here)) here+="index.html";
  function cur(href){return href===here?' aria-current="page"':'';}

  var st=document.createElement("style"); st.textContent=CSS; document.head.appendChild(st);
  var slot=document.getElementById("site-header");
  if(!slot) return;
  if(COMPACT.indexOf(here)>=0) document.body.classList.add("sm-compact-page");

  var d='',p='<ul><li><a href="'+P+'index.html"'+cur("index.html")+'>Home: what this site is</a></li></ul>';
  MENUS.forEach(function(m,i){
    if(m.href){
      var c=(here===m.href);
      d+='<li class="sm-menu'+(c?' current':'')+'"><a class="sm-link" href="'+P+m.href+'"'+(c?' aria-current="page"':'')+'>'+esc(m.label)+'</a></li>';
      p+='<ul><li><a href="'+P+m.href+'"'+cur(m.href)+'>'+esc(m.label)+'</a></li></ul>';
      return;
    }
    var inGroup=m.items.some(function(it){return it[1]===here;});
    d+='<li class="sm-menu'+(inGroup?' current':'')+'"><button type="button" aria-expanded="false" aria-controls="sm-m'+i+'">'+esc(m.label)+'</button><ul class="sm-sub" id="sm-m'+i+'">';
    p+='<h2>'+esc(m.label)+'</h2><ul>';
    m.items.forEach(function(it){
      d+='<li><a href="'+P+it[1]+'"'+cur(it[1])+'>'+esc(it[0])+'</a></li>';
      p+='<li><a href="'+P+it[1]+'"'+cur(it[1])+'>'+esc(it[0])+'</a></li>';
    });
    d+='</ul></li>'; p+='</ul>';
  });
  slot.innerHTML='<div class="sm-bar"><a class="sm-title" href="'+P+'index.html">'+esc(TITLE)+'</a>'+
    '<nav aria-label="Site menus" style="display:contents"><ul class="sm-menus">'+d+'</ul></nav>'+
    '<button type="button" class="sm-mbtn" aria-expanded="false" aria-controls="sm-panel">Menu</button></div>'+
    '<nav class="sm-panel" id="sm-panel" aria-label="Site menu">'+p+'</nav>';

  var menus=slot.querySelectorAll(".sm-menu");
  var btn=slot.querySelector(".sm-mbtn"), panel=slot.querySelector(".sm-panel");
  function closeAll(except){
    Array.prototype.forEach.call(menus,function(m){ if(m!==except){ m.classList.remove("open"); var b=m.querySelector("button"); if(b) b.setAttribute("aria-expanded","false"); } });
  }
  function setPanel(o){ panel.classList.toggle("open",o); btn.setAttribute("aria-expanded",o?"true":"false"); }
  Array.prototype.forEach.call(menus,function(m){
    var b=m.querySelector("button"); if(!b) return;
    b.addEventListener("click",function(e){ e.stopPropagation(); var o=m.classList.toggle("open"); b.setAttribute("aria-expanded",o?"true":"false"); closeAll(m); });
    Array.prototype.forEach.call(m.querySelectorAll(".sm-sub a"),function(a){ a.addEventListener("click",function(){ closeAll(); m.classList.add("nohover"); }); });
    m.addEventListener("mouseleave",function(){ m.classList.remove("nohover"); });
  });
  btn.addEventListener("click",function(e){ e.stopPropagation(); setPanel(!panel.classList.contains("open")); });
  document.addEventListener("click",function(e){ if(!e.target.closest("#site-header")){ closeAll(); setPanel(false); } else if(!e.target.closest(".sm-menu")) closeAll(); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"){ closeAll(); setPanel(false); } });
})();
