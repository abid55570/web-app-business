/**
 * Starter templates surfaced in the welcome funnel.
 *
 * Each template is a curated list of blocks (section ids + props)
 * that pre-populates the Studio canvas so the user starts with a
 * real-looking page instead of a blank canvas.
 *
 * The {{brand.appName}} / {{brand.tagline}} tokens get replaced with
 * the user's brand input at apply time (see app/welcome/page.tsx).
 */
export type OnboardingTemplateBlock = {
  blockId: string
  props: Record<string, unknown>
}

export type OnboardingTemplate = {
  id: string
  icon: string
  name: string
  description: string
  /** Recommended for users who… */
  bestFor: string
  blocks: OnboardingTemplateBlock[]
}

export const TEMPLATES: OnboardingTemplate[] = [
  {
    id: 'premium-3d-landing',
    icon: '🌌',
    name: 'Premium 3D landing',
    description: 'Bold animated landing — react-three-fiber hero, scroll-driven 3D, magnetic CTA, marquee testimonials.',
    bestFor: 'Showy launches, design-led products, agencies, premium SaaS',
    blocks: [],
  },
  {
    id: 'landing',
    icon: '🎯',
    name: 'Landing page',
    description: 'A marketing page for a product or service.',
    bestFor: 'SaaS products, startups, mobile apps',
    blocks: [
      { blockId: 'HeroCentered', props: { heading: '{{appName}}', subheading: '{{tagline}}', primaryCtaLabel: 'Get started', primaryCtaHref: '#' } },
      { blockId: 'FeatureGrid3Col', props: { heading: 'Why teams love {{appName}}', features: [
        { icon: '⚡', title: 'Fast setup', description: 'Up and running in minutes.' },
        { icon: '🔒', title: 'Secure by default', description: 'SOC2-ready out of the box.' },
        { icon: '💸', title: 'No surprise bills', description: 'Transparent flat-rate pricing.' },
      ] } },
      { blockId: 'TestimonialSingle', props: { quote: 'We replaced 3 tools with {{appName}}. Genuinely game-changing.', authorName: 'Maya P.', authorRole: 'Head of Product, Acme' } },
      { blockId: 'CtaCentered', props: { heading: 'Ready to try {{appName}}?', primaryCtaLabel: 'Start free trial', primaryCtaHref: '#' } },
      { blockId: 'FooterMinimal', props: { brand: '{{appName}}', copyright: '© 2026 {{appName}}' } },
    ],
  },
  {
    id: 'pricing',
    icon: '💰',
    name: 'Pricing page',
    description: 'A page comparing 3 tiers with FAQ.',
    bestFor: 'SaaS subscriptions, services',
    blocks: [
      { blockId: 'HeroCentered', props: { heading: 'Pricing that scales with you', subheading: 'Start free. Pay only when you grow.' } },
      { blockId: 'PricingTable3Tier', props: { tiers: [
        { name: 'Free', price: '$0', features: ['Up to 3 projects', 'Community support'], ctaLabel: 'Get started' },
        { name: 'Pro', price: '$9/mo', features: ['Unlimited projects', 'Email support', 'Premium themes'], ctaLabel: 'Start trial', highlighted: true },
        { name: 'Agency', price: '$49/mo', features: ['Team seats', 'White-label', 'Priority support'], ctaLabel: 'Talk to sales' },
      ] } },
      { blockId: 'FaqAccordion', props: { heading: 'Common questions', items: [
        { q: 'Can I change plans later?', a: 'Yes — upgrade or downgrade any time.' },
        { q: 'Do you offer a free trial?', a: 'Yes — 14 days, no credit card required.' },
        { q: 'What about refunds?', a: '30-day money-back guarantee on all paid plans.' },
      ] } },
      { blockId: 'FooterMinimal', props: { brand: '{{appName}}' } },
    ],
  },
  {
    id: 'blog',
    icon: '📰',
    name: 'Blog site',
    description: 'Editorial-style blog with featured post + list.',
    bestFor: 'Writers, content creators, news sites',
    blocks: [
      { blockId: 'TopNav', props: { brand: '{{appName}}', links: [{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }] } },
      { blockId: 'BlogHeroFeatured', props: { category: 'Featured', title: 'Welcome to {{appName}}', excerpt: '{{tagline}}', authorName: 'Editorial team', date: 'Today', readMins: 3, imageUrl: 'https://source.unsplash.com/featured/?writing', href: '#' } },
      { blockId: 'BlogPostTeaserList', props: { heading: 'Latest posts', posts: [
        { title: 'How we got started', excerpt: 'The origin story.', date: 'Yesterday', readMins: 4, href: '#' },
        { title: 'Building in public', excerpt: 'Sharing our journey.', date: '3 days ago', readMins: 6, href: '#' },
        { title: 'Lessons from launch', excerpt: 'What we learned.', date: 'Last week', readMins: 8, href: '#' },
      ] } },
      { blockId: 'NewsletterSignup', props: { heading: 'Get new posts in your inbox', placeholder: 'you@example.com', submitLabel: 'Subscribe' } },
    ],
  },
  {
    id: 'todo',
    icon: '✅',
    name: 'Todo app',
    description: 'A simple task-tracking app with auth.',
    bestFor: 'Productivity apps, personal projects',
    blocks: [
      { blockId: 'HeroCentered', props: { heading: '{{appName}}', subheading: '{{tagline}}', primaryCtaLabel: 'Sign in to get started' } },
      { blockId: 'FeatureGrid3Col', props: { heading: 'Stay focused', features: [
        { icon: '✅', title: 'Quick capture', description: 'Add tasks in a single keystroke.' },
        { icon: '🏷', title: 'Smart tags', description: 'Auto-categorize as you type.' },
        { icon: '📊', title: 'Daily review', description: 'See what you got done.' },
      ] } },
      { blockId: 'WelcomeChecklist', props: { heading: 'Get started', items: [
        { title: 'Sign in', description: 'Create your free account.' },
        { title: 'Add your first task', description: 'Press T to quick-add.' },
        { title: 'Tag it', description: 'Press # to add tags.' },
        { title: 'Review tomorrow', description: 'Build the habit.' },
      ] } },
      { blockId: 'FooterMinimal', props: { brand: '{{appName}}' } },
    ],
  },
  {
    id: 'portfolio',
    icon: '👤',
    name: 'Portfolio',
    description: 'Personal site for a designer / developer / artist.',
    bestFor: 'Freelancers, creatives, job-seekers',
    blocks: [
      { blockId: 'HeroBigType', props: { heading: '{{appName}}', subheading: '{{tagline}}' } },
      { blockId: 'AboutCard', props: { name: 'Your Name', role: 'What you do', bio: 'A short paragraph about who you are.' } },
      { blockId: 'MasonryGallery', props: { items: [
        { url: 'https://source.unsplash.com/featured/?design', caption: 'Project one' },
        { url: 'https://source.unsplash.com/featured/?abstract', caption: 'Project two' },
        { url: 'https://source.unsplash.com/featured/?product', caption: 'Project three' },
      ] } },
      { blockId: 'ContactForm', props: { heading: 'Get in touch', emailPlaceholder: 'you@example.com' } },
      { blockId: 'FooterSocial', props: { brand: '{{appName}}' } },
    ],
  },
  {
    id: 'shop',
    icon: '🛍',
    name: 'Online shop',
    description: 'A storefront with products and checkout.',
    bestFor: 'Small businesses, digital goods',
    blocks: [
      { blockId: 'HeroCentered', props: { heading: '{{appName}}', subheading: '{{tagline}}', primaryCtaLabel: 'Shop now' } },
      { blockId: 'ProductGallery', props: { products: [
        { name: 'Product A', price: '$29', imageUrl: 'https://source.unsplash.com/featured/?product' },
        { name: 'Product B', price: '$49', imageUrl: 'https://source.unsplash.com/featured/?store' },
        { name: 'Product C', price: '$99', imageUrl: 'https://source.unsplash.com/featured/?shopping' },
      ] } },
      { blockId: 'TestimonialsCarousel', props: { quotes: [
        { body: 'Great quality, fast shipping.', authorName: 'Sara K.' },
        { body: 'Bought 3 already — recommend to everyone.', authorName: 'Tom L.' },
      ] } },
      { blockId: 'FooterColumns', props: { brand: '{{appName}}' } },
    ],
  },
  {
    id: 'event',
    icon: '📅',
    name: 'Event page',
    description: 'Landing page for a conference / launch / wedding.',
    bestFor: 'Events, launches, single-day gatherings',
    blocks: [
      { blockId: 'HeroCentered', props: { heading: '{{appName}}', subheading: '{{tagline}}', primaryCtaLabel: 'RSVP' } },
      { blockId: 'TimelineCompanyMilestones', props: { heading: 'Schedule', milestones: [
        { year: '9:00', title: 'Doors open', body: 'Coffee + registration' },
        { year: '10:00', title: 'Opening keynote', body: '' },
        { year: '12:00', title: 'Lunch', body: '' },
        { year: '14:00', title: 'Workshops', body: '' },
        { year: '17:00', title: 'Closing party', body: '' },
      ] } },
      { blockId: 'TeamLeadershipGrid', props: { heading: 'Speakers', members: [
        { name: 'Speaker 1', role: 'Talk topic', bio: '' },
        { name: 'Speaker 2', role: 'Talk topic', bio: '' },
        { name: 'Speaker 3', role: 'Talk topic', bio: '' },
      ] } },
      { blockId: 'FooterMinimal', props: { brand: '{{appName}}' } },
    ],
  },
  {
    id: 'blank',
    icon: '➕',
    name: 'Blank canvas',
    description: 'Start from scratch with no blocks.',
    bestFor: 'Power users who know exactly what they want',
    blocks: [],
  },
]
