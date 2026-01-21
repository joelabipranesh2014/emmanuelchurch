# EmmanEzk Church Website

A modern, bilingual church website built with Astro, featuring sermon management, event listings, prayer requests, and more.

## 🚀 Features

- **Bilingual Support**: English and Tamil translations
- **Sermon Management**: Admin panel to add, edit, and delete sermons with YouTube integration
- **Persistent Storage**: Server-side API for sermon data persistence
- **Prayer Requests**: WhatsApp integration for prayer requests
- **Responsive Design**: Mobile-first, modern UI
- **Performance Optimized**: Static site generation with Astro
- **Component-Based**: Reusable components for maintainability

## 📁 Project Structure

```
/
├── public/                    # Static assets (CSS, JS, translations)
│   ├── style.css             # Global styles
│   ├── script.js             # Main JavaScript functionality
│   ├── sermons-manager.js    # Sermon management logic
│   └── translations.js       # Bilingual translations
├── src/
│   ├── components/           # Reusable Astro components
│   │   ├── Header.astro     # Site header/navigation
│   │   ├── Footer.astro     # Site footer
│   │   └── PrayerModal.astro # Prayer request modal
│   ├── layouts/              # Page layouts
│   │   └── BaseLayout.astro # Base page layout
│   └── pages/                # Route pages (file-based routing)
│       ├── index.astro      # Home page (/)
│       ├── about.astro      # About page (/about)
│       ├── sermons.astro    # Sermons page (/sermons)
│       ├── events.astro     # Events page (/events)
│       ├── admin.astro      # Admin panel (/admin)
│       └── api/             # API routes
│           └── sermons/     # Sermon API endpoints
│               ├── sermons.ts        # GET, POST /api/sermons
│               └── [id].ts           # PUT, DELETE /api/sermons/:id
├── data/                     # Server-side data storage
│   └── sermons.json         # Sermons database (auto-generated)
├── astro.config.mjs         # Astro configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-first-project
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:4321`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run astro` - Run Astro CLI commands

## 📝 Usage

### Adding Sermons

1. Navigate to `/admin` in your browser
2. Fill out the sermon form with:
   - Title (required)
   - Speaker/Pastor (required)
   - Date (required)
   - Series (optional)
   - Description (required)
   - YouTube URL (required)
   - Audio Link (optional)
   - Download Link (optional)
3. Click "Add Sermon"
4. Sermons are automatically saved to the server and persist across sessions

### Managing Sermons

- View all sermons in the "Manage Sermons" tab
- Edit sermons by clicking the "Edit" button
- Delete sermons by clicking the "Delete" button

### API Endpoints

The sermon API provides the following endpoints:

- `GET /api/sermons` - Get all sermons
- `POST /api/sermons` - Create a new sermon
- `PUT /api/sermons/:id` - Update a sermon
- `DELETE /api/sermons/:id` - Delete a sermon

## 🔧 Configuration

### Astro Config (`astro.config.mjs`)

The project uses hybrid mode (`output: 'hybrid'`) to enable:
- Static pre-rendering for regular pages
- Server-side rendering for API routes

### Data Storage

Sermons are stored in `data/sermons.json` on the server. This file is automatically created when the first sermon is added.

**Note**: The `data/` folder is excluded from version control (see `.gitignore`). Make sure to backup this folder for production deployments.

## 🚀 Deployment

### Building for Production

```bash
npm run build
```

The built site will be in the `dist/` folder.

### Deployment Options

This site can be deployed to:

- **Netlify**: Supports Astro with automatic API routes
- **Vercel**: Full support for Astro hybrid mode
- **Cloudflare Pages**: Supports Astro deployments
- **Traditional Hosting**: Requires Node.js support for API routes

**Important**: For API routes to work, you need a hosting provider that supports server-side rendering (SSR). For static-only hosting, you'll need to use a different storage solution (e.g., a database).

## 🎨 Customization

### Adding Translations

Edit `public/translations.js` to add or modify translations for English and Tamil.

### Styling

Main styles are in `public/style.css`. The site uses CSS custom properties (variables) for theming.

### Components

Components in `src/components/` can be customized or extended as needed.

## 📦 Dependencies

- **Astro** (^5.16.11) - Framework for the site
- No other runtime dependencies - vanilla JavaScript

## 🤝 Contributing

1. Make your changes
2. Test locally with `npm run dev`
3. Build and preview with `npm run build && npm run preview`
4. Commit and push your changes

## 📄 License

[Add your license here]

## 🆘 Support

If you encounter any issues:

1. Check the browser console for errors
2. Ensure all dependencies are installed (`npm install`)
3. Verify the data directory exists and is writable
4. Check that the dev server is running properly

---

Built with ❤️ using Astro

