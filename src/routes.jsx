import Layout from './components/Layout'
import Home from './pages/Home'
import { About, Commercial, CommercialPaintingPage, Contact, NotFound, Residential, SegmentPage, ServicePage, Services } from './pages/Pages'

export const routes = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/residential', element: <Residential /> },
      { path: '/residential/:slug', element: <ServicePage /> },
      { path: '/services', element: <Services /> },
      { path: '/commercial', element: <Commercial /> },
      { path: '/commercial/:slug', element: <CommercialPaintingPage /> },
      { path: '/hoa-condominiums', element: <SegmentPage id="hoa" key="hoa" /> },
      { path: '/property-management', element: <SegmentPage id="pm" key="pm" /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]
