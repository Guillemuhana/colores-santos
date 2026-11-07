import { renderToString } from 'react-dom/server'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router'
import { routes } from './routes'
import { headTags, PRERENDER_ROUTES } from './seo'

const handler = createStaticHandler(routes)

export { headTags, PRERENDER_ROUTES }

export async function render(url) {
  const context = await handler.query(new Request(`http://localhost${url}`))
  const router = createStaticRouter(handler.dataRoutes, context)
  return renderToString(<StaticRouterProvider router={router} context={context} hydrate={false} />)
}
