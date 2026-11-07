import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import { routes } from './routes'

const router = createBrowserRouter(routes)

// The HTML is prerendered for search engines (scripts/prerender.js); the app
// then mounts fresh on top of it so all entrance animations still play.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
