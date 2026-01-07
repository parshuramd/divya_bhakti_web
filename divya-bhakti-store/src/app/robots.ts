import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divyabhaktistore.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/account/',
        '/checkout/',
        '/cart/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

