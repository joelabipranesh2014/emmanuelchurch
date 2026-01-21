import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Use 'server' mode for Vercel deployment
  // This enables API routes while still pre-rendering static pages
  output: 'server',
  adapter: vercel({
    runtime: 'nodejs20.x'
  }),
  site: 'https://emmanezk-church.vercel.app',
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto'
  },
  compressHTML: true,
  vite: {
    build: {
      cssMinify: 'esbuild', // Use esbuild (default) instead of lightningcss
      minify: 'esbuild', // Use esbuild instead of terser (no extra dependency needed)
      // Note: esbuild doesn't support drop_console in the same way, but it's faster
    }
  }
});

