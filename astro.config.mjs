import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  // Use 'server' mode for Vercel deployment
  // This enables API routes while still pre-rendering static pages
  output: 'server',
  adapter: vercel({
    runtime: 'nodejs20.x'
  }),
  build: {
    assets: 'assets'
  }
});

