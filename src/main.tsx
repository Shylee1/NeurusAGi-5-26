import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container is missing from the document');
}

// Prerendered routes ship real HTML. Hydrate it so crawlers keep what they
// were served and visitors get the interactive app.
if (container.hasChildNodes() && container.innerHTML.trim().length > 0) {
  hydrateRoot(container, <App />);
} else {
  createRoot(container).render(<App />);
}
