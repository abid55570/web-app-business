import type { TourStep } from './tour'

/**
 * The first-run tour: builds a 5-block landing page for "My App" so the
 * user gets a complete app from scratch in under 5 minutes.
 *
 * Each step targets a specific DOM element via a stable CSS selector.
 * Steps that require user action use `waitFor` to gate the Next button
 * until the action is detected.
 *
 * To run this tour you can later add per-step screenshots, animations,
 * or video clips — for now plain text + spotlight is the MVP.
 */
export const STUDIO_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to b-dash Studio',
    body:
      'In the next 5 minutes you will build a real, deployable landing page from scratch — no code. ' +
      'You can skip this tour any time and come back via the "Take the tour" button.',
    target: null,
    placement: 'center',
    ctaLabel: "Let's go →",
  },
  {
    id: 'top-bar',
    title: 'This is your top bar',
    body:
      'Here you see your block count, last save time, theme picker, viewport switcher, undo/redo, and the big buttons: Save and Render.',
    target: '.studio-top',
    placement: 'bottom',
  },
  {
    id: 'pages-bar',
    title: 'Pages live here',
    body:
      'Right now you have one page called Home. You can add more pages later. Double-click any page tab to rename it.',
    target: '.pages-panel',
    placement: 'bottom',
  },
  {
    id: 'palette',
    title: 'This is the sections palette',
    body:
      'There are 538 ready-made sections grouped by category. Click any one to insert it on your page, or drag it to a specific position.',
    target: '.studio-left',
    placement: 'right',
  },
  {
    id: 'search',
    title: 'Try the search',
    body:
      'Press the / key any time to focus this search box. Type a word like "hero" or "pricing" to filter the palette.',
    target: '.palette-search-input',
    placement: 'right',
  },
  {
    id: 'add-hero',
    title: 'Add your first section',
    body:
      'Click any "Hero" section in the palette below. It will appear on the empty canvas in the middle.',
    target: '.studio-left',
    placement: 'right',
    waitFor: { type: 'dom', selector: '.schematic-block' },
    ctaLabel: 'Waiting for you to click a hero…',
  },
  {
    id: 'canvas',
    title: '🎉 Your first block!',
    body:
      'Great — that block now appears on your canvas. The colored bar matches the section category. Click the block to select it (it gets a blue highlight).',
    target: '.canvas-frame',
    placement: 'left',
  },
  {
    id: 'properties',
    title: 'Edit properties on the right',
    body:
      'When a block is selected, this panel shows every editable field. Change text, colors, images, lists — no JSON, just real inputs.',
    target: '.studio-right',
    placement: 'left',
  },
  {
    id: 'inline-edit',
    title: 'Or click text directly',
    body:
      'You can also click any heading or body text right on the canvas to edit it inline. Try it — click the heading text on your hero block and type something new.',
    target: '.canvas-frame',
    placement: 'left',
  },
  {
    id: 'add-more',
    title: 'Add more sections',
    body:
      'Now add 2-3 more blocks: try a "Feature grid", a "Testimonial quote", and a "CTA" section. Just click each one in the palette.',
    target: '.studio-left',
    placement: 'right',
    waitFor: { type: 'dom', selector: '.schematic-block:nth-child(4)' },
    ctaLabel: 'Waiting for 3 more blocks…',
  },
  {
    id: 'theme',
    title: 'Switch themes',
    body:
      'Click the 🎨 dropdown at the top to try different themes. Your page redesigns instantly across all 75 themes — same structure, totally different look.',
    target: '.topbar-select',
    placement: 'bottom',
  },
  {
    id: 'viewport',
    title: 'Preview mobile / tablet / desktop',
    body:
      'These buttons resize the canvas so you can see how your page looks at different screen sizes.',
    target: '.topbar-viewports',
    placement: 'bottom',
  },
  {
    id: 'save',
    title: 'Save your work',
    body:
      'Press Cmd+S (or Ctrl+S on Windows) to save. Or click the Save button. Your work is now persisted.',
    target: '.studio-top-actions',
    placement: 'left',
  },
  {
    id: 'render',
    title: 'Generate a real app',
    body:
      'Click the ▶ Render button to turn your design into a runnable Next.js + FastAPI app. The wirer composes 137 files in about 30 seconds.',
    target: '.studio-top-actions',
    placement: 'left',
  },
  {
    id: 'done',
    title: "🎉 You're ready",
    body:
      'You now know everything you need to build websites with b-dash. Common next steps: add more pages, invite teammates, try the keyboard shortcuts (press / now to see). ' +
      'You can re-run this tour any time via the "Take the tour" button in the top bar.',
    target: null,
    placement: 'center',
    ctaLabel: 'Start building →',
  },
]
