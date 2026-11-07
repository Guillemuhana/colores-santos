import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import { About, Commercial, Contact, NotFound, Residential, SegmentPage, ServicePage, Services } from './pages/Pages'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/residential', element: <Residential /> },
      { path: '/residential/:slug', element: <ServicePage /> },
      { path: '/services', element: <Services /> },
      { path: '/commercial', element: <Commercial /> },
      { path: '/hoa-condominiums', element: <SegmentPage id="hoa" key="hoa" /> },
      { path: '/property-management', element: <SegmentPage id="pm" key="pm" /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
