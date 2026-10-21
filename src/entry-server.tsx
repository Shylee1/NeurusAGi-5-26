import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { AppRoutes } from './App';
import { articles } from './data/articles';

export { articles };

export interface RenderResult {
  html: string;
  head: string;
  htmlAttributes: string;
  bodyAttributes: string;
}

/**
 * Renders a single route to HTML for the prerender build.
 * The same component tree is used in the browser, so hydration matches.
 */
export function render(url: string): RenderResult {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const html = renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </HelmetProvider>
    </StrictMode>,
  );

  const helmet = helmetContext.helmet;
  const head = helmet
    ? [helmet.title.toString(), helmet.meta.toString(), helmet.link.toString()].join('\n    ')
    : '';

  return {
    html,
    head,
    htmlAttributes: helmet?.htmlAttributes.toString() ?? '',
    bodyAttributes: helmet?.bodyAttributes.toString() ?? '',
  };
}
