import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/planner/', '/portfolio/', '/spending/', '/real-estate/', '/goals/', '/settings/', '/api/'],
    },
    sitemap: 'https://monetra.in/sitemap.xml',
  }
}
