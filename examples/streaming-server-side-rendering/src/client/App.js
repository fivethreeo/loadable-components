import React from 'react'
import { ErrorBoundary } from 'react-error-boundary';

// eslint-disable-next-line import/no-extraneous-dependencies
import loadable from '@loadable/component'
import Html from './Html'

const A = loadable(() => import('./letters/A'), { ssrSuspense: true })
const B = loadable(() => import('./letters/B'), { ssrSuspense: true })

const App = ({ assets }) => {
  return (
    <Html assets={assets} title="Hello">
      <React.Suspense fallback="Loading">
        <ErrorBoundary FallbackComponent={Error}>  
          <A />
          <br />
          <B />
        </ErrorBoundary>
      </React.Suspense>
    </Html>
  )
}

function Error({ error }) {
  return (
    <div>
      <h1>Application Error</h1>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{error.stack}</pre>
    </div>
  );
}

export default App
