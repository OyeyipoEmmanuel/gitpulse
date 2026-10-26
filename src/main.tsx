import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Analytics } from '@vercel/analytics/react'
import { TooltipProvider } from './components/ui/tooltip'

createRoot(document.getElementById('root')!).render(

  <BrowserRouter>
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={180} skipDelayDuration={100}>
          <App />
          <Analytics />
        </TooltipProvider>
      </QueryClientProvider>
    </StrictMode>
  </BrowserRouter>,
)
