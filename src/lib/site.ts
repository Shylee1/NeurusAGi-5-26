export const SITE = {
  name: 'NeurusAGi',
  url: 'https://neurusagi.com',
  title: 'NeurusAGi - A Quantum Leap in Intelligence',
  description:
    'NeurusAGi is a quantum-powered artificial general intelligence agent built on an artificial superintelligence framework, with reasoning, compliance and enterprise safeguards built in.',
  shortDescription:
    'A quantum-powered artificial general intelligence agent built on an artificial superintelligence framework.',
  founded: '2025',
  logo: '/neurus-logo-bg.jpeg',
  ogImage: '/og-image.png',
  founder: {
    name: 'Jeremy Taylor',
    role: 'Founder and Architect',
    email: 'jt@neurusagi.com',
    bio: 'Jeremy Taylor is the founder and architect of NeurusAGi. A former United States Marine from Oklahoma, he built the first quantum-powered artificial general intelligence agent without a software engineering background, a development team, or venture funding.',
  },
  sameAs: ['https://medium.com/@NeurusAGi.JeremyTaylor'],
  contactEmail: 'jt@neurusagi.com',
  locale: 'en_US',
  keywords: [
    'AGi',
    'artificial general intelligence',
    'NeurusAGi',
    'Jeremy Taylor',
    'quantum AI',
    'artificial superintelligence',
    'enterprise AI',
    'AI safety',
  ],
} as const;

export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE.url).toString();
}

/** Public, indexable routes. Auth-only routes are deliberately excluded. */
export const PUBLIC_ROUTES: { path: string; label: string; priority: number }[] = [
  { path: '/', label: 'Home', priority: 1 },
  { path: '/about', label: 'About', priority: 0.8 },
  { path: '/news', label: 'News and Insights', priority: 0.9 },
  { path: '/early-access', label: 'Request Early Access', priority: 0.9 },
  { path: '/pricing', label: 'Pricing', priority: 0.8 },
  { path: '/investors', label: 'Investors', priority: 0.6 },
  { path: '/contact', label: 'Contact', priority: 0.6 },
];
