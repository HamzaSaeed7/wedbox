import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { Component } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'

class RootErrorBoundary extends Component {
  state = { crashed: false }
  static getDerivedStateFromError() { return { crashed: true } }
  render() {
    if (this.state.crashed) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, fontFamily: 'sans-serif' }}>
        <h2 style={{ fontSize: 22, margin: 0 }}>Something went wrong</h2>
        <p style={{ color: '#888', margin: 0 }}>Please refresh the page or go back and try again.</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', borderRadius: 8, background: '#38b2ac', color: 'white', border: 0, cursor: 'pointer', fontSize: 14 }}>Refresh</button>
      </div>
    )
    return this.props.children
  }
}

// Session-based auth — send cookies with every request
axios.defaults.withCredentials = true
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

// Pick up CSRF token from the meta tag Laravel injects
const csrfMeta = document.head.querySelector('meta[name="csrf-token"]')
if (csrfMeta) {
  axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfMeta.getAttribute('content')
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

createInertiaApp({
  title: (title) => title ? `${title} | Wedbi` : 'Wedbi',
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true })
    return pages[`./Pages/${name}.tsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <RootErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <App {...props} />
        </QueryClientProvider>
      </RootErrorBoundary>
    )
  },
})
