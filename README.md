# Digishare Documentation

> Official API documentation for the Digishare Platform

This repository contains the documentation for the Digishare ecosystem, built with [Docus](https://docus.dev) and Nuxt 4.

> [!TIP]
> If you're looking for the main platform code, check the other repositories in the workspace.

## ✨ Features

- 🎨 **Beautiful Design** - Clean, modern documentation theme with dark mode
- 🌐 **Multilingual** - Full support for English and French
- 🧪 **API Playground** - Interactive API testing directly in the docs
- 📱 **Responsive** - Mobile-first responsive design
- 🔍 **Search** - Full-text search functionality
- 🚀 **Performance** - Fast static generation with GitHub Pages deployment

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun dev
```

Your documentation site will be running at `http://localhost:3000`

## 📁 Project Structure

```
digishare-docs/
├── content/
│   ├── en/                    # English content
│   │   ├── 1.overview/        # Platform overview
│   │   ├── 2.developer-guides/
│   │   │   ├── 1.authentication.md
│   │   │   ├── 3.livechat/
│   │   │   ├── 4.campaigns/
│   │   │   └── 5.thirds/
│   │   │       └── 1.custom-fields.md
│   │   └── 3.use-cases/
│   └── fr/                    # French content (mirrored structure)
├── components/
│   └── content/
│       └── ApiPlayground.vue  # Interactive API component
├── i18n/
│   └── locales/
│       ├── en.json
│       └── fr.json
├── public/                    # Static assets
└── nuxt.config.ts
```

## 🧩 Components

### ApiPlayground

An interactive API testing component that provides:

- 🔧 **Editable Variables** - Path and environment variables
- 📝 **Editable Headers** - With password toggle for sensitive values
- 📋 **JSON Body Editor** - With validation and format button
- 🌐 **Multi-language Snippets** - cURL, JavaScript, Python, PHP, Go
- ✅ **Live Response** - Execute requests directly from the browser

**Usage in Markdown:**

```markdown
::api-playground{
method="POST"
url="https://api.digishare.ma/v1/endpoint/{id}"
description="Description of the endpoint"
:variables='{"id": "123", "token": "YOUR_TOKEN"}'
:headers='{"Authorization": "Bearer {token}"}'
:body='{"key": "value"}'
}
::
```

## ⚡ Built with

- [Nuxt 4](https://nuxt.com) - The Vue.js Framework
- [Nuxt Content](https://content.nuxt.com/) - Document-driven mode
- [Nuxt UI](https://ui.nuxt.com) - UI component library
- [Nuxt I18n](https://i18n.nuxtjs.org/) - Internationalization
- [Docus](https://docus.dev) - Documentation theme

## 📖 Writing Documentation

Write your content in Markdown in the `content/{locale}/` directory.

### File Naming Convention

- Use numeric prefixes for ordering: `1.overview/`, `2.guides/`
- Use `.navigation.yml` for section configuration
- Keep structure mirrored between `en/` and `fr/`

### MDC Components

```markdown
::note
This is a note block
::

::tip
This is a tip block
::

::warning
This is a warning block
::

::card-group
::card{title="Title" icon="i-mdi-star" to="/path"}
Description text
::
::
```

## 🚀 Deployment

Build for production:

```bash
bun run build
```

The site is automatically deployed to GitHub Pages on push to `main`.

**Live URL:** [https://digishareinc.github.io/docs/](https://digishareinc.github.io/docs/)

## 🔧 Development

```bash
# Type check
bun run typecheck

# Generate static site
bun run generate

# Preview production build
bun run preview
```

## 📄 License

[MIT License](https://opensource.org/licenses/MIT)

---

Made with ❤️ by the Digishare Team
