/* Shared atlas layers for the Tokyo Momijigari site (built 2026-11-14 by Claude Opus 5.5, Jeeves, Code).
   One JSON file per layer set lives in layers/ beside this script; the format is described in
   ⚡jeeves-md-notes/atlas-layer-format-2026-11-14.md. Plain JavaScript, no build step, needs MapLibre GL JS.

   Use, after the page's MapLibre map exists:
     TokyoLayers.attach(map, {
       layers:   ['neighbourhoods', ...],   // file names in layers/, without .json
       on:       ['neighbourhoods'],         // switched on at start (only one 'fill' layer wins)
       controls: '#layerBtns',               // element or selector that receives the switches
       legend:   '#layerLegend',             // element or selector for legend, note and credit (optional)
       base:     'layers/',                  // optional; default = the folder of this script + 'layers/'
       periods:  '#periods',                 // optional; container of the page's period buttons (data-key, aria-pressed)
       period:   '1930s',                    // optional; start period if there are no period buttons
       before:   ['walk-halo','walk','dash-halo','dash'],  // optional; layers are drawn below the first of these present
       anchorPrefix: '',                     // optional; put in front of each feature's target id
       onChange: function(id, on, bounds){}  // optional; called when a switch changes (bounds = LngLatBounds of shown features)
       jumpToPeriod: true,                   // optional, off by default; switching a shaded layer ON when it has nothing in the
                                             //   current period moves the page to the nearest period that does (a tie goes to 'today',
                                             //   else the later one). Needs the page's period buttons (clicked for you) or requestPeriod.
       requestPeriod: function(key){},       // optional; how the page changes period. Default: click the period button with that data-key
       periodOrder: ['1880s','today'],       // optional; period keys in order, if there are no period buttons to read the order from
       fit: {padding:{top:30,bottom:30,left:24,right:24}, maxZoom:13}  // optional, off by default; after a period change or a
                                             //   shaded-layer switch, fit the map to that layer's features visible in the period
     });
   Any open popup is closed whenever a layer is switched or the period or date changes.
   Returns a handle with setPeriod(key), setDate('MM-DD' or null), set(id, on), isOn(id).
   Missing or broken layer files are skipped quietly (a console warning only). */
(function(){
  'use strict';
  var SCRIPT_SRC = (document.currentScript && document.currentScript.src) || '';
  var DEFAULT_BASE = SCRIPT_SRC ? SCRIPT_SRC.replace(/[^\/]*$/, '') + 'layers/' : 'layers/';
  var CSS =
    '.tl-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}' +
    '.tl-btn{font:inherit;font-size:.86em;min-height:42px;min-width:42px;padding:4px 12px;border:1px dashed var(--c,#333);border-radius:6px;background:#fff;color:var(--ink,#161616);cursor:pointer}' +
    '.tl-btn[aria-pressed="true"]{background:var(--c,#333);border-style:solid;color:#fff}' +
    '.tl-btn.tl-fill{border-style:solid}' +
    '.tl-leg{font-size:.84em;color:var(--dim,#5a5d63);margin:4px 0 0}' +
    '.tl-leg details{margin:4px 0 0}.tl-leg summary{cursor:pointer;min-height:32px;padding:4px 0;font-weight:600}' +
    '.tl-leg .tl-none{display:block;margin-top:4px;padding:6px 8px;border-radius:6px;background:rgba(255,255,255,.7);color:var(--ink,#161616)}' +
    '.tl-leg .tl-sw,.tl-pop .tl-sw{display:inline-block;width:12px;height:12px;border:2px solid;border-radius:3px;vertical-align:-1px;margin:0 4px 0 8px}' +
    '.tl-leg .tl-dot{display:inline-block;width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35);vertical-align:-1px;margin:0 4px 0 8px}' +
    '.tl-lab{font:700 12px/1.15 system-ui,sans-serif;text-align:center;color:#1a1a1a;text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 3px #fff;cursor:pointer;white-space:nowrap;padding:2px 4px}' +
    '.tl-lab small{display:block;font-weight:600;font-size:11px}' +
    '.tl-pop b{display:block;margin-bottom:3px}.tl-pop .tl-ja{font-weight:normal;color:#5a5d63}.tl-pop .tl-meta{display:block;font-size:.9em;color:#5a5d63;margin-top:3px}';

  function $(x){ return !x ? null : (typeof x === 'string' ? document.querySelector(x) : x); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function darken(h, k){
    var m = /^#?([0-9a-f]{6})$/i.exec(h || ''); if (!m) return h || '#333';
    var n = parseInt(m[1], 16);
    return 'rgb(' + Math.round(((n >> 16) & 255) * k) + ',' + Math.round(((n >> 8) & 255) * k) + ',' + Math.round((n & 255) * k) + ')';
  }
  function injectCss(){
    if (document.getElementById('tl-css')) return;
    var s = document.createElement('style'); s.id = 'tl-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  function eachCoord(g, fn){
    if (!g) return;
    (function walk(c){ if (typeof c[0] === 'number') fn(c); else c.forEach(walk); })(g.coordinates);
  }
  /* month-day window, e.g. {from:'11-20', to:'12-10'}; a window may wrap past New Year */
  function inWindow(w, d){
    if (!w || !d) return true;
    var f = w.from || '01-01', t = w.to || '12-31';
    return f <= t ? (d >= f && d <= t) : (d >= f || d <= t);
  }
  /* The feature as it is in one period: a copy of the feature with that period's overrides laid on top,
     or null when it is hidden then. A period entry is a bare geometry (has "type"), null (hidden), or an
     object with a "geometry" and any of category, colour, name, ja, label, note, made, lines, approx. */
  function viewOf(f, period){
    var p = f.periods;
    if (p && period != null && Object.prototype.hasOwnProperty.call(p, period)){
      var e = p[period];
      if (!e) return null;
      var o = {}, k;
      for (k in f) if (k !== 'periods' && k !== 'geometry') o[k] = f[k];
      if (e.type){ o.geometry = e; return o; }
      if (!e.geometry) return null;
      for (k in e) o[k] = e[k];
      return o;
    }
    return f.geometry ? f : null;
  }
  /* Period keys in which a layer has at least one feature to show (null = every period). */
  function coveredKeys(def){
    var ks = {}, all = false;
    def.features.forEach(function(f){
      if (f.geometry) all = true;
      var p = f.periods || {};
      Object.keys(p).forEach(function(k){ var e = p[k]; if (e && (e.type || e.geometry)) ks[k] = true; });
    });
    return all ? null : Object.keys(ks);
  }
  function geomFor(f, period){ var v = viewOf(f, period); return v ? v.geometry : null; }

  function attach(map, opts){
    opts = opts || {};
    injectCss();
    var base = opts.base || DEFAULT_BASE;
    if (base.slice(-1) !== '/') base += '/';
    var names = opts.layers || [];
    var startOn = opts.on || [];
    var before = opts.before || ['walk-halo', 'walk', 'dash-halo', 'dash'];
    var prefix = opts.anchorPrefix || '';
    var L = {};          // id -> {def, on, markers, btn}
    var order = [];      // ids in the order asked for
    var state = {period: opts.period || null, date: opts.date || null};
    var api = {setPeriod: setPeriod, setDate: setDate, set: set, isOn: function(id){ return !!(L[id] && L[id].on); }, layers: L};

    var pbox = $(opts.periods || '#periods');
    if (pbox){
      var cur = pbox.querySelector('[aria-pressed="true"]');
      if (cur && cur.dataset.key) state.period = cur.dataset.key;
      /* The page's own setPeriod() flips aria-pressed on its buttons; watching that attribute
         follows every period change (clicks or code) without touching the page's script. */
      new MutationObserver(function(){
        var b = pbox.querySelector('[aria-pressed="true"]');
        if (b && b.dataset.key && b.dataset.key !== state.period) setPeriod(b.dataset.key);
      }).observe(pbox, {subtree: true, attributes: true, attributeFilter: ['aria-pressed']});
    }

    /* isStyleLoaded() stays false while tiles load, and 'load' fires only once, so test the style itself */
    function whenReady(fn){ if (map.style && map.style._loaded) fn(); else map.once('load', fn); }

    Promise.all(names.map(function(n){
      return fetch(base + n + '.json').then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function(def){ if (!def.id) def.id = n; return def; })
        .catch(function(e){ if (window.console) console.warn('map-layers: skipped ' + n + ' (' + e.message + ')'); return null; });
    })).then(function(defs){
      whenReady(function(){
        defs.forEach(function(def){ if (def && Array.isArray(def.features)) { try { add(def); } catch(e){ if (window.console) console.warn('map-layers: could not draw ' + def.id, e); } } });
        buildControls();
        var firstFill = null;
        order.forEach(function(id){
          var want = startOn.indexOf(id) >= 0;
          if (want && L[id].def.kind === 'fill'){ if (firstFill) want = false; else firstFill = id; }
          if (want) set(id, true, true);
        });
      });
    });

    function beforeId(){
      var ls = (map.getStyle().layers || []);
      for (var i = 0; i < ls.length; i++) if (before.indexOf(ls[i].id) >= 0) return ls[i].id;
      return undefined;
    }
    function catOf(def, f){
      var cats = def.categories || [];
      for (var i = 0; i < cats.length; i++) if (cats[i].key === f.category) return cats[i];
      return null;
    }
    function colourOf(def, f){
      if (f.colour) return f.colour;
      var c = catOf(def, f);
      return c ? c.colour : ((def.style && def.style.colour) || '#555');
    }
    function collection(def){
      var st = def.style || {}, k = st.outlineDarken == null ? 0.6 : st.outlineDarken;
      var fo = def.kind === 'fill' ? (st.fillOpacity == null ? 0.45 : st.fillOpacity) : (st.fillOpacity || 0), out = [];
      def.features.forEach(function(f){
        var v = viewOf(f, state.period);
        if (!v || (def.kind === 'points' && !inWindow(f.when, state.date))) return;
        var col = colourOf(def, v), c = catOf(def, v);
        var props = {id: f.id, colour: col, dark: darken(col, k), op: (c && c.opacity != null) ? c.opacity : fo, dash: !!(c && c.dash)};
        if (v.lineWidth) props.lw = v.lineWidth;   /* optional per-feature outline width (2026-11-18) */
        out.push({type: 'Feature', geometry: v.geometry, properties: props});
      });
      return {type: 'FeatureCollection', features: out};
    }
    function featureById(def, id){ for (var i = 0; i < def.features.length; i++) if (def.features[i].id === id) return def.features[i]; return null; }

    var popup = null;
    function closePopup(){ if (popup){ popup.remove(); popup = null; } }
    function tap(def, f, lngLat){
      if (popup){ popup.remove(); popup = null; }
      var t = f.target && document.getElementById(prefix + String(f.target).replace(/^#/, ''));
      if (t){ t.scrollIntoView({behavior: 'smooth', block: 'start'}); return; }
      var meta = [], extra = '', cat = catOf(def, f), pl = def.periodLabels && state.period && def.periodLabels[state.period];
      if (pl) meta.push(esc(pl));
      if (f.made) extra += '<span class="tl-meta">Made then: ' + esc(f.made) + '</span>';
      if (cat) extra += '<span class="tl-meta"><span class="tl-sw" style="border-color:' + cat.colour + ';margin-left:0">&#8203;</span>' + esc(cat.short || cat.name) + '</span>';
      (f.lines || []).forEach(function(t){ extra += '<span class="tl-meta">' + esc(t) + '</span>'; });
      if (f.when && (f.when.from || f.when.to)) meta.push('Season: ' + esc(f.when.label || ((f.when.from || '') + ' to ' + (f.when.to || ''))));
      if (f.hours) meta.push('Hours: ' + esc(f.hours));
      if (f.approx) meta.push(def.kind === 'points' ? 'Position approximate.' : 'Outline approximate.');
      popup = new maplibregl.Popup({offset: 12, closeButton: false, className: 'tl-pop', maxWidth: '280px'}).setLngLat(lngLat)
        .setHTML('<b>' + esc(f.name) + (f.ja ? ' <span class="tl-ja">' + esc(f.ja) + '</span>' : '') + '</b>' + esc(f.note || '') + extra +
                 (meta.length ? '<span class="tl-meta">' + meta.join(' · ') + '</span>' : '')).addTo(map);
    }

    function add(def){
      var id = def.id, src = 'tl-' + id, st = def.style || {}, b = beforeId(), ids = [];
      L[id] = {def: def, on: false, markers: [], btn: null, ids: ids};
      order.push(id);
      map.addSource(src, {type: 'geojson', data: collection(def)});
      if (def.kind === 'points'){
        ids.push(src + '-pt');
        map.addLayer({id: src + '-pt', type: 'circle', source: src, layout: {visibility: 'none'},
          paint: {'circle-radius': st.radius || 7, 'circle-color': ['get', 'colour'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 2}}, b);
      } else {
        var fo = def.kind === 'fill' ? (st.fillOpacity == null ? 0.45 : st.fillOpacity) : (st.fillOpacity || 0);
        def._fillOpacity = fo;
        ids.push(src + '-fill', src + '-line');
        map.addLayer({id: src + '-fill', type: 'fill', source: src, layout: {visibility: 'none'},
          paint: {'fill-color': ['get', 'colour'], 'fill-opacity': def.kind === 'fill' ? ['get', 'op'] : fo}}, b);
        var lw = st.lineWidth || (def.kind === 'fill' ? 1 : 2);
        map.addLayer({id: src + '-line', type: 'line', source: src, filter: ['!=', ['get', 'dash'], true], layout: {visibility: 'none', 'line-join': 'round'},
          paint: {'line-color': ['get', 'dark'], 'line-width': ['coalesce', ['get', 'lw'], lw]}}, b);
        if (def.kind === 'fill'){   /* categories marked dash:true get a dashed outline */
          ids.push(src + '-dash');
          map.addLayer({id: src + '-dash', type: 'line', source: src, filter: ['==', ['get', 'dash'], true], layout: {visibility: 'none', 'line-join': 'round'},
            paint: {'line-color': ['get', 'dark'], 'line-width': lw, 'line-dasharray': [3, 2]}}, b);
        }
      }
      var hit = ids[0];
      map.on('click', hit, function(e){
        /* a plain outline layer stands aside while a shaded layer is on, so one tap opens one popup */
        if (def.kind === 'outline' && Object.keys(L).some(function(k){ return L[k].on && L[k].def.kind === 'fill'; })) return;
        var f = e.features && e.features[0] && featureById(def, e.features[0].properties.id);
        f = f && viewOf(f, state.period);
        if (f) tap(def, f, e.lngLat);
      });
      map.on('mouseenter', hit, function(){ map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', hit, function(){ map.getCanvas().style.cursor = ''; });
      labels(id);
    }

    /* fz = the feature's own labelMinZoom (2026-11-18); features without one behave exactly as before */
    function labelShown(def, on, fz){ return on && !(def.labelMinZoom && map.getZoom() < def.labelMinZoom) && !(fz && map.getZoom() < fz); }
    function showLabels(){ order.forEach(function(id){ var o = L[id]; o.markers.forEach(function(m){ var el = m.getElement(); el.style.display = labelShown(o.def, o.on, +el.dataset.minz || 0) ? '' : 'none'; }); }); }
    map.on('zoom', showLabels);
    function labels(id){
      var o = L[id], def = o.def;
      o.markers.forEach(function(m){ m.remove(); }); o.markers = [];
      var mode = def.labels || (def.kind === 'points' ? 'none' : 'all');
      if (mode === 'none') return;
      def.features.forEach(function(f0){
        var f = viewOf(f0, state.period), g = f && f.geometry;
        if (!g || (def.kind === 'points' && !inWindow(f.when, state.date))) return;
        var at = f.label || (g.type === 'Point' ? g.coordinates : null);
        if (!at) return;
        var el = document.createElement('div');
        el.className = 'tl-lab';
        if (f.labelMinZoom) el.dataset.minz = f.labelMinZoom;
        el.style.display = labelShown(def, o.on, f.labelMinZoom || 0) ? '' : 'none';
        el.innerHTML = esc(f.name) + (f.ja ? '<small>' + esc(f.ja) + '</small>' : '');
        el.addEventListener('click', function(ev){ ev.stopPropagation(); tap(def, f, at); });
        o.markers.push(new maplibregl.Marker({element: el, anchor: def.kind === 'points' ? 'top' : 'center', offset: def.kind === 'points' ? [0, 8] : [0, 0]}).setLngLat(at).addTo(map));
      });
    }

    function buildControls(){
      var box = $(opts.controls);
      if (box){
        var row = document.createElement('div'); row.className = 'tl-row';
        order.forEach(function(id){
          var def = L[id].def, btn = document.createElement('button');
          btn.type = 'button'; btn.className = 'tl-btn' + (def.kind === 'fill' ? ' tl-fill' : '');
          btn.setAttribute('aria-pressed', 'false'); btn.textContent = def.title || id;
          if (def.kind === 'fill') btn.title = 'Only one shaded layer shows at a time';
          btn.addEventListener('click', function(){ set(id, !L[id].on); });
          L[id].btn = btn; row.appendChild(btn);
        });
        box.appendChild(row);
      }
      renderLegend();
    }

    /* name of a period: the page's own button label if it has one, else the layer's periodLabels, else the key */
    function periodName(def, key){
      var b = pbox && pbox.querySelector('[data-key="' + key + '"]');
      if (b && b.textContent.trim()) return b.textContent.trim();
      return (def.periodLabels && def.periodLabels[key]) || key;
    }
    var openNotes = {};
    function renderLegend(){
      var box = $(opts.legend); if (!box) return;
      var parts = [];
      [].forEach.call(box.querySelectorAll('.tl-leg'), function(el){ var d = el.querySelector('details'); if (d) openNotes[el.getAttribute('data-layer')] = d.open; });
      order.forEach(function(id){
        var o = L[id], def = o.def; if (!o.on) return;
        var dot = def.kind === 'points' ? 'tl-dot' : 'tl-sw';
        var used = {};
        def.features.forEach(function(f){ var v = viewOf(f, state.period); if (v && (def.kind !== 'points' || inWindow(f.when, state.date))) used[v.category] = true; });
        var items = (def.categories && def.categories.length) ? def.categories.filter(function(c){ return state.period == null || used[c.key]; }).map(function(c){ return {name: c.name, colour: c.colour}; })
          : def.features.map(function(f){ return viewOf(f, state.period); }).filter(Boolean).map(function(f){ return {name: f.name + (f.approx ? ' (approximate)' : ''), colour: colourOf(def, f)}; });
        var none = state.period != null && !def.features.some(function(f){ return viewOf(f, state.period) && (def.kind !== 'points' || inWindow(f.when, state.date)); });
        var cov = coveredKeys(def);
        /* optional layer-level legendNote (2026-11-18): one line of text in place of the swatches */
        var sw = def.legendNote ? esc(def.legendNote) : items.map(function(it){
          var css = def.kind === 'points' ? 'background:' + it.colour : 'border-color:' + it.colour;
          return '<span class="' + dot + '" style="' + css + '">&#8203;</span>' + esc(it.name);
        }).join('');
        var noData = '';
        if (none && cov){
          var names = cov.map(function(k){ return periodName(def, k); });
          noData = '<span class="tl-none">No data for this period. This layer covers: ' + esc(names.join(', ')) + '.</span>';
        }
        /* a long note folds away so the legend does not fill a phone screen */
        var note = def.note ? (def.note.length > 220 ? '<details' + (openNotes[id] ? ' open' : '') + '><summary>About this layer</summary>' + esc(def.note) + '</details>' : '<br>' + esc(def.note)) : '';
        parts.push('<div class="legend tl-leg" data-layer="' + esc(id) + '">' + (def.legendIntro ? esc(def.legendIntro) + '<br>' : '') + noData + sw +
          note + (def.credit ? '<br>' + esc(def.credit) : '') + '</div>');
      });
      box.innerHTML = parts.join('');
      box.hidden = !parts.length;
    }

    function boundsOf(id){
      var b = null;
      L[id].def.features.forEach(function(f){ eachCoord(geomFor(f, state.period), function(p){ if (!b) b = new maplibregl.LngLatBounds(p, p); else b.extend(p); }); });
      return b;
    }

    function applyTints(){
      /* outline layers may carry a light tint; it drops away while a shaded (fill) layer is on */
      var fillOn = order.some(function(id){ return L[id].on && L[id].def.kind === 'fill'; });
      order.forEach(function(id){
        var def = L[id].def;
        if (def.kind === 'outline' && map.getLayer('tl-' + id + '-fill')) map.setPaintProperty('tl-' + id + '-fill', 'fill-opacity', fillOn ? 0 : def._fillOpacity);
      });
    }

    function set(id, on, quiet){
      var o = L[id]; if (!o) return;
      if (on && o.def.kind === 'fill') order.forEach(function(k){ if (k !== id && L[k].on && L[k].def.kind === 'fill') set(k, false, true); });
      closePopup();
      o.on = !!on;
      o.ids.forEach(function(l){ map.setLayoutProperty(l, 'visibility', on ? 'visible' : 'none'); });
      showLabels();
      if (o.btn) o.btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      applyTints();
      var jumped = false;
      if (on) jumped = maybeJump(id);
      if (!jumped){ renderLegend(); if (on && !quiet) fitActive(id); }
      if (opts.onChange && !quiet) opts.onChange(id, o.on, boundsOf(id));
    }
    function hasFeatures(def, key){
      return def.features.some(function(f){ return viewOf(f, key) && (def.kind !== 'points' || inWindow(f.when, state.date)); });
    }
    /* Opt-in: a shaded layer switched on with nothing in the current period moves the page to the nearest period that has something. */
    function periodList(){
      if (opts.periodOrder) return opts.periodOrder;
      var out = []; if (pbox) [].forEach.call(pbox.querySelectorAll('[data-key]'), function(b){ out.push(b.dataset.key); });
      return out;
    }
    function maybeJump(id){
      var def = L[id].def;
      if (!opts.jumpToPeriod || def.kind !== 'fill' || state.period == null || hasFeatures(def, state.period)) return false;
      var list = periodList(), here = list.indexOf(state.period), best = null, bd = 1e9;
      if (here < 0) return false;
      list.forEach(function(k, i){
        if (!hasFeatures(def, k)) return;
        var d = Math.abs(i - here);
        if (d < bd || (d === bd && (k === 'today' || (best !== 'today' && i > list.indexOf(best))))){ bd = d; best = k; }
      });
      if (!best) return false;
      if (opts.requestPeriod) opts.requestPeriod(best);
      else { var b = pbox && pbox.querySelector('[data-key="' + best + '"]'); if (b) b.click(); }
      setPeriod(best);   /* no-op for the data if the page already did it; redraws and refits either way */
      return true;
    }
    /* Opt-in: fit the map to what the shaded layer shows in this period; no fit when nothing shows. */
    function fitActive(only){
      if (!opts.fit) return;
      var id = only && L[only] && L[only].on && L[only].def.kind === 'fill' ? only : null;
      if (!id) order.forEach(function(k){ if (L[k].on && L[k].def.kind === 'fill') id = k; });
      if (!id) return;
      var b = boundsOf(id); if (!b) return;
      map.fitBounds(b, {padding: opts.fit.padding != null ? opts.fit.padding : 30, maxZoom: opts.fit.maxZoom || 13, duration: 500});
    }

    function redraw(){
      order.forEach(function(id){
        var s = map.getSource('tl-' + id); if (s) s.setData(collection(L[id].def));
        labels(id);
      });
      renderLegend();
    }
    function setPeriod(key){ closePopup(); state.period = key; if (order.length){ redraw(); fitActive(); } }
    function setDate(mmdd){ closePopup(); state.date = mmdd || null; if (order.length) redraw(); }

    return api;
  }

  window.TokyoLayers = {attach: attach, version: '1'};
})();
