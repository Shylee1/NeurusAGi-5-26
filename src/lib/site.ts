export const SITE_URL = 'https://neurusagi.com';
export const SITE_NAME = 'NeurusAGi';

export interface PageDef {
  path: string;
  name: string;
  title: string;
  description: string;
  indexable: boolean;
  h1: string;
  summary: string;
  faqs?: { q: string; a: string }[];
}

const faq = (extra: {q:string;a:string}[] = []) => [
  { q: 'What is NeurusAGi?', a: 'NeurusAGi is an enterprise-grade artificial general intelligence (AGi) platform delivering advanced reasoning, compliance, and innovation for organizations.' },
  ...extra,
];

export const PAGES: PageDef[] = [
  { path: '/', name: 'Home', title: 'NeurusAGi — A Quantum Leap in Intelligence', description: 'Experience the next evolution of artificial general intelligence. NeurusAGi delivers enterprise-grade AGi capabilities with advanced reasoning, compliance, and innovation.', indexable: true, h1: 'NeurusAGi — A Quantum Leap in Intelligence', summary: 'NeurusAGi is an enterprise-grade artificial general intelligence platform delivering advanced reasoning, compliance, and innovation.', faqs: faq() },
  { path: '/about', name: 'About', title: 'About NeurusAGi — Our Mission & Vision', description: 'Learn about NeurusAGi: founded by Jeremy Taylor to build the first true AGi — its mission, vision, technology, and the team behind a quantum leap in intelligence.', indexable: true, h1: 'About NeurusAGi', summary: 'About NeurusAGi, founded by Jeremy Taylor: mission, vision, and the technology behind the first true AGi.', faqs: faq([{ q: 'Who founded NeurusAGi?', a: 'NeurusAGi was founded by Jeremy Taylor.' }]) },
  { path: '/news', name: 'News', title: 'News & Insights — NeurusAGi', description: 'NeurusAGi news and insights: articles by Jeremy Taylor exploring artificial general intelligence, innovation, and the future of intelligent systems.', indexable: true, h1: 'News & Insights', summary: 'Articles by Jeremy Taylor exploring artificial general intelligence, innovation, and the future.', faqs: faq() },
  { path: '/pricing', name: 'Pricing', title: 'Pricing — NeurusAGi Plans', description: 'NeurusAGi pricing plans for individuals, teams, and enterprise AGi deployments. Compare tiers, features, and get started today.', indexable: true, h1: 'NeurusAGi Pricing', summary: 'Pricing plans for individuals, teams, and enterprise NeurusAGi AGi deployments.', faqs: faq([{ q: 'How do I get started with NeurusAGi?', a: 'Choose a plan on the Pricing page (/pricing) or create an account on the Sign Up page (/signup).' }]) },
  { path: '/investors', name: 'Investors', title: 'Investors — NeurusAGi', description: 'Investor information for NeurusAGi: the AGi market opportunity, company vision, and how to submit an investor inquiry.', indexable: true, h1: 'Invest in NeurusAGi', summary: 'Investor information, market opportunity, and investor inquiry contact for NeurusAGi.', faqs: faq([{ q: 'How can investors contact NeurusAGi?', a: 'Submit an inquiry on the Investors page (/investors) or the Contact page (/contact).' }]) },
  { path: '/contact', name: 'Contact', title: 'Contact NeurusAGi', description: 'Contact NeurusAGi for general, media, and support inquiries, or to talk with our team about enterprise AGi.', indexable: true, h1: 'Contact NeurusAGi', summary: 'Contact NeurusAGi for general, media, support, and enterprise inquiries.', faqs: faq([{ q: 'How do I contact NeurusAGi?', a: 'Use the contact form on /contact or email jt@neurusagi.com.' }]) },
  { path: '/presale', name: 'Pre-Sale', title: 'Pre-Sale — NeurusAGi', description: 'Join the NeurusAGi pre-sale for early access to the next evolution of artificial general intelligence.', indexable: true, h1: 'NeurusAGi Pre-Sale', summary: 'Early-access pre-sale for NeurusAGi.', faqs: faq() },
  { path: '/login', name: 'Login', title: 'Login — NeurusAGi', description: 'Sign in to your NeurusAGi account.', indexable: false, h1: 'Welcome Back', summary: 'Sign in to your NeurusAGi account.' },
  { path: '/signup', name: 'Sign Up', title: 'Create Account — NeurusAGi', description: 'Create your NeurusAGi account and get started with enterprise-grade AGi.', indexable: false, h1: 'Create Your NeurusAGi Account', summary: 'Create a NeurusAGi account.' },
  { path: '/onboarding', name: 'Onboarding', title: 'Onboarding — NeurusAGi', description: 'Complete your NeurusAGi onboarding.', indexable: false, h1: 'NeurusAGi Onboarding', summary: 'Complete your NeurusAGi onboarding.' },
  { path: '/dashboard', name: 'Dashboard', title: 'Dashboard — NeurusAGi', description: 'Your NeurusAGi dashboard.', indexable: false, h1: 'NeurusAGi Dashboard', summary: 'Your NeurusAGi dashboard. Login required.' },
  { path: '/admin', name: 'Executive Admin', title: 'Executive Admin Dashboard — NeurusAGi', description: 'NeurusAGi executive administration dashboard.', indexable: false, h1: 'Admin Dashboard', summary: 'Executive administration dashboard. Authorized administrators only.' },
  { path: '/change-password', name: 'Change Password', title: 'Change Password — NeurusAGi', description: 'Change your NeurusAGi password.', indexable: false, h1: 'Change Password', summary: 'Change your password. Login required.' },
];

export const pageByPath = (p: string) => PAGES.find(x => x.path === p) ?? PAGES[0];
export const canonicalFor = (p: string) => (p === '/' ? `${SITE_URL}/` : `${SITE_URL}${p}`);
