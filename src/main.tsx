import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-500.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import './theme/tokens.css'
import './theme/global.css'
import { Root } from './app/Root'

// Hash URLs (/Nudge/app/#/settings) so refresh and deep links work on GitHub Pages (tech.md).
// <HashRouter> rather than createHashRouter: same library and URLs, ~14 KB gzipped lighter,
// which keeps first-load JS inside the M1 budget. The prototype needs no data loaders.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Root />
    </HashRouter>
  </StrictMode>,
)
