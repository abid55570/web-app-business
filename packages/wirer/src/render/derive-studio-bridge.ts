/**
 * Inject the Studio iframe bridge into the generated frontend.
 *
 * Two artifacts:
 *  1. `<out>/frontend/public/_studio-bridge.js` — a small script that
 *     attaches click handlers to every `[data-bd-element]` node and
 *     postMessages selection events to the parent window (Studio).
 *  2. A `<script src="/_studio-bridge.js" data-studio-bridge defer>`
 *     tag inserted into `<out>/frontend/src/app/layout.tsx` (idempotent).
 *
 * The bridge is a no-op when the page isn't embedded in an iframe
 * (window === window.parent), so it's safe to ship to production.
 * It also gates all activity behind a handshake from the parent —
 * if Studio doesn't say hello, the bridge stays dormant.
 *
 * Sprint 2a scope: select + inspect. Sprint 2b will add apply-patch
 * handling for live text/style edits before the wirer re-renders.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

export type DeriveStudioBridgeArgs = {
  outputDir: string
}

export async function deriveStudioBridge(args: DeriveStudioBridgeArgs): Promise<void> {
  const publicDir = path.join(args.outputDir, 'frontend', 'public')
  await mkdir(publicDir, { recursive: true })
  await writeFile(path.join(publicDir, '_studio-bridge.js'), BRIDGE_JS, 'utf-8')

  // Inject script tag into layout.tsx. The scaffold's layout is a thin
  // <html><body><Providers>{children}</Providers></body></html>. We add
  // a <script> sibling of <body> via the next/script approach below by
  // editing the JSX. Idempotent: bail if marker already present.
  const layoutPath = path.join(args.outputDir, 'frontend', 'src', 'app', 'layout.tsx')
  let layout: string
  try {
    layout = await readFile(layoutPath, 'utf-8')
  } catch {
    return // no layout to patch (Sprint 1 may have skipped scaffolding for some path)
  }
  if (layout.includes('data-studio-bridge')) return // already injected

  // Inject a plain <script> right before closing </body>. Plain script
  // tag avoids needing the next/script import + works in static SSR.
  // We use defer to not block hydration.
  const SCRIPT_TAG = `        <script src="/_studio-bridge.js" data-studio-bridge defer></script>\n      `
  const replaced = layout.replace(
    /<\/body>/,
    `${SCRIPT_TAG}</body>`,
  )
  if (replaced === layout) {
    // Fallback: append before final </html> if no <body> close found.
    const replaced2 = layout.replace(/<\/html>/, `${SCRIPT_TAG}</html>`)
    if (replaced2 !== layout) {
      await writeFile(layoutPath, replaced2, 'utf-8')
    }
    return
  }
  await writeFile(layoutPath, replaced, 'utf-8')
}

/**
 * The bridge JS itself — runs in the GENERATED app's iframe.
 *
 * Protocol (Studio = parent, generated app = child):
 *   ← bd:hello                       Studio greets the bridge
 *   → bd:hello-ack                   Bridge acknowledges (sends current URL)
 *   → bd:select { elementId, tag,    On user click on a [data-bd-element]
 *                 text, className,
 *                 rect }
 *   ← bd:highlight { elementId }     Studio asks to outline this element
 *   ← bd:clear                       Studio asks to drop selection outline
 *   ← bd:apply { elementId, patch }  Sprint 2b: live text/style preview
 */
const BRIDGE_JS = `/**
 * b-dash Studio iframe bridge.
 * Auto-generated. Edit \`derive-studio-bridge.ts\` in the wirer to change.
 */
(function () {
  if (typeof window === 'undefined') return;
  // Only run when embedded as an iframe by Studio.
  if (window.parent === window) return;

  var ATTR = 'data-bd-element';
  var OUTLINE_ID = '__bd-bridge-outline';
  var STYLE_ID = '__bd-bridge-style';
  var enabled = false;

  function send(type, payload) {
    try { window.parent.postMessage({ source: 'bd-bridge', type: type, payload: payload || {} }, '*'); }
    catch (e) { /* parent gone */ }
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = '[' + ATTR + ']{cursor:default}' +
      '[' + ATTR + ']:hover{outline:2px solid rgba(99,102,241,.55) !important;outline-offset:1px;cursor:pointer !important}' +
      '#' + OUTLINE_ID + '{position:absolute;pointer-events:none;border:2px solid #6366f1;background:rgba(99,102,241,.08);border-radius:2px;z-index:2147483647;transition:all 120ms ease}';
    document.head.appendChild(s);
  }

  function ensureOutline() {
    var o = document.getElementById(OUTLINE_ID);
    if (o) return o;
    o = document.createElement('div');
    o.id = OUTLINE_ID;
    o.style.display = 'none';
    document.body.appendChild(o);
    return o;
  }

  function rectOf(el) {
    var r = el.getBoundingClientRect();
    return {
      top: r.top + window.scrollY,
      left: r.left + window.scrollX,
      width: r.width,
      height: r.height,
    };
  }

  function highlight(id) {
    var el = document.querySelector('[' + ATTR + '="' + (id || '').replace(/"/g, '\\\\"') + '"]');
    var o = ensureOutline();
    if (!el) { o.style.display = 'none'; return; }
    var r = rectOf(el);
    o.style.display = 'block';
    o.style.top = r.top + 'px';
    o.style.left = r.left + 'px';
    o.style.width = r.width + 'px';
    o.style.height = r.height + 'px';
  }

  function onClick(e) {
    if (!enabled) return;
    var target = e.target;
    // Bubble up to the nearest [data-bd-element].
    while (target && target !== document.body && !(target.getAttribute && target.getAttribute(ATTR))) {
      target = target.parentNode;
    }
    if (!target || !target.getAttribute || !target.getAttribute(ATTR)) return;
    e.preventDefault();
    e.stopPropagation();
    var id = target.getAttribute(ATTR);
    send('bd:select', {
      elementId: id,
      tag: target.tagName ? target.tagName.toLowerCase() : '',
      text: (target.textContent || '').trim().slice(0, 200),
      className: target.className && target.className.toString ? target.className.toString() : '',
      rect: rectOf(target),
    });
    highlight(id);
  }

  function applyPatch(elementId, patch) {
    if (!elementId || !patch) return;
    var el = document.querySelector('[' + ATTR + '="' + elementId.replace(/"/g, '\\\\"') + '"]');
    if (!el) return;
    if (typeof patch.text === 'string') {
      // Only replace if the element currently has a single text child —
      // avoids nuking inline JSX (icons, child elements). For Sprint 2b
      // we accept this limitation; deeper edits land in Sprint 2c.
      var onlyText = el.childNodes.length === 1 && el.childNodes[0].nodeType === 3;
      if (onlyText) {
        el.childNodes[0].nodeValue = patch.text;
      } else if (el.childNodes.length === 0) {
        el.textContent = patch.text;
      }
    }
    if (typeof patch.style === 'object' && patch.style) {
      for (var k in patch.style) {
        if (Object.prototype.hasOwnProperty.call(patch.style, k)) {
          try { el.style[k] = patch.style[k]; } catch (e) {}
        }
      }
    }
    if (typeof patch.className === 'string') {
      try { el.className = patch.className; } catch (e) {}
    }
    if (patch.attributes && typeof patch.attributes === 'object') {
      for (var ak in patch.attributes) {
        if (Object.prototype.hasOwnProperty.call(patch.attributes, ak)) {
          try { el.setAttribute(ak, patch.attributes[ak]); } catch (e) {}
        }
      }
    }
    // Re-position outline since the element might have re-flowed.
    highlight(elementId);
  }

  function onMessage(msg) {
    var data = msg && msg.data;
    if (!data || data.source !== 'bd-studio') return;
    if (data.type === 'bd:hello') {
      enabled = true;
      ensureStyle();
      ensureOutline();
      send('bd:hello-ack', { url: location.href, count: document.querySelectorAll('[' + ATTR + ']').length });
    } else if (data.type === 'bd:highlight') {
      highlight(data.payload && data.payload.elementId);
    } else if (data.type === 'bd:clear') {
      var o = document.getElementById(OUTLINE_ID); if (o) o.style.display = 'none';
    } else if (data.type === 'bd:apply') {
      applyPatch(data.payload && data.payload.elementId, data.payload && data.payload.patch);
    } else if (data.type === 'bd:drag-enter') {
      // Sprint 5b: Studio is dragging a palette card. Show drop lines
      // between sections so the user can pick an insertion point.
      showDropZones(true);
    } else if (data.type === 'bd:drag-leave' || data.type === 'bd:drag-end') {
      showDropZones(false);
    } else if (data.type === 'bd:probe-drop') {
      // Studio sends pointer coords (iframe-relative) — bridge replies
      // with the nearest insertion index (between which section roots).
      var x = data.payload && data.payload.x || 0;
      var y = data.payload && data.payload.y || 0;
      send('bd:probe-drop-ack', { atIdx: nearestDropIdx(x, y) });
    } else if (data.type === 'bd:inspect') {
      // Return current text + className for the requested element.
      var el2 = document.querySelector('[' + ATTR + '="' + (data.payload && data.payload.elementId || '').replace(/"/g, '\\\\"') + '"]');
      if (el2) {
        send('bd:inspect-ack', {
          elementId: data.payload.elementId,
          text: (el2.textContent || '').trim().slice(0, 500),
          className: el2.className && el2.className.toString ? el2.className.toString() : '',
        });
      }
    }
  }

  /** Sprint 5b — render thin indigo lines between every section root
   *  to indicate insertion points during a palette drag. */
  function showDropZones(visible) {
    var existing = document.querySelectorAll('[data-bd-drop-zone]');
    for (var i = 0; i < existing.length; i++) {
      var n = existing[i];
      if (n.parentNode) n.parentNode.removeChild(n);
    }
    if (!visible) return;
    var roots = document.querySelectorAll('[' + ATTR + '$=":e0"]');
    for (var k = 0; k < roots.length; k++) {
      var r = roots[k];
      var rect = r.getBoundingClientRect();
      var zone = document.createElement('div');
      zone.setAttribute('data-bd-drop-zone', String(k));
      zone.style.position = 'absolute';
      zone.style.left = (rect.left + window.scrollX) + 'px';
      zone.style.top = (rect.top + window.scrollY - 4) + 'px';
      zone.style.width = rect.width + 'px';
      zone.style.height = '8px';
      zone.style.background = 'linear-gradient(180deg, transparent, #6366f1, transparent)';
      zone.style.opacity = '0.7';
      zone.style.zIndex = '2147483646';
      zone.style.pointerEvents = 'none';
      document.body.appendChild(zone);
    }
    // After-last zone
    if (roots.length > 0) {
      var last = roots[roots.length - 1];
      var rect2 = last.getBoundingClientRect();
      var zone2 = document.createElement('div');
      zone2.setAttribute('data-bd-drop-zone', String(roots.length));
      zone2.style.position = 'absolute';
      zone2.style.left = (rect2.left + window.scrollX) + 'px';
      zone2.style.top = (rect2.bottom + window.scrollY + 4) + 'px';
      zone2.style.width = rect2.width + 'px';
      zone2.style.height = '8px';
      zone2.style.background = 'linear-gradient(180deg, transparent, #6366f1, transparent)';
      zone2.style.opacity = '0.7';
      zone2.style.zIndex = '2147483646';
      zone2.style.pointerEvents = 'none';
      document.body.appendChild(zone2);
    }
  }

  /** Sprint 5b — find which insertion index the cursor (y, iframe-
   *  relative) is closest to among section root midpoints. */
  function nearestDropIdx(_x, y) {
    var roots = document.querySelectorAll('[' + ATTR + '$=":e0"]');
    for (var i = 0; i < roots.length; i++) {
      var rect = roots[i].getBoundingClientRect();
      var mid = rect.top + rect.height / 2;
      if (y < mid) return i;
    }
    return roots.length;
  }

  document.addEventListener('click', onClick, true);
  window.addEventListener('message', onMessage);
  window.addEventListener('scroll', function () {
    // re-position the outline on scroll so it sticks to the element
    var o = document.getElementById(OUTLINE_ID);
    if (!o || o.style.display === 'none') return;
    // Cheap reposition: re-query the most-recently outlined element.
    // We don't track id state to keep the bridge tiny; Studio re-asks.
  }, { passive: true });

  // Announce readiness once the DOM is interactive.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { send('bd:ready'); });
  } else {
    send('bd:ready');
  }
})();
`
