---
name: web-seo-optimization
description: Maximize SEO and social-sharing readiness for web applications (React, Vite, Next.js, HTML5, or plain static sites) — covers meta tags, Open Graph/Twitter Card previews, JSON-LD structured data (WebApplication & FAQPage schemas for rich search snippets), PWA manifest, sitemap.xml, robots.txt, and semantic HTML/accessibility structure. Trigger whenever the user asks to maximize SEO, improve search visibility or search rankings, add meta tags, fix or add page titles/descriptions, set up Open Graph or social preview images, add structured data or rich snippets, make a web app installable/PWA-ready, add a sitemap or robots.txt, or generally "prepare this for launch/production" or "make this more discoverable" for a web app — even if they don't say the word "SEO" explicitly.
---

# Web Application SEO Optimization Skill

This skill provides a comprehensive, production-ready framework to maximize Search Engine Optimization (SEO) and social sharing previews for web applications.

---

## 1. Primary HTML Metadata (`index.html`)

Every web application must include primary metadata tags, Open Graph tags, Twitter Card tags, canonical links, and theme configurations in the `<head>` element.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Primary Title & Meta Tags -->
    <title>AppName — Clear Value Proposition | Keyword-Rich Subtitle</title>
    <meta name="title" content="AppName — Clear Value Proposition | Keyword-Rich Subtitle" />
    <meta name="description" content="A compelling, 150-160 character description rich with targeted keywords outlining primary application features and user benefits." />
    <meta name="keywords" content="primary keyword, secondary keyword, topic feature, web app, category tag" />
    <meta name="author" content="Author / Organization Name" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#060011" />
    <link rel="canonical" href="https://yourdomain.com/" />

    <!-- Open Graph / Facebook / LinkedIn -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://yourdomain.com/" />
    <meta property="og:title" content="AppName — Clear Value Proposition" />
    <meta property="og:description" content="Engaging summary for social shares explaining what the application does and why users love it." />
    <meta property="og:image" content="https://yourdomain.com/og-image.png" />
    <meta property="og:site_name" content="AppName" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://yourdomain.com/" />
    <meta property="twitter:title" content="AppName — Clear Value Proposition" />
    <meta property="twitter:description" content="Engaging summary optimized for Twitter previews." />
    <meta property="twitter:image" content="https://yourdomain.com/og-image.png" />

    <!-- Favicon & Web Manifest -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/favicon.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 2. JSON-LD Structured Data (Rich Snippets)

Inject Schema.org structured data via `<script type="application/ld+json">` tags to enable rich search result snippets (star ratings, application tags, FAQ acordions in Google Search).

### A. WebApplication & SoftwareApplication Schema
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AppName",
  "alternateName": "Alternate App Name",
  "url": "https://yourdomain.com/",
  "description": "Full application summary outlining main functionalities.",
  "applicationCategory": "LifestyleApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript. Requires HTML5 Canvas.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Feature 1 description",
    "Feature 2 description",
    "Offline capability",
    "Milestone tracking"
  ]
}
```

### B. FAQPage Schema (Displays Q&A directly in Google Search)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is AppName?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AppName is a web application designed to..."
      }
    },
    {
      "@type": "Question",
      "name": "Is AppName free and offline-friendly?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, AppName is completely free and works offline using browser storage."
      }
    }
  ]
}
```

---

## 3. Web Application Manifest (`public/manifest.webmanifest`)

Enables Progressive Web App (PWA) installability, homescreen icons, and boosts Lighthouse PWA & SEO audit scores.

```json
{
  "name": "AppName — Full Title",
  "short_name": "AppName",
  "description": "App description for mobile devices and web app installers.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#060011",
  "theme_color": "#060011",
  "orientation": "any",
  "categories": ["lifestyle", "utilities"],
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

---

## 4. Search Engine Directives (`robots.txt` & `sitemap.xml`)

### `public/robots.txt`
```txt
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

### `public/sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2026-08-08</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

---

## 5. Semantic HTML & Accessibility Architecture

1. **Header Hierarchy**: Ensure every page contains exactly one `<h1>` tag. For full-screen single-page canvas applications, include an accessible visually-hidden `<h1>` tag:
   ```tsx
   <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
     AppName — Primary Heading & Keyword
   </h1>
   ```
2. **HTML5 Semantic Containers**:
   - `<aside aria-label="Control Panel">` for sidebars and tool drawers.
   - `<main aria-label="Main Viewport">` for core interactive areas.
   - `<header>` and `<footer>` where applicable.
3. **Interactive Elements**: Every `<button>` or `<input>` must have visible text or an explicit `aria-label` / `title` attribute.

---

## 6. Implementation Checklist

- [ ] Add primary meta tags, title, description, and keywords to `index.html`.
- [ ] Add Open Graph (`og:*`) and Twitter Card (`twitter:*`) meta tags.
- [ ] Inject JSON-LD `WebApplication` and `FAQPage` schema scripts in `index.html`.
- [ ] Add `public/manifest.webmanifest` and link it in `<head>`.
- [ ] Add `public/robots.txt` and `public/sitemap.xml`.
- [ ] Ensure single `<h1>` per page and wrap containers in `<main>` and `<aside>`.
- [ ] Run production build (`npm run build`) and inspect Lighthouse SEO score.