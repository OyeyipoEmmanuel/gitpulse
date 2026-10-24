import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Analytics } from '@vercel/analytics/react'

createRoot(document.getElementById('root')!).render(

  <BrowserRouter>
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <Analytics />
      </QueryClientProvider>
    </StrictMode>
  </BrowserRouter>,
)
