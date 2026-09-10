#!/usr/bin/env node
/**
 * Spacing linter — enforces DESIGN.md's spacing contract, which no off-the-shelf
 * rule can express:
 *
 *   The Raw-Value Rule       every padding / margin / gap resolves to a token.
 *   The 4px Rhythm Rule      literals >= 4px are the defect this catches.
 *   The Optical Correction   sub-4px and sub-pixel values are LEGAL, but each
 *   Rule                     one must carry a stated reason in the code.
 *   The Type Scale Rule      font-size resolves to a --fs-* token. A literal
 *                            silently breaks the accessibility text steps,
 *                            which re-derive the scale and cannot reach it.
 *   The Offset Rule          left/right/top/bottom on a positioned element is
 *                            still spacing. It sits outside the properties
 *                            above, so it drifts unwatched — a stale 22px (the
 *                            retired --pad-x) survived there for weeks.
 *   The Band Rule            a width breakpoint comes from the sanctioned
 *                            ladder. A new number splits the responsive system
 *                            into private ones nobody can reason about.
 *   Pointer-only hover       every :hover sits inside @media (hover: hover).
 *                            On a touch screen a hover rule sticks after the
 *                            tap and leaves the card looking selected.
 *   One owner per gap        a page-level block contributes nothing at its
 *                            bottom edge; the block below owns the gap. Blocks
 *                            are discovered from the page templates, so a new
 *                            one is covered without touching this file.
 *
 * Why a script and not stylelint: half of this codebase's CSS lives inline in
 * Angular `styles:` template strings (stylelint barely sees those), and the
 * "needs a stated reason" clause needs a custom plugin regardless. Zero deps.
 *
 * Usage:
 *   node tools/lint-spacing.mjs              # report + exit 1 on violations
 *   node tools/lint-spacing.mjs --json       # machine-readable
 *   node tools/lint-spacing.mjs --stories    # include *.stories.ts scaffolding
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../src', import.meta.url).pathname;
const SCAN = ['lib', 'app'];
const JSON_OUT = process.argv.includes('--json');
const WITH_STORIES = process.argv.includes('--stories');
const UPDATE_BASELINE = process.argv.includes('--update-baseline');

/**
 * Baseline = known, pre-existing sub-grid values whose original rationale is
 * lost. The Optical Correction Rule stays ENFORCED for new code; these are
 * recorded debt, not an exemption, and the count can only go down. Keyed by
 * file+property+value rather than line, so it survives edits above it.
 */
const BASELINE_PATH = new URL('./spacing-baseline.json', import.meta.url).pathname;
const baseline = existsSync(BASELINE_PATH)
  ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).entries
  : {};
const baselineSeen = {};
const key = (f) => `${f.file}|${f.prop}|${f.px}`;
/** Rules whose EXISTING instances may be carried as recorded debt. New ones
 *  always fail. `block-owns-bottom-edge` is in here because normalising a page
 *  means giving the blocks below it their own top gap — per-page design work,
 *  not a deletion — so the pages awaiting it are listed rather than silently
 *  broken or silently ignored. */
const BASELINEABLE = new Set([
  'optical-correction-needs-reason',
  'off-scale-needs-reason',
  'block-owns-bottom-edge',
  'offset-off-grid',
  'offset-optical-needs-reason',
  'hover-needs-pointer-query',
  'breakpoint-off-ladder',
]);

const PROPS =
  '(?:padding|margin)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?|gap|row-gap|column-gap';
const DECL = new RegExp(`(?<![\\w-])(${PROPS})(\\s*:\\s*)([^;{}]+)`, 'g');
const PX = /(-?)(\d+(?:\.\d+)?)px/g;
const COMMENT = /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;

/** Role tokens first, then the primitive step — mirrors DESIGN.md's ordering.
 *  The primitive is mechanical: space-N where N * 4 = the value. */
const ROLE = {
  8:  ['--gap-tight', '--pad-control-y'],
  12: ['--stack', '--rail-gap', '--gap-snug', '--pad-card-sm', '--pad-field-y', '--section-bottom'],
  16: ['--pad-x', '--pad-card', '--gap-loose', '--pad-control-x', '--pad-field-x'],
  28: ['--section-top'],
};
const REASON_WINDOW = 6; // lines to look back for a stated reason
const SCALE_MAX = 48; // space-12. Above this it is a layout dimension, not rhythm.
const suggest = (n) => [...(ROLE[n] || []), `--space-${n / 4}`];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(scss|ts)$/.test(name)) {
      if (!WITH_STORIES && name.endsWith('.stories.ts')) continue;
      out.push(p);
    }
  }
  return out;
}

/** Blank out comment spans so their prose never counts as code, while keeping
 *  offsets intact — and remember which lines HAD a comment, since that is what
 *  licenses a sub-grid value. */
function maskComments(src) {
  const commented = new Set();
  const masked = src.replace(COMMENT, (m, off) => {
    const upto = src.slice(0, off);
    const startLine = upto.split('\n').length;
    const endLine = startLine + m.split('\n').length - 1;
    for (let l = startLine; l <= endLine; l++) commented.add(l);
    return m.replace(/[^\n]/g, ' ');
  });
  return { masked, commented };
}

const findings = [];
let declCount = 0;
let tokenRefs = 0;

for (const file of SCAN.flatMap((d) => walk(join(ROOT, d)))) {
  const src = readFileSync(file, 'utf8');
  const { masked, commented } = maskComments(src);

  for (const m of masked.matchAll(DECL)) {
    const [, prop, , value] = m;
    declCount++;
    if (value.includes('var(--')) tokenRefs++;

    const line = masked.slice(0, m.index).split('\n').length;
    // A reason may sit on the declaration's line or in the comment block just
    // above its rule. The window is 6 lines because a 1-line window produced a
    // false positive on real code: onboarding's 140px bottom clearance IS
    // explained, three lines up, above the selector rather than the property.
    let hasReason = false;
    for (let l = line; l >= line - REASON_WINDOW; l--) if (commented.has(l)) { hasReason = true; break; }

    for (const nm of value.matchAll(PX)) {
      const raw = nm[2];
      const n = Math.abs(parseFloat(raw));
      if (n === 0) continue;

      const subGrid = n < 4 || raw.includes('.');
      if (subGrid) {
        if (!hasReason) {
          findings.push({
            file: relative(ROOT, file), line, prop, value: value.trim(), px: `${raw}px`,
            rule: 'optical-correction-needs-reason',
            message: `${raw}px is a sub-grid optical value — state the reason in a comment, or move it onto the 4px grid.`,
          });
        }
        continue;
      }

      if (n > SCALE_MAX) {
        // The other end of the scale: a 140px offset is a layout dimension, not
        // rhythm, and naming it would pollute the ladder. Same deal as sub-grid
        // — it may stay a literal, but it has to say why.
        if (!hasReason) {
          findings.push({
            file: relative(ROOT, file), line, prop, value: value.trim(), px: `${raw}px`,
            rule: 'off-scale-needs-reason',
            message: `${raw}px is above the rhythm ladder (max ${SCALE_MAX}px) — state the reason in a comment.`,
          });
        }
        continue;
      }

      const onGrid = n % 4 === 0;
      findings.push({
        file: relative(ROOT, file), line, prop, value: value.trim(), px: `${raw}px`,
        rule: onGrid ? 'raw-value' : 'off-grid',
        message: onGrid
          ? `${raw}px should reference a token: ${suggest(n).join(' or ')}.`
          : `${raw}px is off the 4px grid; round to the nearest step, then use its token.`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Check 2 — ONE OWNER PER GAP (the composition rule).
//
// A page-level block contributes NOTHING at its bottom edge. The gap belongs to
// the block below, which owns it once via --block-gap. The single sanctioned
// exception is a heading, whose bottom edge is the deliberate heading-to-content
// gap, --section-bottom.
//
// The blocks are DISCOVERED, not listed: every page template marks its root with
// `halo-page`, so the root's direct children ARE the page's blocks. A new block
// is therefore covered the moment someone adds it to a template — no list to
// remember. Angular control-flow blocks (@if / @for) are treated as transparent
// because they wrap children without nesting them in the DOM.
//
// A block whose stylesheet cannot be located is reported rather than skipped:
// silence there would rebuild exactly the blind spot this replaced.
// ---------------------------------------------------------------------------

/** Bottom edge may be nothing, or exactly the heading-to-content gap. */
const BOTTOM_OK = /^(0|0px|var\(--section-bottom\))$/;

/** Blocks allowed a bottom edge, with the reason. Exceptions, not a registry. */
const BOTTOM_EDGE_ALLOWED = new Set([
  // '<page>:<block>',
]);

const VOID_TAGS = new Set(['img', 'br', 'hr', 'input', 'source', 'track', 'area', 'base', 'col', 'embed', 'link', 'meta', 'param', 'wbr']);

/** Direct children of the element carrying `halo-page`, with @if/@for transparent. */
function pageBlocks(tpl) {
  const src = tpl.replace(/\{\{[\s\S]*?\}\}/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const token = /<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  const out = [];
  let rooted = false, depth = 0, m;
  while ((m = token.exec(src))) {
    const [, closeTag, openTag, attrs, selfClose] = m;
    if (closeTag) {
      if (!rooted) continue;
      if (depth === 0) break;              // the root closed
      depth--;
      continue;
    }
    const selfClosing = !!selfClose || VOID_TAGS.has(openTag.toLowerCase());
    if (!rooted) {
      if (/\bclass\s*=\s*"[^"]*\bhalo-page\b/.test(attrs)) { rooted = true; depth = 0; }
      continue;                            // everything before the root is chrome
    }
    if (depth === 0) {
      const cls = /\bclass\s*=\s*"([^"]*)"/.exec(attrs);
      out.push({ tag: openTag, cls: cls ? cls[1].trim().split(/\s+/)[0] : null });
    }
    if (!selfClosing) depth++;
  }
  return out;
}

/** Where a block's own styles live: a component's :host, or the page's class. */
function styleTargets(block, pageScss) {
  if (block.tag.startsWith('halo-')) {
    const name = block.tag.slice('halo-'.length);
    for (const tier of ['atoms', 'molecules', 'organisms', 'layouts']) {
      for (const ext of ['scss', 'ts']) {
        const rel = `lib/${tier}/${name}/${name}.${ext}`;
        if (existsSync(join(ROOT, rel))) return { rel, selectors: [':host'] };
      }
    }
    return null;                            // unresolved — reported, not skipped
  }
  if (!block.cls) return null;
  if (/^(halo-rail|halo-stack|halo-ad-wrap|halo-nav-dock|topbar|halo-page)$/.test(block.cls)) {
    return { rel: 'styles.scss', selectors: [`.${block.cls}`] };
  }
  // Pages come in both shapes: a sibling .scss, or styles inline in the .ts
  // (placeholder and upgrade do the latter, which the first pass missed).
  return pageScss ? { rel: pageScss, selectors: [`.${block.cls}`] } : null;
}

const TEMPLATES = [];
(function collectTemplates(dir) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) { collectTemplates(abs); continue; }
    if (name.endsWith('.html')) {
      TEMPLATES.push({ tpl: readFileSync(abs, 'utf8'), dir, base: name.replace(/\.html$/, '') });
    } else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) {
      const src = readFileSync(abs, 'utf8');
      const m = /template:\s*`([\s\S]*?)`\s*,/.exec(src);
      if (m && m[1].includes('halo-page')) {
        TEMPLATES.push({ tpl: m[1], dir, base: name.replace(/\.ts$/, '') });
      }
    }
  }
})(join(ROOT, 'app/pages'));

const bottomOf = (prop, value) => {
  const v = value.trim().replace(/\s+/g, ' ');
  if (/^(margin|padding)-(bottom|block-end)$/.test(prop)) return v;
  if (/^(margin|padding)-block$/.test(prop)) {
    const parts = v.split(' ');
    return parts.length > 1 ? parts[1] : parts[0];
  }
  if (/^(margin|padding)$/.test(prop)) {
    const parts = v.split(' ');
    if (parts.length === 2) return parts[0];
    if (parts.length >= 3) return parts[2];
    return parts[0];
  }
  return null;
};

const seenBlocks = new Set();
let blocksChecked = 0;

for (const { tpl, dir, base } of TEMPLATES) {
  const pageRel = existsSync(join(dir, `${base}.scss`))
    ? relative(ROOT, join(dir, `${base}.scss`))
    : existsSync(join(dir, `${base}.ts`))
      ? relative(ROOT, join(dir, `${base}.ts`))
      : null;
  for (const block of pageBlocks(tpl)) {
    const id = `${base}:${block.tag}${block.cls ? '.' + block.cls : ''}`;
    if (seenBlocks.has(id) || BOTTOM_EDGE_ALLOWED.has(id)) continue;
    seenBlocks.add(id);
    // Out of flow, so the rule does not apply: there is no block below them to
    // hand the gap to. halo-split-rail is position:fixed from 1024 and display:contents
    // below it, so it never contributes a bottom edge in either state — its
    // padding is a scroll container's inner room (Maryna 2026-08-30).
    if (block.cls === 'halo-nav-dock' || block.cls === 'topbar' || block.cls === 'halo-split-rail') continue;

    const target = styleTargets(block, pageRel);
    if (!target) {
      findings.push({
        file: relative(ROOT, join(dir, `${base}.html`)), line: 1,
        prop: 'page-block', value: id, px: '—',
        rule: 'page-block-unresolved',
        message: `Cannot locate the styles for page block <${block.tag}${block.cls ? ' class="' + block.cls + '"' : ''}> on ${base}, so its bottom edge is unverified. Point the linter at its stylesheet, or add it to BOTTOM_EDGE_ALLOWED with a reason.`,
      });
      continue;
    }
    blocksChecked++;

    let src;
    try { src = readFileSync(join(ROOT, target.rel), 'utf8'); } catch { continue; }
    const { masked } = maskComments(src);
    for (const sel of target.selectors) {
      const re = new RegExp(`(^|[\\n};])\\s*${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^{}]*)`, 'g');
      for (const rm of masked.matchAll(re)) {
        const line = masked.slice(0, rm.index).split('\n').length;
        for (const d of rm[2].matchAll(/(?<![\w-])((?:margin|padding)(?:-(?:bottom|block|block-end))?)\s*:\s*([^;]+)/g)) {
          const edge = bottomOf(d[1], d[2]);
          if (edge === null || BOTTOM_OK.test(edge)) continue;
          findings.push({
            file: target.rel, line, prop: d[1], value: d[2].trim(), px: edge,
            rule: 'block-owns-bottom-edge',
            message: `${sel} is a page-level block (${id}), so it must contribute nothing at its bottom edge — the block BELOW owns the gap via --block-gap. Found ${d[1]}: ${d[2].trim()} (bottom = ${edge}). Move the space to the block below, or use var(--section-bottom) if this is a heading.`,
          });
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Check 3 — THE TYPE SCALE.
//
// A hardcoded font-size is not just untidy: [data-a11y-text='large'] re-derives
// the whole --fs-* scale, so a literal is the one value that will NOT grow when
// a user turns text size up. The text around it does, and the layout tears. A
// shipped accessibility feature is what a raw px silently opts out of.
//
// Same escape hatch as the spacing rules: a size genuinely off the ladder may
// stay a literal if it states why (the desktop hero numerals are the real case).
// ---------------------------------------------------------------------------
const FS_DECL = /(?<![\w-])font-size\s*:\s*([^;]+)/g;
const FS_SCALE = ['--fs-caption (12)', '--fs-body (14)', '--fs-body-lg (16)', '--fs-title (18)', '--fs-heading (20)'];

for (const file of SCAN.flatMap((d) => walk(join(ROOT, d)))) {
  const src = readFileSync(file, 'utf8');
  const { masked, commented } = maskComments(src);
  for (const m of masked.matchAll(FS_DECL)) {
    const value = m[1].trim();
    if (!/\d+(\.\d+)?px/.test(value)) continue;
    const line = masked.slice(0, m.index).split('\n').length;
    let hasReason = false;
    for (let l = line; l >= line - REASON_WINDOW; l--) if (commented.has(l)) { hasReason = true; break; }
    if (hasReason) continue;
    findings.push({
      file: relative(ROOT, file), line, prop: 'font-size', value, px: value,
      rule: 'type-scale',
      message: `font-size must reference the scale — ${FS_SCALE.join(', ')}, or a --fs-d-* display step. A literal does not grow with the accessibility text steps. If this size is genuinely off the ladder, say why in a comment.`,
    });
  }
}

// ---------------------------------------------------------------------------
// Check 4 — POSITIONED OFFSETS.
//
// left/right/top/bottom place things, which makes them spacing, but they are
// not padding/margin/gap so nothing was looking at them. That blind spot kept a
// hardcoded 22px in the hero overlay long after --pad-x moved to 24, and the
// value no longer existed anywhere in the system.
//
// Same grid, same escape hatch: on the 4px ladder, or say why not. Sub-4px
// offsets are the optical class again (badge nudges, hairline alignment) and
// need a stated reason rather than a token.
// ---------------------------------------------------------------------------
const OFFSET_DECL = /(?<![\w-])(left|right|top|bottom|inset|inset-block|inset-inline)\s*:\s*([^;{}]+)/g;

for (const file of SCAN.flatMap((d) => walk(join(ROOT, d)))) {
  const src = readFileSync(file, 'utf8');
  const { masked, commented } = maskComments(src);
  for (const m of masked.matchAll(OFFSET_DECL)) {
    const value = m[2].trim();
    if (!/\d+px/.test(value)) continue;               // auto, %, calc(), var() are fine
    const line = masked.slice(0, m.index).split('\n').length;
    let hasReason = false;
    for (let l = line; l >= line - REASON_WINDOW; l--) if (commented.has(l)) { hasReason = true; break; }
    for (const nm of value.matchAll(PX)) {
      const n = Math.abs(parseFloat(nm[2]));
      if (n === 0) continue;
      const subGrid = n < 4 || nm[2].includes('.');
      if (subGrid || n % 4 !== 0) {
        if (hasReason) continue;
        findings.push({
          file: relative(ROOT, file), line, prop: m[1], value, px: `${nm[2]}px`,
          rule: subGrid ? 'offset-optical-needs-reason' : 'offset-off-grid',
          message: subGrid
            ? `${nm[2]}px offset is sub-grid — state the reason, the way an optical spacing correction does.`
            : `${nm[2]}px offset is off the 4px grid. Use a token or a ladder step, or state why it is off.`,
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Check 5 — POINTER-ONLY HOVER.
//
// A :hover rule on a touch screen sticks after the tap: the card you last
// touched stays looking selected until you touch something else. @media
// (hover: hover) is the only thing that scopes it to a real pointer.
//
// This one is checked rather than trusted for the same reason as the rest — the
// author of a new component has no way to notice the omission, because it looks
// perfectly correct on the desktop they are building it on.
// ---------------------------------------------------------------------------
// A reduced-motion block counts as safe too: a :hover inside it REMOVES an
// effect rather than promising one, so scoping it to a pointer would be noise.
const HOVER_MQ = /@media[^{]*(\(\s*hover\s*:\s*hover\s*\)|prefers-reduced-motion)[^{]*\{/g;

/** Character ranges covered by an `@media (hover: hover)` block. */
function hoverMediaRanges(src) {
  const ranges = [];
  for (const m of src.matchAll(HOVER_MQ)) {
    let depth = 1, i = m.index + m[0].length;
    while (i < src.length && depth > 0) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') depth--;
      i++;
    }
    ranges.push([m.index, i]);
  }
  return ranges;
}

for (const file of SCAN.flatMap((d) => walk(join(ROOT, d)))) {
  const src = readFileSync(file, 'utf8');
  const { masked, commented } = maskComments(src);
  const ranges = hoverMediaRanges(masked);
  for (const m of masked.matchAll(/:hover/g)) {
    if (ranges.some(([a, b]) => m.index > a && m.index < b)) continue;
    const line = masked.slice(0, m.index).split('\n').length;
    // No "state a reason" escape here, unlike the sub-grid and off-scale rules.
    // Those describe a value that can legitimately sit off the system; this one
    // describes a rule that is either scoped to a pointer or is not. A comment
    // nearby changes nothing — and while the escape was in place it silently
    // excused 12 of the 46 unguarded hovers, purely for being near a comment.
    findings.push({
      file: relative(ROOT, file), line, prop: ':hover', value: masked.slice(m.index, m.index + 40).split('\n')[0].trim(), px: '—',
      rule: 'hover-needs-pointer-query',
      message: `:hover outside @media (hover: hover). On touch it sticks after the tap and leaves the element looking selected. Wrap it, or state why this one is safe.`,
    });
  }
}

// ---------------------------------------------------------------------------
// Check 6 — SANCTIONED BREAKPOINTS.
//
// The layout is a ladder of named bands. A stray `@media (min-width: 900px)`
// does not just add a rule — it creates a band that exists in one file, which
// no page, token or document knows about, and the next person cannot tell an
// intentional band from a number someone reached for.
//
// The phone band has its own small set for sub-375 devices. Anything outside
// both sets needs a stated reason, the same escape the rest of the rules use.
// ---------------------------------------------------------------------------
const BANDS = new Set([768, 1024, 1280, 1600, 2000]);   // the layout ladder
const SMALL = new Set([360, 390, 480, 520]);            // sub-phone tweaks
const MQ_WIDTH = /@media[^{]*?\((min|max)-width:\s*(\d+)px\)/g;

for (const file of SCAN.flatMap((d) => walk(join(ROOT, d)))) {
  const src = readFileSync(file, 'utf8');
  const { masked, commented } = maskComments(src);
  for (const m of masked.matchAll(MQ_WIDTH)) {
    const px = Number(m[2]);
    if (BANDS.has(px) || SMALL.has(px)) continue;
    const line = masked.slice(0, m.index).split('\n').length;
    let hasReason = false;
    for (let l = line; l >= line - REASON_WINDOW; l--) if (commented.has(l)) { hasReason = true; break; }
    if (hasReason) continue;
    findings.push({
      file: relative(ROOT, file), line, prop: `${m[1]}-width`, value: `${px}px`, px: `${px}px`,
      rule: 'breakpoint-off-ladder',
      message: `${px}px is not one of the layout bands (${[...BANDS].join(' / ')}) or the small-phone set (${[...SMALL].join(' / ')}). Use a band, or state why this screen needs one of its own.`,
    });
  }
}

// Partition: anything already in the baseline is debt, not a failure.
const debt = [];
const failures = [];
for (const f of findings) {
  if (BASELINEABLE.has(f.rule)) {
    const k = key(f);
    baselineSeen[k] = (baselineSeen[k] || 0) + 1;
    if (baselineSeen[k] <= (baseline[k] || 0)) { debt.push(f); continue; }
  }
  failures.push(f);
}

if (UPDATE_BASELINE) {
  const entries = {};
  for (const f of findings) {
    if (!BASELINEABLE.has(f.rule)) continue;
    entries[key(f)] = (entries[key(f)] || 0) + 1;
  }
  writeFileSync(
    BASELINE_PATH,
    JSON.stringify(
      { $comment: 'Pre-existing sub-grid spacing whose rationale is undocumented. Recorded debt, NOT an exemption — see DESIGN.md, The Optical Correction Rule. This list may shrink, never grow: give a value a stated reason in the code, or move it onto the 4px grid, then re-run with --update-baseline.',
        generatedAt: '2026-08-28', entries },
      null, 2
    ) + '\n'
  );
  console.log(`baseline written: ${Object.keys(entries).length} keys, ${Object.values(entries).reduce((a, b) => a + b, 0)} values`);
  process.exitCode = 0;
} else if (JSON_OUT) {
  console.log(JSON.stringify({ declCount, tokenRefs, failures, debt }, null, 2));
} else {
  const byRule = failures.reduce((a, f) => ((a[f.rule] = (a[f.rule] || 0) + 1), a), {});
  const byFile = failures.reduce((a, f) => ((a[f.file] = (a[f.file] || 0) + 1), a), {});

  console.log(`\nspacing declarations scanned: ${declCount}  \u00b7  containing a token: ${tokenRefs}`);
  console.log(`page blocks discovered from templates: ${seenBlocks.size}  \u00b7  bottom edge verified: ${blocksChecked}`);
  const debtByRule = debt.reduce((a, f) => ((a[f.rule] = (a[f.rule] || 0) + 1), a), {});
  console.log(`violations: ${failures.length}\n`);
  if (debt.length) {
    console.log(`baselined debt: ${debt.length}`);
    for (const [r, n] of Object.entries(debtByRule).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(n).padStart(4)}  ${r}`);
    }
    console.log('');
  }
  for (const [rule, n] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  ${rule}`);
  }
  if (failures.length) {
    console.log(`\nworst files:`);
    for (const [f, n] of Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
      console.log(`  ${String(n).padStart(4)}  ${f}`);
    }
    console.log(`\nfirst 12:`);
    for (const f of failures.slice(0, 12)) {
      console.log(`  ${f.file}:${f.line}  ${f.prop}: ${f.value}`);
      console.log(`        ${f.message}`);
    }
    console.log(`\nSee DESIGN.md \u2014 Layout: The Raw-Value Rule, The Optical Correction Rule.`);
  }
}

// exitCode, not exit(): process.exit() drops buffered stdout when it is a pipe,
// which truncated the JSON mid-string the first time this ran through one.
process.exitCode = failures.length ? 1 : 0;
