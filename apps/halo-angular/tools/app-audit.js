/**
 * Halo live-app audit harness — walks the RUNNING Angular app (`ng serve`, dev mode) across
 * routes × persona × tier × skin × theme and runs axe-core + the shared sb-audit scanners
 * (contrast vs resolved bg, 2.5.8 target size, text overflow). Companion to tools/sb-audit.js.
 *
 * USAGE (from the app tab, e.g. http://localhost:4200/home; Storybook dev server up on :6006 —
 * it serves this file, sb-audit.js and axe-core; the Angular dev server only serves public/):
 *
 *   for (const f of ['tools/sb-audit.js', 'tools/app-audit.js']) {
 *     const s = document.createElement('script'); s.src = 'http://localhost:6006/' + f; document.head.appendChild(s);
 *   }
 *   window.__AXE_SRC = 'http://localhost:6006/@fs/<abs path to>/axe-core/axe.min.js';
 *   __appAudit.run({ combos: [{ skin: 'hoopstv', theme: 'dark' }], personas: ['adult'], tiers: ['premium'] });
 *   opts.sink = 'http://localhost:4299/save' (or window.__AUDIT_SINK) + opts.name/opts.meta: POST {res,pages,status} every 25 pages and at the end.
 *   __appAudit.status()            // { running, i, total, pages, errored, redirected }
 *   __appAudit.summary('product')  // { 'axe:<rule>' | 'axe-inc:<rule>' | contrast | target | overflow : { nodes, pages, unique, impact } }
 *   __appAudit.detail('axe:color-contrast', 40, 'product')   // unique offenders with sample pages
 *   __appAudit.pages('err') / __appAudit.pages('redirect')   // harness-sanity: never trust a number with errored pages
 *
 *   'glass' (1.4.3 over gradients/images — the axe blind spot): for each text node whose resolved background is a
 *   gradient or an image, compute the contrast against EVERY gradient stop (composited over the nearest solid colour)
 *   and report the worst ('glass' if below the threshold, 'glass-ok' otherwise); an image with no gradient scrim is
 *   reported as 'needs eyes'. This is the documented substitute for a manual glass process; the residue is for a human.
 *   Extra DOM checks (opts.checks): 'reflow' (1.4.10 — content wider than the viewport outside a scroll container),
 *   'motion' (2.2.2 — running infinite animations), 'media' (1.2.x — video/audio autoplay/controls/caption tracks).
 *
 *   Manual keyboard pass (2.1.1 / 2.4.3 / 2.4.7 / 2.4.11 / 4.1.2): __appAudit.kb.start(); press Tab with REAL keyboard
 *   input (programmatic .focus() does not produce :focus-visible); then __appAudit.kb.report() — accessible name,
 *   :focus-visible + visible ring, obscured-by-sticky-chrome, DOM-order breaks, dupes.
 *
 * Buckets: 'devbar' (node inside <app-dev-bar>) vs 'product'. The dev-bar is hidden during the walk by
 * default (opts.hideDevBar=false to keep it) so demo chrome doesn't repeat on every route.
 * Dev-only: not referenced by the app, never bundled.
 */
(() => {
  const SB = window.__HALO_SB_ORIGIN || 'http://localhost:6006';
  const ROUTES = [
    '/home', '/games', '/game/g-12may', '/game/g-12may?tab=highlights', '/game/g-12may?tab=stats', '/game?tab=stats&processing=1',
    '/team/hoopstars-1', '/team/hoopstars-1?demoEmpty=games',
    '/events/live', '/events/upcoming', '/events/highlights',
    '/watch/live', '/watch/vod', '/watch/vod?kind=full', '/watch/vod?kind=full&buffering=1', '/watch/vod?kind=full&loading=1', '/watch/highlight',
    '/you', '/you?tab=Clips', '/you?tab=Stats', '/you?demoEmpty=clips,stats', '/you?tab=Clips&demoEmpty=clipfilters',
    '/follows', '/notifications', '/settings', '/settings/notifications', '/account', '/account/change-password', '/account/delete',
    '/subscription', '/upgrade', '/upgrade?pkg=6mo', '/language', '/privacy', '/help', '/feedback', '/accessibility', '/tour', '/invite', '/coach-admin',
    '/get-started', '/onboarding', '/onboarding/sso',
    '/onboarding/sso?demoOutcome=single&demoStep=consent', '/onboarding/sso?demoOutcome=single&demoStep=teams',
    '/onboarding/sso?demoOutcome=single&demoStep=teammates', '/onboarding/sso?demoOutcome=single&demoStep=notif',
    '/onboarding/sso?demoOutcome=none&demoStep=consent', '/onboarding/invite/demo-invite-001',
    '/auth/sign-in', '/auth/sign-up', '/auth/forgot', '/auth/reset', '/auth/verify', '/auth/verify-code', '/auth/complete-profile',
  ];
  const TIER_ROUTES = ROUTES.filter(r => /^\/(home|games|game|team|events|watch|you|subscription|upgrade|follows|notifications)/.test(r));

  const app = () => {
    const el = document.querySelector('app-root');
    const c = window.ng && window.ng.getComponent && window.ng.getComponent(el);
    if (!c || !c.vc || !c.tenant || !c.router) throw new Error('ng.getComponent(app-root) failed — needs `ng serve` dev mode');
    return c;
  };
  const sleep = ms => new Promise(ok => setTimeout(ok, ms));
  // rAF can stall in a hidden/background tab — race it against a short timeout so a walk never hangs.
  const settle = async ms => { await sleep(ms); await Promise.race([new Promise(ok => requestAnimationFrame(() => ok())), sleep(150)]); };
  const setCombo = (a, skin, theme) => {
    if (a.tenant.skin() !== skin) a.tenant.use({ ...a.tenant.brand(), skin });
    if (a.vc.theme() !== theme) a.vc.setTheme(theme);
  };
  const bucketOf = sel => { try { const el = document.querySelector(sel); if (el && el.closest('app-dev-bar')) return 'devbar'; } catch (e) { /* bad selector */ } return 'product'; };
  const firstMsg = n => { const c = (n.any && n.any[0]) || (n.all && n.all[0]) || (n.none && n.none[0]); return c && c.message ? String(c.message).slice(0, 120) : ''; };

  const axeRun = async rules => {
    const lib = window.__auditLib; if (!lib) throw new Error('load tools/sb-audit.js first (window.__auditLib)');
    await lib.ensureAxe(document, window.__AXE_SRC || (SB + '/node_modules/axe-core/axe.min.js'));
    const runOnly = rules && rules.length ? { type: 'rule', values: rules } : { type: 'tag', values: lib.AXE_TAGS };
    const r = await window.axe.run(document, { runOnly, resultTypes: ['violations', 'incomplete'] });
    const pick = (v, kind) => v.nodes.map(n => ({ kind, id: v.id, impact: v.impact, bucket: bucketOf(n.target[0]), t: String(n.target[0] || '').slice(0, 70), h: String(n.html || '').slice(0, 90), msg: firstMsg(n) }));
    return r.violations.flatMap(v => pick(v, 'axe')).concat(r.incomplete.flatMap(v => pick(v, 'axe-inc')));
  };

  const tagOf = el => (el.tagName + '.' + String(el.className).split(' ')[0]).slice(0, 40);
  const reflowScan = () => {
    const issues = []; const over = document.scrollingElement.scrollWidth - innerWidth;
    if (over > 2) issues.push({ kind: 'reflow', spill: over, t: 'document' });
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect(); if (r.width < 2 || r.right <= innerWidth + 2) continue;
      if (getComputedStyle(el).position === 'fixed') continue;
      let p = el.parentElement, clipped = false;
      while (p && p !== document.body) { if (getComputedStyle(p).overflowX !== 'visible') { clipped = true; break; } p = p.parentElement; }
      if (clipped) continue;
      issues.push({ kind: 'reflow', spill: Math.round(r.right - innerWidth), t: tagOf(el), h: (el.textContent || '').trim().slice(0, 30) });
      if (issues.length > 12) break;
    }
    return issues;
  };
  const motionScan = () => {
    const seen = new Map();
    for (const a of (document.getAnimations ? document.getAnimations() : [])) {
      let inf = false; try { inf = a.effect.getTiming().iterations === Infinity && a.playState === 'running'; } catch (e) { /* no effect */ }
      const el = a.effect && a.effect.target; if (!inf || !el) continue;
      const k = tagOf(el); const e = seen.get(k) || { kind: 'motion', t: k, n: 0, h: String(a.animationName || a.id || 'anim').slice(0, 30) }; e.n++; seen.set(k, e);
    }
    return [...seen.values()];
  };
  const mediaScan = () => {
    const out = [];
    for (const m of document.querySelectorAll('video, audio')) {
      const tracks = [...m.querySelectorAll('track')].map(t => t.kind).join(',');
      out.push({ kind: 'media', t: tagOf(m), h: 'autoplay=' + m.autoplay + ' muted=' + m.muted + ' controls=' + m.controls + ' loop=' + m.loop + ' tracks=[' + tracks + '] src=' + (m.currentSrc || m.src || '').split('/').pop().slice(0, 30), msg: /captions|subtitles/.test(tracks) ? '' : 'no captions/subtitles track (1.2.2)' });
    }
    return out;
  };

  // --- glass: text over gradients / images (axe reports these as incomplete, never as violations) ---
  const __cv = document.createElement('canvas').getContext('2d');
  const normC = c => { try { __cv.fillStyle = '#000'; __cv.fillStyle = String(c).trim(); const v = __cv.fillStyle; if (/^#[0-9a-f]{6}$/i.test(v)) return `rgb(${parseInt(v.slice(1, 3), 16)}, ${parseInt(v.slice(3, 5), 16)}, ${parseInt(v.slice(5, 7), 16)})`; return v; } catch (e) { return String(c); } };
  const parseC = c => { const cs = String(c).trim(); const sm = cs.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/); if (sm) return { r: +sm[1] * 255, g: +sm[2] * 255, b: +sm[3] * 255, a: sm[4] === undefined ? 1 : +sm[4] }; if (!/^rgba?\(/.test(cs)) c = normC(c); const m = String(c).match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null; };
  const lumC = c => { const s = [c.r, c.g, c.b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return .2126 * s[0] + .7152 * s[1] + .0722 * s[2]; };
  const ratioC = (fg, bg) => { const f = { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) }; const l1 = lumC(f), l2 = lumC(bg); return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05); };
  let __anyAlpha = false;
  const stopsOf = (bgImage, under) => { const out = []; __anyAlpha = false; const re = /(?:rgba?|hsla?|color|oklab|oklch|lab|lch)\((?:[^()]|\([^()]*\))*\)|#[0-9a-f]{3,8}\b/gi; let m; while ((m = re.exec(bgImage))) { const c = parseC(m[0]); if (!c) continue; if (c.a < 1) __anyAlpha = true; out.push(c.a >= 1 ? c : { r: c.r * c.a + under.r * (1 - c.a), g: c.g * c.a + under.g * (1 - c.a), b: c.b * c.a + under.b * (1 - c.a), a: 1 }); } return out; };
  const glassScan = () => {
    const issues = []; const seen = new Set(); const W = window;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = walker.nextNode())) {
      const t = (n.textContent || '').trim(); if (t.length < 2) continue;
      const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
      const cs = W.getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
      const rect = el.getBoundingClientRect(); if (rect.width < 2 || rect.height < 2) continue;
      const fg = parseC(cs.color); if (!fg) continue;
      let p = el, under = null, grad = null, img = null, plate = null;
      while (p && p !== document.documentElement) {
        const pcs = W.getComputedStyle(p); const bc = parseC(pcs.backgroundColor);
        if (!plate && bc && bc.a > 0.25 && bc.a <= 0.6) plate = bc;   // translucent chip/plate — worst case depends on what's behind it
        if (pcs.backgroundImage && pcs.backgroundImage !== 'none') { if (/gradient/.test(pcs.backgroundImage)) { if (!grad) grad = pcs.backgroundImage; } else if (!img) img = 'css-image'; }
        for (const m of p.querySelectorAll(':scope > img, :scope > video')) { const mr = m.getBoundingClientRect(); if (mr.left <= rect.left + 2 && mr.right >= rect.right - 2 && mr.top <= rect.top + 2 && mr.bottom >= rect.bottom - 2 && mr.width > 4) img = img || m.tagName.toLowerCase(); }
        if (bc && bc.a > 0.6) { under = bc; break; }
        p = p.parentElement;
      }
      if (!grad && !img) continue;
      under = under || { r: 0, g: 0, b: 0, a: 1 };
      const fsz = parseFloat(cs.fontSize); const big = fsz >= 24 || (fsz >= 18.66 && +cs.fontWeight >= 700); const need = big ? 3 : 4.5;
      const cls = String(el.className).slice(0, 26);
      if (img && !grad) {
        if (plate) {
          const over = ['#fff', '#000'].map(hex => { const base = hex === '#fff' ? { r: 255, g: 255, b: 255, a: 1 } : { r: 0, g: 0, b: 0, a: 1 }; const comp = { r: plate.r * plate.a + base.r * (1 - plate.a), g: plate.g * plate.a + base.g * (1 - plate.a), b: plate.b * plate.a + base.b * (1 - plate.a), a: 1 }; return ratioC(fg, comp); });
          const minP = Math.min(...over);
          if (minP < need) issues.push({ kind: 'glass', t: t.slice(0, 18), cls, h: 'image + plate α' + plate.a.toFixed(2) + ' worst case', ratio: +minP.toFixed(2), msg: 'worst case (white/black image) ' + minP.toFixed(2) + ' < ' + need });
          else issues.push({ kind: 'glass-ok', t: t.slice(0, 18), cls, h: 'image + plate α' + plate.a.toFixed(2), ratio: +minP.toFixed(2) });
          continue;
        }
        issues.push({ kind: 'glass', t: t.slice(0, 18), cls, h: 'image, no scrim/plate', msg: 'needs eyes' }); continue;
      }
      const stops = stopsOf(grad, under); if (!stops.length) { issues.push({ kind: 'glass', t: t.slice(0, 18), cls, h: 'gradient (unparsed stops)', msg: 'needs eyes' }); continue; }
      const min = Math.min(...stops.map(st => ratioC(fg, st)), ...(__anyAlpha || /transparent/.test(grad) ? [ratioC(fg, under)] : []));
      const kind = img ? 'image+scrim' : 'gradient';
      if (min < need) issues.push({ kind: 'glass', t: t.slice(0, 18), cls, h: kind + ' worst stop', ratio: +min.toFixed(2), msg: 'worst stop ' + min.toFixed(2) + ' < ' + need });
      else issues.push({ kind: 'glass-ok', t: t.slice(0, 18), cls, h: kind, ratio: +min.toFixed(2) });
    }
    return issues;
  };

  const state = { running: false, i: 0, total: 0, res: {}, pages: {}, fatal: null };
  const ruleKey = it => (it.kind === 'axe' || it.kind === 'axe-inc') ? `${it.kind}:${it.id}` : it.kind;
  const sigOf = it => (it.t || it.cls || '') + '§' + (it.kind === 'target' ? '' : (it.h || ''));
  const msgOf = it => it.msg || (it.ratio != null ? `ratio ${it.ratio}` : it.kind === 'target' ? `${it.w}x${it.h}` : it.kind === 'motion' ? `${it.n} infinite: ${it.h}` : it.spill != null ? `spill ${it.spill}` : '');
  const isRedirect = p => p.landed && p.landed !== p.url.split('?')[0];

  window.__appAudit = {
    ROUTES, TIER_ROUTES,
    status: () => ({ running: state.running, i: state.i, total: state.total, fatal: state.fatal, pages: Object.keys(state.pages).length, errored: Object.values(state.pages).filter(p => p.err).length, redirected: Object.values(state.pages).filter(isRedirect).length }),
    result: () => state.res,
    pages: filter => Object.entries(state.pages).filter(([, p]) => !filter || (filter === 'err' ? !!p.err : filter === 'redirect' ? isRedirect(p) : true)).map(([k, p]) => ({ k, ...p })),
    summary: bucket => {
      const agg = {};
      for (const [k, list] of Object.entries(state.res)) for (const it of list) {
        if (bucket && it.bucket && it.bucket !== bucket) continue;
        const a = agg[ruleKey(it)] = agg[ruleKey(it)] || { nodes: 0, pages: new Set(), sigs: new Set(), impact: it.impact || '' };
        a.nodes++; a.pages.add(k.split('|').pop()); a.sigs.add(sigOf(it));
      }
      const out = {}; for (const [kk, a] of Object.entries(agg)) out[kk] = { nodes: a.nodes, pages: a.pages.size, unique: a.sigs.size, impact: a.impact }; return out;
    },
    detail: (rk, max = 40, bucket) => {
      const seen = new Map();
      for (const [k, list] of Object.entries(state.res)) for (const it of list) {
        if (ruleKey(it) !== rk) continue; if (bucket && it.bucket && it.bucket !== bucket) continue;
        const sig = sigOf(it); const e = seen.get(sig) || { t: it.t || it.cls, h: it.kind === 'target' ? '' : it.h, msg: msgOf(it), n: 0, pages: [] };
        e.n++; if (e.pages.length < 4 && !e.pages.includes(k)) e.pages.push(k); seen.set(sig, e);
      }
      return [...seen.values()].sort((x, y) => y.n - x.n).slice(0, max);
    },
    reset: () => { state.res = {}; state.pages = {}; state.i = 0; state.total = 0; state.fatal = null; },
    run: (opts = {}) => {
      const combos = opts.combos || [{ skin: 'hoopstv', theme: 'dark' }];
      const personas = opts.personas || ['adult'];
      const tiers = opts.tiers || ['premium'];
      const routes = opts.routes || ROUTES;
      const checks = opts.checks || ['axe', 'contrast', 'target', 'overflow'];
      const axeRules = opts.axeRules || null;
      const hideDevBar = opts.hideDevBar !== false;
      const cap = opts.cap || 60;
      const sink = opts.sink || window.__AUDIT_SINK || null, name = opts.name || 'app';
      const flush = async (final) => { if (!sink) return; try { await fetch(sink + '?name=' + encodeURIComponent(name), { method: 'POST', body: JSON.stringify({ name, final, meta: opts.meta || null, status: window.__appAudit.status(), pages: window.__appAudit.pages(), res: state.res }) }); } catch (e) { /* sink down */ } };
      if (!opts.append) window.__appAudit.reset();
      state.running = true; state.total += combos.length * personas.length * tiers.length * routes.length;
      (async () => {
        const a = app();
        if (hideDevBar && a.showDevBar && a.showDevBar()) a.showDevBar.set(false);
        for (const { skin, theme } of combos) { setCombo(a, skin, theme);
          for (const persona of personas) { a.vc.setPersona(persona);
            for (const tier of tiers) { a.vc.setTier(tier);
              for (const url of routes) {
                state.i++; if (state.i % 25 === 0) await flush(false);
                const k = `${skin}/${theme}|${persona}/${tier}|${url}`; const page = state.pages[k] = { url };
                try {
                  const ok = await a.router.navigateByUrl(url); await settle(opts.settle || 700);
                  page.landed = location.pathname; page.navOk = ok !== false;
                  const main = document.querySelector('main');
                  if (!main || main.children.length === 0 || (main.textContent || '').trim().length < 5) page.err = 'empty-main';
                  const lib = window.__auditLib; let iss = [];
                  if (checks.includes('axe')) iss = iss.concat(await axeRun(axeRules));
                  if (checks.includes('contrast')) iss = iss.concat(lib.contrastScan(document).map(x => ({ ...x, bucket: 'product' })));
                  if (checks.includes('target')) iss = iss.concat(lib.targetScan(document).map(x => ({ ...x, bucket: 'product' })));
                  if (checks.includes('overflow')) iss = iss.concat(lib.overflowScan(document).map(x => ({ ...x, bucket: 'product' })));
                  if (checks.includes('reflow')) iss = iss.concat(reflowScan().map(x => ({ ...x, bucket: 'product' })));
                  if (checks.includes('motion')) iss = iss.concat(motionScan().map(x => ({ ...x, bucket: 'product' })));
                  if (checks.includes('media')) iss = iss.concat(mediaScan().map(x => ({ ...x, bucket: 'product' })));
                  if (checks.includes('glass')) iss = iss.concat(glassScan().map(x => ({ ...x, bucket: 'product' })));
                  page.n = iss.length; if (iss.length) state.res[k] = iss.slice(0, cap);
                } catch (e) { page.err = String(e).slice(0, 90); }
              } } } }
        await flush(true); state.running = false;
      })().catch(e => { state.running = false; state.fatal = String(e).slice(0, 120); });
      return `app audit started: ${state.total} page scans`;
    },
  };
  // --- manual keyboard walk (needs REAL Tab presses) ---
  const kb = { log: [], on: false, prev: null, handler: null };
  const accName = el => {
    const byId = el.getAttribute('aria-labelledby');
    const lb = byId ? byId.split(' ').map(id => ((document.getElementById(id) || {}).textContent || '')).join(' ') : '';
    return (el.getAttribute('aria-label') || lb || el.getAttribute('title') || el.getAttribute('alt') || el.getAttribute('placeholder') || (el.tagName === 'IMG' ? '' : (el.textContent || ''))).trim().replace(/\s+/g, ' ').slice(0, 40);
  };
  const focusRing = el => { const cs = getComputedStyle(el); const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none'); return { ring, outline: (cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor).slice(0, 44), shadow: cs.boxShadow === 'none' ? '' : cs.boxShadow.slice(0, 44) }; };
  const obscured = el => {
    const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) return 'zero-size';
    if (r.bottom < 0 || r.top > innerHeight) return 'offscreen';
    const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(cx, cy); if (!top) return 'none';
    if (top === el || el.contains(top) || top.contains(el)) return '';
    return 'covered:' + tagOf(top);
  };
  window.__appAudit.kb = {
    start: () => {
      kb.log = []; kb.prev = null; kb.on = true;
      if (kb.handler) document.removeEventListener('focusin', kb.handler, true);
      kb.handler = e => {
        if (!kb.on) return; const el = e.target; if (!(el instanceof Element)) return;
        const ring = focusRing(el);
        const orderOk = !kb.prev || kb.prev === el || (kb.prev.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
        kb.log.push({ i: kb.log.length, tag: el.tagName.toLowerCase(), role: el.getAttribute('role') || '', name: accName(el), cls: String(el.className).split(' ')[0].slice(0, 24), fv: el.matches(':focus-visible'), ring: ring.ring, outline: ring.outline, shadow: ring.shadow, obscured: obscured(el), orderOk, tabindex: el.getAttribute('tabindex') || '' });
        kb.prev = el;
      };
      document.addEventListener('focusin', kb.handler, true);
      if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
      return 'kb walk armed — press Tab with REAL keyboard input, then __appAudit.kb.report()';
    },
    stop: () => { kb.on = false; return kb.log.length; },
    report: () => {
      const l = kb.log; const f = fn => l.filter(fn); const lab = x => x.tag + '.' + x.cls + ':' + x.name;
      return {
        stops: l.length, unique: new Set(l.map(lab)).size,
        noName: f(x => !x.name).map(x => x.tag + '.' + x.cls),
        noRingWhileFocusVisible: f(x => x.fv && !x.ring).map(x => lab(x) + '|' + x.outline),
        notFocusVisible: f(x => !x.fv).map(lab),
        obscured: f(x => x.obscured).map(x => lab(x) + '→' + x.obscured),
        orderBreaks: f(x => !x.orderOk).map(lab),
        consecutiveDupes: l.filter((x, i) => i > 0 && lab(l[i - 1]) === lab(x)).length,
        last: l.slice(-3).map(lab),
      };
    },
    log: () => kb.log,
  };
  return 'app-audit harness installed → __appAudit.run()';
})();
