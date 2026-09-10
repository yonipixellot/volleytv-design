/**
 * Halo Storybook audit harness — contrast + target-size + text-overflow + render errors.
 *
 * USAGE: open http://localhost:6006/iframe.html?id=tokens-colors--palette (the bare
 * PREVIEW context — the manager page blocks iframe.contentDocument), paste this file
 * into the console (or inject via devtools/automation), then:
 *
 *   __audit.run({ themes: ['dark','light'], skins: ['base','ba','hoopstv'], checks: ['contrast','target','overflow','axe'], width: 390 })
 *   opts.sink = 'http://localhost:4299/save' (or window.__AUDIT_SINK) + opts.name: POST {res,status} every 25 stories and at the end,
 *   so a Vite full-reload of the preview page never loses a pass. opts.startIndex resumes a flat counter.
 *   __audit.summary()      // { 'axe:<rule>' | 'axe-inc:<rule>' | contrast | target | overflow : { stories, nodes } }
 *   __audit.status()        // { i, total, running }
 *   __audit.result()        // grouped offenders when done
 *
 * Checks:
 *  - contrast : WCAG 1.4.3 text contrast (4.5:1 / 3:1 large) vs resolved solid bg.
 *               Skips text over imagery/gradients (media layer owns those) — known
 *               blind spot: sibling overlays (scrims) may misattribute the bg.
 *  - target   : WCAG 2.5.8 interactive targets >= 24x24 (inline-text exception).
 *  - overflow : text spilling >2px past a SHAPED visual container (radius >= 6px with
 *               visible bg/border and overflow visible) — catches "MY GAMES spills
 *               the nav circle" class bugs that contrast/axe never see.
 *  - axe      : axe-core (loaded from opts.axeSrc || window.__AXE_SRC) with WCAG 2.x A/AA + 2.2 AA + best-practice tags;
 *               page-level rules (region/landmark/h1/lang/title/bypass) disabled — stories are fragments.
 *               Reports `violations` (kind 'axe') AND `incomplete` (kind 'axe-inc', e.g. contrast through glass) separately.
 *               opts.axeRules: ['color-contrast'] restricts axe to those rules (cheap colour-only passes per skin×theme).
 *  - render errors: Storybook error boundary visible.
 */
(() => {
  const parse = c => { const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); return m ? {r:+m[1],g:+m[2],b:+m[3],a:m[4]===undefined?1:+m[4]} : null; };
  const lum = c => { const s=[c.r,c.g,c.b].map(v=>{v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4)}); return .2126*s[0]+.7152*s[1]+.0722*s[2]; };
  const coveredByMedia = (p, rect) => { for (const m of p.querySelectorAll('img,video')) { const mr = m.getBoundingClientRect(); if (mr.left<=rect.left+2 && mr.right>=rect.right-2 && mr.top<=rect.top+2 && mr.bottom>=rect.bottom-2 && mr.width>4) return true; } return false; };

  const contrastScan = (doc) => {
    const W = doc.defaultView; const issues = []; const seen = new Set();
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT); let n;
    while (n = walker.nextNode()) {
      const t = (n.textContent||'').trim(); if (!t) continue;
      const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
      const cs = W.getComputedStyle(el);
      if (cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0) continue;
      const rect = el.getBoundingClientRect(); if (rect.width<2||rect.height<2) continue;
      let bg=null, p=el, media=false;
      while (p && p !== doc.documentElement) {
        if (coveredByMedia(p, rect) && p!==el) { media=true; break; }
        const pcs = W.getComputedStyle(p); const bc = parse(pcs.backgroundColor);
        if (bc && bc.a>0.6) { bg=bc; break; }
        if (pcs.backgroundImage!=='none' && !(bc && bc.a>0.6)) { if (p.classList.contains('sb-frame') && bc) { bg=bc; } media = !bg; break; }
        p = p.parentElement;
      }
      if (media || !bg) continue;
      const fgc = parse(cs.color); if (!fgc) continue;
      const fg = {r: fgc.r*fgc.a + bg.r*(1-fgc.a), g: fgc.g*fgc.a + bg.g*(1-fgc.a), b: fgc.b*fgc.a + bg.b*(1-fgc.a)};
      const l1=lum(fg), l2=lum(bg);
      const ratio=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
      const fs = parseFloat(cs.fontSize); const big = fs>=24 || (fs>=18.66 && +cs.fontWeight>=700);
      if (ratio < (big?3:4.5)) issues.push({kind:'contrast', t: t.slice(0,18), ratio: +ratio.toFixed(2), cls: String(el.className).slice(0,26)});
    }
    return issues;
  };

  const targetScan = (doc) => {
    const issues = [];
    for (const el of doc.querySelectorAll('button, a[href], input, select, [role=button], [role=tab], [role=switch]')) {
      const cs = doc.defaultView.getComputedStyle(el);
      if (cs.display==='none' || cs.visibility==='hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.width >= 24 && r.height >= 24) continue;
      if (cs.display === 'inline' && el.closest('p, span, td, li')) continue;
      issues.push({kind:'target', cls: String(el.className).slice(0,26), w: Math.round(r.width), h: Math.round(r.height)});
    }
    return issues;
  };

  const overflowScan = (doc) => {
    const W = doc.defaultView; const issues = [];
    for (const el of doc.querySelectorAll('*')) {
      const cs = W.getComputedStyle(el);
      if (cs.display==='none'||cs.visibility==='hidden') continue;
      if (cs.overflowX !== 'visible') continue;
      const hasBg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none' || parseFloat(cs.borderTopWidth) > 0;
      const br = parseFloat(cs.borderTopLeftRadius) || 0;
      if (!hasBg || br < 6) continue;              // "shaped" visual container only
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      const walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n, spill = 0, sample = '';
      while (n = walker.nextNode()) {
        const t = (n.textContent||'').trim(); if (!t) continue;
        let p = n.parentElement, clipped = false;
        while (p && p !== el) { const pcs = W.getComputedStyle(p); if (pcs.overflowX !== 'visible') { clipped = true; break; } p = p.parentElement; }
        if (clipped) continue;
        const range = doc.createRange(); range.selectNodeContents(n);
        const tr = range.getBoundingClientRect(); if (tr.width < 1) continue;
        const s = Math.max(0, tr.right - r.right) + Math.max(0, r.left - tr.left) + Math.max(0, tr.bottom - r.bottom) + Math.max(0, r.top - tr.top);
        if (s > spill) { spill = s; sample = t.slice(0,18); }
      }
      if (spill > 2) issues.push({kind:'overflow', cls: String(el.className).slice(0,26), spill: +spill.toFixed(1), t: sample});
    }
    return issues;
  };

  const AXE_TAGS = ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice'];
  const AXE_FRAGMENT_OFF = { region:{enabled:false}, 'landmark-one-main':{enabled:false}, 'page-has-heading-one':{enabled:false}, 'html-has-lang':{enabled:false}, 'document-title':{enabled:false}, bypass:{enabled:false} };
  const ensureAxe = (d, src) => new Promise((ok, rej) => {
    if (d.defaultView.axe) return ok();
    const s = d.createElement('script'); s.src = src; s.onload = () => ok(); s.onerror = () => rej('axeLoad:' + src);
    d.head.appendChild(s);
  });
  const axeScan = async (d, src, rules) => {
    await ensureAxe(d, src);
    const ctx = d.getElementById('storybook-root') || d.body;
    const runOnly = rules && rules.length ? { type: 'rule', values: rules } : { type: 'tag', values: AXE_TAGS };
    const r = await d.defaultView.axe.run(ctx, { runOnly, rules: AXE_FRAGMENT_OFF, resultTypes: ['violations', 'incomplete'] });
    const pick = (v, kind) => ({ kind, id: v.id, impact: v.impact, n: v.nodes.length, t: String((v.nodes[0] && v.nodes[0].target[0]) || '').slice(0, 40), h: String((v.nodes[0] && v.nodes[0].html) || '').slice(0, 70) });
    return r.violations.map(v => pick(v, 'axe')).concat(r.incomplete.map(v => pick(v, 'axe-inc')));
  };
  window.__auditLib = { parse, lum, contrastScan, targetScan, overflowScan, axeScan, ensureAxe, AXE_TAGS };

  const state = { running: false, i: 0, total: 0, res: {} };
  window.__audit = {
    status: () => ({ running: state.running, i: state.i, total: state.total }),
    result: () => state.res,
    summary: () => { const agg = {}; for (const list of Object.values(state.res)) for (const it of list) { const key = (it.kind === 'axe' || it.kind === 'axe-inc') ? it.kind + ':' + it.id : (it.kind || 'err'); agg[key] = agg[key] || { stories: 0, nodes: 0 }; agg[key].stories++; agg[key].nodes += it.n || 1; } return agg; },
    run: (opts = {}) => {
      const themes = opts.themes || ['dark', 'light'];
      const skins = opts.skins || ['base'];
      const checks = opts.checks || ['contrast', 'target', 'overflow'];
      const width = opts.width || 390, height = opts.height || 844;
      const axeSrc = opts.axeSrc || window.__AXE_SRC || '/node_modules/axe-core/axe.min.js';
      const axeRules = opts.axeRules || null;
      const sink = opts.sink || window.__AUDIT_SINK || null, name = opts.name || 'sb', startIndex = opts.startIndex || 0;
      const flush = async (final) => { if (!sink) return; try { await fetch(sink + '?name=' + encodeURIComponent(name), { method: 'POST', body: JSON.stringify({ name, final, status: { i: state.i, total: state.total }, res: state.res }) }); } catch (e) { /* sink down */ } };
      state.running = true; state.i = 0; state.res = {};
      (async () => {
        let fr = document.getElementById('__audit_fr');
        if (!fr || !fr.contentDocument) { fr && fr.remove(); fr = document.createElement('iframe'); fr.id='__audit_fr'; fr.style.cssText='position:fixed;left:0;top:0;opacity:0.01;pointer-events:none'; document.body.appendChild(fr); }
        fr.style.width = width + 'px'; fr.style.height = height + 'px';
        const idx = await fetch('/index.json').then(r=>r.json());
        let ids = Object.values(idx.entries).filter(e=>e.type==='story').map(e=>e.id);
        if (opts.only) ids = ids.filter(id => opts.only.some(o => id.includes(o)));
        state.total = ids.length * themes.length * skins.length;
        for (const skin of skins) {
        for (const theme of themes) {
          const tag = skins.length > 1 || skins[0] !== 'base' ? `${skin}/${theme}` : theme;
          for (const id of ids) {
            state.i++; if (state.i <= startIndex) continue; if (state.i % 25 === 0) await flush(false);
            try {
              await new Promise((ok, rej) => { const to=setTimeout(()=>rej('loadTO'), 9000); fr.onload = ()=>{clearTimeout(to);ok();}; fr.src = `/iframe.html?id=${id}&globals=theme:${theme};skin:${skin}`; });
              // 900 ms: the segmented toggle positions its thumb via ResizeObserver + microtask;
              // at 520 ms the thumb was read under the wrong tab (false contrast hits, 2026-09-02).
              await new Promise(ok => setTimeout(ok, opts.settle || 900));
              const d = fr.contentDocument;
              const errEl = d.querySelector('.sb-errordisplay');
              if (errEl && d.defaultView.getComputedStyle(errEl).display !== 'none') { state.res[`${tag}:${id}`] = [{kind:'render', err: (errEl.textContent||'').trim().slice(0,60)}]; continue; }
              let iss = [];
              if (checks.includes('contrast')) iss = iss.concat(contrastScan(d));
              if (checks.includes('target')) iss = iss.concat(targetScan(d));
              if (checks.includes('overflow')) iss = iss.concat(overflowScan(d));
              if (checks.includes('axe')) iss = iss.concat(await axeScan(d, axeSrc, axeRules));
              if (iss.length) state.res[`${tag}:${id}`] = iss.slice(0, 16);
            } catch(e) { state.res[`${tag}:${id}`] = [{err: String(e).slice(0,30)}]; }
          }
        }
        }
        await flush(true); state.running = false;
      })();
      return `audit started: ${skins.join('+')} × ${themes.join('+')} / ${checks.join('+')}`;
    },
  };
  return 'sb-audit harness installed → __audit.run()';
})();
